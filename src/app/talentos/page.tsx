"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/format";
import { TalentCard, type TalentCardData } from "@/components/TalentCard";
import { PageHero } from "@/components/PageHero";
import { Empty, Input } from "@/components/ui";

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
      <PageHero
        eyebrow="Vitrina de talento"
        title="Talentos del NEA"
        subtitle="Perfiles técnicos con CV, skills y proyectos reales, listos para contactar."
        image="/art/toucan-cv.jpg"
      />
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
          {candidates.map((c, i) => (
            <div key={c.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}>
              <TalentCard talent={c} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
