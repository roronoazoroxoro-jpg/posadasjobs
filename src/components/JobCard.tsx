import { JOB_TYPES, MODALITIES, formatSalary, timeAgo } from "@/lib/format";
import { Badge } from "./ui";
import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";

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
};

export function JobCard({ job }: { job: JobCardData }) {
  return (
    <Link
      href={`/empleos/${job.id}`}
      className="group block rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-river-200 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-river-600">{job.company.companyName}</p>
          <h3 className="mt-1 font-display text-lg font-bold text-forest-950 group-hover:text-river-700">{job.title}</h3>
        </div>
        <Badge tone="blue">{MODALITIES[job.modality] || job.modality}</Badge>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-forest-800/75">{job.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-forest-700/70">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" /> {JOB_TYPES[job.type] || job.type}
        </span>
        <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
        <span className="ml-auto">{timeAgo(job.createdAt)}</span>
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
