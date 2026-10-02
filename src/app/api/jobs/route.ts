import { NextResponse } from "next/server";
import { getSessionUser, parseJsonArray, unauthorized, forbidden } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serializeJob(job: {
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
  createdAt: Date;
  company: { id: string; companyName: string; industry: string; location: string; description?: string };
  _count?: { applications: number };
}) {
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
    skills: parseJsonArray(job.skills),
    status: job.status,
    createdAt: job.createdAt.toISOString(),
    company: job.company,
    applicationsCount: job._count?.applications ?? undefined,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const modality = searchParams.get("modality") || "";
  const type = searchParams.get("type") || "";
  const mine = searchParams.get("mine") === "1";

  if (mine) {
    const user = await getSessionUser();
    if (!user?.company) return unauthorized();
    const jobs = await prisma.job.findMany({
      where: { companyId: user.company.id },
      include: {
        company: { select: { id: true, companyName: true, industry: true, location: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ jobs: jobs.map(serializeJob) });
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

  return NextResponse.json({ jobs: jobs.map(serializeJob) });
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

  const job = await prisma.job.create({
    data: {
      companyId: user.company.id,
      title,
      description,
      requirements: String(body.requirements || ""),
      location: String(body.location || user.company.location || "Posadas, Misiones"),
      type: String(body.type || "FULL_TIME"),
      modality: String(body.modality || "PRESENCIAL"),
      salaryMin: body.salaryMin ? Number(body.salaryMin) : null,
      salaryMax: body.salaryMax ? Number(body.salaryMax) : null,
      skills: JSON.stringify(skills),
      status: "OPEN",
    },
    include: {
      company: { select: { id: true, companyName: true, industry: true, location: true } },
    },
  });

  return NextResponse.json({ job: serializeJob(job) }, { status: 201 });
}
