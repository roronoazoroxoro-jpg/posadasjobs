import { NextResponse } from "next/server";
import { forbidden, getSessionUser, parseJsonArray, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (user.role === "CANDIDATE" && user.candidate) {
    const applications = await prisma.application.findMany({
      where: { candidateId: user.candidate.id },
      include: {
        job: {
          include: { company: { select: { id: true, companyName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      applications: applications.map((a) => ({
        id: a.id,
        status: a.status,
        coverLetter: a.coverLetter,
        createdAt: a.createdAt.toISOString(),
        job: {
          id: a.job.id,
          title: a.job.title,
          location: a.job.location,
          status: a.job.status,
          company: a.job.company,
        },
      })),
    });
  }

  if (user.role === "COMPANY" && user.company) {
    const applications = await prisma.application.findMany({
      where: {
        job: { companyId: user.company.id },
        ...(jobId ? { jobId } : {}),
      },
      include: {
        job: { select: { id: true, title: true } },
        candidate: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      applications: applications.map((a) => ({
        id: a.id,
        status: a.status,
        coverLetter: a.coverLetter,
        createdAt: a.createdAt.toISOString(),
        job: a.job,
        candidate: {
          id: a.candidate.id,
          name: a.candidate.user.name,
          email: a.candidate.user.email,
          headline: a.candidate.headline,
          skills: parseJsonArray(a.candidate.skills),
          location: a.candidate.location,
          phone: a.candidate.phone,
          cvText: a.candidate.cvText,
          availability: a.candidate.availability,
        },
      })),
    });
  }

  return forbidden();
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user?.company) return forbidden("Solo empresas pueden actualizar postulaciones.");

  let body: { id?: string; status?: string };
  try {
    body = (await request.json()) as { id?: string; status?: string };
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const allowed = ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"];
  if (!body.id || !body.status || !allowed.includes(body.status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const app = await prisma.application.findUnique({
    where: { id: body.id },
    include: { job: true },
  });
  if (!app || app.job.companyId !== user.company.id) return forbidden();

  const updated = await prisma.application.update({
    where: { id: body.id },
    data: { status: body.status },
  });

  return NextResponse.json({ application: updated });
}
