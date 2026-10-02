import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const companies = await prisma.companyProfile.findMany({
    include: {
      _count: { select: { jobs: { where: { status: "OPEN" } } } },
      user: { select: { name: true } },
    },
    orderBy: { companyName: "asc" },
  });

  return NextResponse.json({
    companies: companies.map((c) => ({
      id: c.id,
      companyName: c.companyName,
      description: c.description,
      industry: c.industry,
      website: c.website,
      location: c.location,
      size: c.size,
      openJobs: c._count.jobs,
      contactName: c.user.name,
    })),
  });
}
