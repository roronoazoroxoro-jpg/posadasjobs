import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = ["", "/empleos", "/empresas", "/talentos", "/registro", "/login"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === "" || p === "/empleos" ? "daily" : "weekly",
    priority: p === "" ? 1 : p === "/empleos" ? 0.9 : 0.6,
  }));

  try {
    const [jobs, companies, candidates] = await Promise.all([
      prisma.job.findMany({ where: { status: "OPEN" }, select: { id: true, updatedAt: true } }),
      prisma.companyProfile.findMany({ select: { id: true, updatedAt: true } }),
      prisma.candidateProfile.findMany({ select: { id: true, updatedAt: true } }),
    ]);
    return [
      ...staticRoutes,
      ...jobs.map((j) => ({ url: `${SITE_URL}/empleos/${j.id}`, lastModified: j.updatedAt, changeFrequency: "daily" as const, priority: 0.8 })),
      ...companies.map((c) => ({ url: `${SITE_URL}/empresas/${c.id}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.5 })),
      ...candidates.map((c) => ({ url: `${SITE_URL}/talentos/${c.id}`, lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ];
  } catch {
    return staticRoutes;
  }
}
