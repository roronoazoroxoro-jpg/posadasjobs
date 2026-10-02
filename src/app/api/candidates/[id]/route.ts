import { NextResponse } from "next/server";
import { getSessionUser, parseJsonArray, parseProjects } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!candidate) return NextResponse.json({ error: "Talento no encontrado" }, { status: 404 });

  const viewer = await getSessionUser();
  const isSelf = viewer?.candidate?.id === candidate.id;
  if (!isSelf) {
    await prisma.candidateProfile
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => undefined);
  }

  let conversationId: string | null = null;
  if (viewer?.company) {
    const conv = await prisma.conversation.findUnique({
      where: { companyId_candidateId: { companyId: viewer.company.id, candidateId: candidate.id } },
      select: { id: true },
    });
    conversationId = conv?.id ?? null;
  }

  return NextResponse.json({
    conversationId,
    candidate: {
      id: candidate.id,
      name: candidate.user.name,
      email: candidate.user.email,
      headline: candidate.headline,
      bio: candidate.bio,
      skills: parseJsonArray(candidate.skills),
      experience: candidate.experience,
      education: candidate.education,
      location: candidate.location,
      phone: candidate.phone,
      cvText: candidate.cvText,
      linkedin: candidate.linkedin,
      portfolio: candidate.portfolio,
      availability: candidate.availability,
      photoUrl: candidate.photoUrl,
      projects: parseProjects(candidate.projects),
      languages: parseJsonArray(candidate.languages),
      featured: candidate.featured,
      cvFileUrl: candidate.cvFileUrl,
      cvFileName: candidate.cvFileName,
      cvPreviews: parseJsonArray(candidate.cvPreviews),
      views: candidate.views + (isSelf ? 0 : 1),
    },
  });
}
