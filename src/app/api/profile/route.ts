import { NextResponse } from "next/server";
import { forbidden, getSessionUser, publicUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  return NextResponse.json({ user: publicUser(user) });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : user.name;
  await prisma.user.update({ where: { id: user.id }, data: { name } });

  if (user.role === "CANDIDATE" && user.candidate) {
    const skills = Array.isArray(body.skills)
      ? body.skills.map(String)
      : typeof body.skills === "string"
        ? body.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined;

    await prisma.candidateProfile.update({
      where: { id: user.candidate.id },
      data: {
        headline: str(body.headline, user.candidate.headline),
        bio: str(body.bio, user.candidate.bio),
        experience: str(body.experience, user.candidate.experience),
        education: str(body.education, user.candidate.education),
        location: str(body.location, user.candidate.location),
        phone: str(body.phone, user.candidate.phone),
        cvText: str(body.cvText, user.candidate.cvText),
        linkedin: str(body.linkedin, user.candidate.linkedin),
        portfolio: str(body.portfolio, user.candidate.portfolio),
        availability: str(body.availability, user.candidate.availability),
        ...(skills ? { skills: JSON.stringify(skills) } : {}),
      },
    });
  } else if (user.role === "COMPANY" && user.company) {
    await prisma.companyProfile.update({
      where: { id: user.company.id },
      data: {
        companyName: str(body.companyName, user.company.companyName),
        description: str(body.description, user.company.description),
        industry: str(body.industry, user.company.industry),
        website: str(body.website, user.company.website),
        location: str(body.location, user.company.location),
        phone: str(body.phone, user.company.phone),
        size: str(body.size, user.company.size),
      },
    });
  } else {
    return forbidden();
  }

  const refreshed = await getSessionUser();
  return NextResponse.json({ user: refreshed ? publicUser(refreshed) : null });
}

function str(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}
