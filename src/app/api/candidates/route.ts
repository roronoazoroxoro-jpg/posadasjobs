import { NextResponse } from "next/server";
import { parseJsonArray } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";

  const candidates = await prisma.candidateProfile.findMany({
    where: q
      ? {
          OR: [
            { headline: { contains: q } },
            { skills: { contains: q } },
            { bio: { contains: q } },
            { user: { name: { contains: q } } },
          ],
        }
      : undefined,
    include: { user: { select: { name: true, email: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    candidates: candidates.map((c) => ({
      id: c.id,
      name: c.user.name,
      headline: c.headline,
      bio: c.bio,
      skills: parseJsonArray(c.skills),
      location: c.location,
      availability: c.availability,
      education: c.education,
    })),
  });
}
