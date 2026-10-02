import { JOB_TYPES, MODALITIES, formatSalary, timeAgo } from "@/lib/format";
import { Badge } from "./ui";
import Link from "next/link";
import { ArrowUpRight, Briefcase, MapPin } from "lucide-react";
import { MatchBadge, type MatchInfo } from "./Match";

export type JobCardData = {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  modality: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skills: string[];
  createdAt: string;
  company: { id: string; companyName: string; industry?: string };
  zone?: string;
  lat?: number;
  lng?: number;
  match?: MatchInfo;
};

export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link
      href={`/empleos/${job.id}`}
      className="group relative block h-full overflow-hidden rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-river-200 hover:shadow-glow"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-forest-500 to-river-500 transition-transform duration-500 group-hover:scale-x-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-forest-500 to-river-600 font-display text-lg font-bold text-white shadow-soft transition duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
            {job.company.companyName.slice(0, 1)}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-river-600">{job.company.companyName}</p>
            <h3 className="mt-0.5 font-display text-lg font-bold leading-snug text-forest-950 group-hover:text-river-700">{job.title}</h3>
          </div>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-forest-300 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-river-600" />
      </div>
      {job.match ? <MatchBadge match={job.match} className="mt-3" /> : null}
      <p className="mt-3 line-clamp-2 text-sm text-forest-800/75">{job.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-forest-700/70">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.zone && job.zone !== "Centro" ? `${job.zone}, Posadas` : job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" /> {JOB_TYPES[job.type] || job.type}
        </span>
        <Badge tone="blue">{MODALITIES[job.modality] || job.modality}</Badge>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-forest-100 pt-3">
        <span className="text-sm font-bold text-forest-800">{formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span className="text-xs text-forest-600">{timeAgo(job.createdAt)}</span>
      </div>
      {job.skills?.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <Badge key={s} tone="green">
              {s}
            </Badge>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
