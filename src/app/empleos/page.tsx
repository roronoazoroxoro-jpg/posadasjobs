"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/format";
import { JobCard, type JobCardData } from "@/components/JobCard";
import { Empty, Input, PageTitle, Select } from "@/components/ui";

export default function EmpleosPage() {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [q, setQ] = useState("");
  const [modality, setModality] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (modality) params.set("modality", modality);
      if (type) params.set("type", type);
      api<{ jobs: JobCardData[] }>(`/api/jobs?${params}`)
        .then((d) => setJobs(d.jobs))
        .catch(() => setJobs([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q, modality, type]);

  return (
    <div>
      <PageTitle title="Empleos" subtitle="Buscá oportunidades en Posadas y el NEA." />
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
        <p className="text-sm text-forest-700/70">Cargando empleos…</p>
      ) : jobs.length === 0 ? (
        <Empty title="No hay empleos con esos filtros" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
