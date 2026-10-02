import { NextResponse } from "next/server";
import { parseJsonArray, parseProjects } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const skill = searchParams.get("skill")?.trim() || "";
  const featured = searchParams.get("featured") === "1";

  const candidates = await prisma.candidateProfile.findMany({
    where: {
      ...(featured ? { featured: true } : {}),
      ...(q || skill
        ? {
            AND: [
              ...(q
                ? [
                    {
                      OR: [
                        { headline: { contains: q } },
                        { skills: { contains: q } },
                        { bio: { contains: q } },
                        { projects: { contains: q } },
                        { user: { name: { contains: q } } },
                      ],
                    },
                  ]
                : []),
              ...(skill ? [{ skills: { contains: skill } }] : []),
            ],
          }
        : {}),
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json({
    candidates: candidates.map((c) => ({
      id: c.id,
      name: c.user.name,
      email: c.user.email,
      headline: c.headline,
      bio: c.bio,
      skills: parseJsonArray(c.skills),
      location: c.location,
      availability: c.availability,
      education: c.education,
      photoUrl: c.photoUrl,
      projects: parseProjects(c.projects),
      languages: parseJsonArray(c.languages),
      featured: c.featured,
      portfolio: c.portfolio,
      phone: c.phone,
    })),
  });
}
