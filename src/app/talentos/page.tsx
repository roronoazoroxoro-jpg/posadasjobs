"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/format";
import { TalentCard, type TalentCardData } from "@/components/TalentCard";
import { Empty, Input, PageTitle } from "@/components/ui";

const POPULAR = ["React", "Python", "Go", "Next.js", "OpenCV", "MikroTik", "PostgreSQL", "IA"];

export default function TalentosPage() {
  const [candidates, setCandidates] = useState<TalentCardData[]>([]);
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (skill) params.set("skill", skill);
      api<{ candidates: TalentCardData[] }>(`/api/candidates?${params}`)
        .then((d) => setCandidates(d.candidates))
        .finally(() => setLoading(false));
    }, 180);
    return () => clearTimeout(t);
  }, [q, skill]);

  const countLabel = useMemo(() => `${candidates.length} talento${candidates.length === 1 ? "" : "s"}`, [candidates.length]);

  return (
    <div>
      <PageTitle title="Talentos" subtitle="Perfiles técnicos de Posadas y el NEA listos para contactar." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input className="sm:max-w-md" placeholder="Buscar por nombre, skill o proyecto…" value={q} onChange={(e) => setQ(e.target.value)} />
        <p className="text-sm text-forest-600">{loading ? "Buscando…" : countLabel}</p>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSkill("")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!skill ? "bg-forest-700 text-white" : "bg-white text-forest-800 ring-1 ring-forest-200"}`}
        >
          Todas
        </button>
        {POPULAR.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSkill(s === skill ? "" : s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              skill === s ? "bg-river-600 text-white" : "bg-white text-forest-800 ring-1 ring-forest-200 hover:bg-forest-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-sm text-forest-700/70">Cargando…</p>
      ) : candidates.length === 0 ? (
        <Empty title="No hay talentos con esa búsqueda" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map((c) => (
            <TalentCard key={c.id} talent={c} />
          ))}
        </div>
      )}
    </div>
  );
}
