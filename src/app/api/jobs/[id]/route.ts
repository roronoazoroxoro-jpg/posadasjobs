import { NextResponse } from "next/server";
import { forbidden, getSessionUser, parseJsonArray, toMatchCandidate, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { matchScore } from "@/lib/match";
import { zoneCoords } from "@/lib/zones";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  });
  if (!job) return NextResponse.json({ error: "Empleo no encontrado" }, { status: 404 });

  const user = await getSessionUser();
  let alreadyApplied = false;
  if (user?.candidate) {
    const app = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: id, candidateId: user.candidate.id } },
    });
    alreadyApplied = Boolean(app);
  }

  const isOwner = user?.company?.id === job.companyId;
  if (!isOwner) {
    await prisma.job.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => undefined);
  }

  const skills = parseJsonArray(job.skills);
  const coords = job.lat != null && job.lng != null ? { lat: job.lat, lng: job.lng } : zoneCoords(job.zone);
  const match = user?.candidate
    ? matchScore(toMatchCandidate(user.candidate), {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        skills,
      })
    : null;

  return NextResponse.json({
    match,
    job: {
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
      views: job.views + (isOwner ? 0 : 1),
      createdAt: job.createdAt.toISOString(),
      applicationsCount: job._count.applications,
      company: {
        id: job.company.id,
        companyName: job.company.companyName,
        description: job.company.description,
        industry: job.company.industry,
        website: job.company.website,
        location: job.company.location,
        size: job.company.size,
      },
    },
    alreadyApplied,
  });
}

export async function PUT(request: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user?.company) return unauthorized();
  const { id } = await ctx.params;

  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing || existing.companyId !== user.company.id) return forbidden();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const skills = Array.isArray(body.skills)
    ? body.skills.map(String)
    : typeof body.skills === "string"
      ? body.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : parseJsonArray(existing.skills);

  const job = await prisma.job.update({
    where: { id },
    data: {
      title: typeof body.title === "string" ? body.title : existing.title,
      description: typeof body.description === "string" ? body.description : existing.description,
      requirements: typeof body.requirements === "string" ? body.requirements : existing.requirements,
      location: typeof body.location === "string" ? body.location : existing.location,
      type: typeof body.type === "string" ? body.type : existing.type,
      modality: typeof body.modality === "string" ? body.modality : existing.modality,
      salaryMin: body.salaryMin !== undefined ? (body.salaryMin ? Number(body.salaryMin) : null) : existing.salaryMin,
      salaryMax: body.salaryMax !== undefined ? (body.salaryMax ? Number(body.salaryMax) : null) : existing.salaryMax,
      status: typeof body.status === "string" ? body.status : existing.status,
      skills: JSON.stringify(skills),
      ...(typeof body.zone === "string"
        ? (() => {
            const z = zoneCoords(body.zone);
            return { zone: z.name, lat: z.lat, lng: z.lng };
          })()
        : {}),
    },
    include: {
      company: { select: { id: true, companyName: true, industry: true, location: true } },
    },
  });

  return NextResponse.json({
    job: {
      ...job,
      skills: parseJsonArray(job.skills),
      createdAt: job.createdAt.toISOString(),
    },
  });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user?.company) return unauthorized();
  const { id } = await ctx.params;
  const existing = await prisma.job.findUnique({ where: { id } });
  if (!existing || existing.companyId !== user.company.id) return forbidden();
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
