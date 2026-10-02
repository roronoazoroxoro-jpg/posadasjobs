import { NextResponse } from "next/server";
import { parseJsonArray } from "@/lib/auth";
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

  return NextResponse.json({
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
    },
  });
}
