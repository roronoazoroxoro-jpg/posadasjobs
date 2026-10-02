"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/format";
import { JobCard, type JobCardData } from "@/components/JobCard";
import { PageHero } from "@/components/PageHero";
import { Empty, Input, Select } from "@/components/ui";

export default function EmpleosPage() {
  return (
    <Suspense>
      <EmpleosList />
    </Suspense>
  );
}

function EmpleosList() {
  const params = useSearchParams();
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [modality, setModality] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const query = new URLSearchParams();
      if (q) query.set("q", q);
      if (modality) query.set("modality", modality);
      if (type) query.set("type", type);
      api<{ jobs: JobCardData[] }>(`/api/jobs?${query}`)
        .then((d) => setJobs(d.jobs))
        .catch(() => setJobs([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q, modality, type]);

  return (
    <div>
      <PageHero
        eyebrow="Oportunidades"
        title="Empleos en Posadas y el NEA"
        subtitle="Filtrá por modalidad y tipo de contrato, y postulate en un clic."
        image="/art/toucan-hero.jpg"
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Input placeholder="Buscar por título, skill o empresa…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={modality} onChange={(e) => setModality(e.target.value)}>
          <option value="">Todas las modalidades</option>
          <option value="PRESENCIAL">Presencial</option>
          <option value="REMOTO">Remoto</option>
          <option value="HIBRIDO">Híbrido</option>
        </Select>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Todos los tipos</option>
          <option value="FULL_TIME">Tiempo completo</option>
          <option value="PART_TIME">Medio tiempo</option>
          <option value="CONTRACT">Contrato</option>
          <option value="INTERNSHIP">Pasantía</option>
        </Select>
      </div>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/70 ring-1 ring-forest-100" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Empty title="No hay empleos con esos filtros">Probá con otra palabra o quitá algún filtro.</Empty>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job, i) => (
            <div key={job.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
              <JobCard job={job} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
