"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/format";
import { JobCard, type JobCardData } from "@/components/JobCard";
import { Badge, PageTitle } from "@/components/ui";

type CompanyDetail = {
  id: string;
  companyName: string;
  description: string;
  industry: string;
  website: string;
  location: string;
  phone: string;
  size: string;
  jobs: JobCardData[];
};

export default function EmpresaDetailPage() {
  const params = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ company: CompanyDetail }>(`/api/companies/${params.id}`)
      .then((d) => setCompany(d.company))
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [params.id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!company) return <p className="text-forest-700/70">Cargando…</p>;

  return (
    <div>
      <PageTitle
        title={company.companyName}
        subtitle={company.description || "Empresa en PosadasJobs"}
      />
      <div className="mb-8 flex flex-wrap gap-2">
        {company.industry ? <Badge tone="blue">{company.industry}</Badge> : null}
        <Badge tone="green">{company.location}</Badge>
        <Badge tone="slate">{company.size} personas</Badge>
        {company.website ? (
          <a href={company.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-river-700 hover:underline">
            Sitio web
          </a>
        ) : null}
      </div>
      <h2 className="mb-4 font-display text-xl font-bold text-forest-950">Empleos abiertos</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {company.jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      {company.jobs.length === 0 ? <p className="text-sm text-forest-700/70">Sin empleos abiertos por ahora.</p> : null}
    </div>
  );
}
