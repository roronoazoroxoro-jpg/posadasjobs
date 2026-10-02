"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, Map as MapIcon, Sparkles } from "lucide-react";
import { api, MODALITIES } from "@/lib/format";
import { JobCard, type JobCardData } from "@/components/JobCard";
import { JobMap } from "@/components/JobMap";
import { PageHero } from "@/components/PageHero";
import { useSession } from "@/components/session";
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
  const { user, loading: sessionLoading } = useSession();
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [modality, setModality] = useState("");
  const [type, setType] = useState("");
  const [sort, setSort] = useState<"recent" | "match">("recent");
  const [view, setView] = useState<"list" | "map">(params.get("vista") === "mapa" ? "map" : "list");
  const [loading, setLoading] = useState(true);
  const isCandidate = user?.role === "CANDIDATE";

  useEffect(() => {
    if (sessionLoading) return;
    const t = setTimeout(() => {
      setLoading(true);
      const query = new URLSearchParams();
      if (q) query.set("q", q);
      if (modality) query.set("modality", modality);
      if (type) query.set("type", type);
      if (sort === "match") query.set("sort", "match");
      api<{ jobs: JobCardData[] }>(`/api/jobs?${query}`)
        .then((d) => setJobs(d.jobs))
        .catch(() => setJobs([]))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q, modality, type, sort, sessionLoading]);

  const tab = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
      active ? "bg-gradient-to-r from-forest-600 to-river-600 text-white shadow-soft" : "text-forest-800 hover:bg-forest-50"
    }`;

  return (
    <div>
      <PageHero
        eyebrow="Oportunidades"
        title="Empleos en Posadas y el NEA"
        subtitle="Filtrá por modalidad y tipo de contrato, mirá el mapa y postulate en un clic."
        image="/art/toucan-hero.jpg"
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Input placeholder="Buscar por título, skill, zona o empresa…" value={q} onChange={(e) => setQ(e.target.value)} />
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

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full bg-white/80 p-1 ring-1 ring-forest-100">
          <button type="button" className={tab(view === "list")} onClick={() => setView("list")}>
            <LayoutGrid className="h-4 w-4" /> Lista
          </button>
          <button type="button" className={tab(view === "map")} onClick={() => setView("map")}>
            <MapIcon className="h-4 w-4" /> Mapa
          </button>
        </div>
        {isCandidate ? (
          <div className="flex gap-1 rounded-full bg-white/80 p-1 ring-1 ring-forest-100">
            <button type="button" className={tab(sort === "recent")} onClick={() => setSort("recent")}>
              Más recientes
            </button>
            <button type="button" className={tab(sort === "match")} onClick={() => setSort("match")}>
              <Sparkles className="h-4 w-4" /> Mejor match
            </button>
          </div>
        ) : !user && !sessionLoading ? (
          <p className="text-xs text-forest-700/70">
            <Sparkles className="mr-1 inline h-3.5 w-3.5 text-river-600" />
            Ingresá como candidato para ver tu % de compatibilidad con cada empleo.
          </p>
        ) : null}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-white/70 ring-1 ring-forest-100" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Empty title="No hay empleos con esos filtros">Probá con otra palabra o quitá algún filtro.</Empty>
      ) : view === "map" ? (
        <div className="animate-fade-in space-y-3">
          <JobMap
            height={520}
            jobs={jobs.map((j) => ({
              id: j.id,
              title: j.title,
              company: j.company.companyName,
              zone: j.zone || "Centro",
              modality: MODALITIES[j.modality] || j.modality,
              lat: j.lat ?? -27.3671,
              lng: j.lng ?? -55.8961,
              match: j.match?.score,
            }))}
          />
          <p className="text-xs text-forest-700/70">
            {jobs.length} {jobs.length === 1 ? "empleo" : "empleos"} en el mapa. Las ubicaciones son aproximadas por zona.
          </p>
        </div>
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
