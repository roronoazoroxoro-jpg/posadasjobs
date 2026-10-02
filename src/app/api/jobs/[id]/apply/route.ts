import { NextResponse } from "next/server";
import { forbidden, getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user?.candidate) return forbidden("Solo candidatos pueden postularse.");
  const { id } = await ctx.params;

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.status !== "OPEN") {
    return NextResponse.json({ error: "Este empleo no acepta postulaciones" }, { status: 400 });
  }

  const existing = await prisma.application.findUnique({
    where: { jobId_candidateId: { jobId: id, candidateId: user.candidate.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya te postulaste a este empleo" }, { status: 409 });
  }

  let coverLetter = "";
  try {
    const body = (await request.json()) as { coverLetter?: string };
    coverLetter = body.coverLetter?.trim() || "";
  } catch {
    /* optional body */
  }

  const application = await prisma.application.create({
    data: {
      jobId: id,
      candidateId: user.candidate.id,
      coverLetter,
      status: "PENDING",
    },
  });

  return NextResponse.json({ application }, { status: 201 });
}
