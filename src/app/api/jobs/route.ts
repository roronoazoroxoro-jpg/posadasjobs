import { NextResponse } from "next/server";
import { getSessionUser, parseJsonArray, unauthorized, forbidden, toMatchCandidate } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { matchScore, type MatchCandidate } from "@/lib/match";
import { zoneCoords } from "@/lib/zones";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type JobRow = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  modality: string;
  salaryMin: number | null;
  salaryMax: number | null;
  skills: string;
  status: string;
  zone: string;
  lat: number | null;
  lng: number | null;
  views: number;
  createdAt: Date;
  company: { id: string; companyName: string; industry: string; location: string; description?: string };
  _count?: { applications: number };
};

function serializeJob(job: JobRow, candidate?: MatchCandidate | null) {
  const skills = parseJsonArray(job.skills);
  const coords = job.lat != null && job.lng != null ? { lat: job.lat, lng: job.lng } : zoneCoords(job.zone);
  return {
    id: job.id,
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    location: job.location,
    type: job.type,
    modality: job.modality,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    skills,
    status: job.status,
    zone: job.zone,
    lat: coords.lat,
    lng: coords.lng,
    views: job.views,
    createdAt: job.createdAt.toISOString(),
    company: job.company,
    applicationsCount: job._count?.applications ?? undefined,
    match: candidate
      ? matchScore(candidate, { title: job.title, description: job.description, requirements: job.requirements, skills })
      : undefined,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const modality = searchParams.get("modality") || "";
  const type = searchParams.get("type") || "";
  const mine = searchParams.get("mine") === "1";
  const sort = searchParams.get("sort") || "";

  const user = await getSessionUser();

  if (mine) {
    if (!user?.company) return unauthorized();
    const jobs = await prisma.job.findMany({
      where: { companyId: user.company.id },
      include: {
        company: { select: { id: true, companyName: true, industry: true, location: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ jobs: jobs.map((j) => serializeJob(j)) });
  }

  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
      ...(modality ? { modality } : {}),
      ...(type ? { type } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { description: { contains: q } },
              { skills: { contains: q } },
              { zone: { contains: q } },
              { company: { companyName: { contains: q } } },
            ],
          }
        : {}),
    },
    include: {
      company: { select: { id: true, companyName: true, industry: true, location: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const candidate = user?.candidate ? toMatchCandidate(user.candidate) : null;
  const result = jobs.map((j) => serializeJob(j, candidate));
  if (sort === "match" && candidate) {
    result.sort((a, b) => (b.match?.score ?? 0) - (a.match?.score ?? 0));
  }

  return NextResponse.json({ jobs: result, personalized: Boolean(candidate) });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.company) return forbidden("Solo empresas pueden publicar empleos.");

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  if (!title || !description) {
    return NextResponse.json({ error: "Título y descripción son obligatorios" }, { status: 400 });
  }

  const skills = Array.isArray(body.skills)
    ? body.skills.map(String)
    : String(body.skills || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const zone = zoneCoords(typeof body.zone === "string" ? body.zone : "Centro");

  const job = await prisma.job.create({
    data: {
      companyId: user.company.id,
      title: title.slice(0, 140),
      description: description.slice(0, 5000),
      requirements: String(body.requirements || "").slice(0, 3000),
      location: String(body.location || user.company.location || "Posadas, Misiones"),
      type: String(body.type || "FULL_TIME"),
      modality: String(body.modality || "PRESENCIAL"),
      salaryMin: body.salaryMin ? Number(body.salaryMin) : null,
      salaryMax: body.salaryMax ? Number(body.salaryMax) : null,
      skills: JSON.stringify(skills.slice(0, 20)),
      zone: zone.name,
      lat: zone.lat,
      lng: zone.lng,
      status: "OPEN",
    },
    include: {
      company: { select: { id: true, companyName: true, industry: true, location: true } },
    },
  });

  return NextResponse.json({ job: serializeJob(job) }, { status: 201 });
}
