import { NextResponse } from "next/server";
import { parseJsonArray } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const company = await prisma.companyProfile.findUnique({
    where: { id },
    include: {
      jobs: {
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!company) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });

  return NextResponse.json({
    company: {
      id: company.id,
      companyName: company.companyName,
      description: company.description,
      industry: company.industry,
      website: company.website,
      location: company.location,
      phone: company.phone,
      size: company.size,
      jobs: company.jobs.map((j) => ({
        id: j.id,
        title: j.title,
        description: j.description,
        location: j.location,
        type: j.type,
        modality: j.modality,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        skills: parseJsonArray(j.skills),
        createdAt: j.createdAt.toISOString(),
        company: { id: company.id, companyName: company.companyName, industry: company.industry },
      })),
    },
  });
}
