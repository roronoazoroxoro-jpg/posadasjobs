import { NextResponse } from "next/server";
import { forbidden, getSessionUser, parseJsonArray, parseProjects, toMatchCandidate, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unreadCount } from "@/lib/conversations";
import { matchScore } from "@/lib/match";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const unread = await unreadCount(user);

  if (user.candidate) {
    const c = user.candidate;
    const [applications, conversations, jobs] = await Promise.all([
      prisma.application.groupBy({ by: ["status"], where: { candidateId: c.id }, _count: true }),
      prisma.conversation.count({ where: { candidateId: c.id } }),
      prisma.job.findMany({
        where: { status: "OPEN", applications: { none: { candidateId: c.id } } },
        include: { company: { select: { id: true, companyName: true } } },
        take: 200,
      }),
    ]);
    const me = toMatchCandidate(c);
    const recommended = jobs
      .map((j) => {
        const skills = parseJsonArray(j.skills);
        return {
          id: j.id,
          title: j.title,
          company: j.company,
          modality: j.modality,
          skills,
          match: matchScore(me, { title: j.title, description: j.description, requirements: j.requirements, skills }),
        };
      })
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 4);

    const byStatus = Object.fromEntries(applications.map((a) => [a.status, a._count]));
    const filled = [c.headline, c.bio, c.experience, c.education, c.phone, c.photoUrl, c.cvText || c.cvFileUrl].filter(Boolean).length;
    const completeness = Math.round(
      ((filled + (parseJsonArray(c.skills).length >= 3 ? 1 : 0) + (parseProjects(c.projects).length ? 1 : 0)) / 9) * 100,
    );

    return NextResponse.json({
      role: "CANDIDATE",
      views: c.views,
      cvViews: c.cvViews,
      applications: Object.values(byStatus).reduce((s, n) => s + n, 0),
      byStatus,
      conversations,
      unread,
      completeness,
      recommended,
    });
  }

  if (user.company) {
    const [jobs, candidates, conversations] = await Promise.all([
      prisma.job.findMany({
        where: { companyId: user.company.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.candidateProfile.findMany({ include: { user: { select: { name: true } } }, take: 300 }),
      prisma.conversation.count({ where: { companyId: user.company.id } }),
    ]);

    const openJobs = jobs.filter((j) => j.status === "OPEN");
    const suggestions = openJobs.slice(0, 3).map((j) => {
      const skills = parseJsonArray(j.skills);
      const top = candidates
        .map((c) => ({
          id: c.id,
          name: c.user.name,
          headline: c.headline,
          photoUrl: c.photoUrl,
          match: matchScore(toMatchCandidate(c), { title: j.title, description: j.description, requirements: j.requirements, skills }),
        }))
        .filter((c) => c.match.score >= 30)
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 3);
      return { jobId: j.id, jobTitle: j.title, candidates: top };
    });

    return NextResponse.json({
      role: "COMPANY",
      jobs: jobs.map((j) => ({ id: j.id, title: j.title, status: j.status, views: j.views, applications: j._count.applications })),
      totalViews: jobs.reduce((s, j) => s + j.views, 0),
      totalApplications: jobs.reduce((s, j) => s + j._count.applications, 0),
      openJobs: openJobs.length,
      conversations,
      unread,
      suggestions,
    });
  }

  return forbidden();
}
