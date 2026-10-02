"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/format";
import { Badge, Empty, Input, PageTitle } from "@/components/ui";

type Talent = {
  id: string;
  name: string;
  headline: string;
  bio: string;
  skills: string[];
  location: string;
  availability: string;
};

export default function TalentosPage() {
  const [candidates, setCandidates] = useState<Talent[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      api<{ candidates: Talent[] }>(`/api/candidates${params}`)
        .then((d) => setCandidates(d.candidates))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <PageTitle title="Talentos" subtitle="Perfiles técnicos disponibles para contactar." />
      <div className="mb-6 max-w-md">
        <Input placeholder="Buscar por skill, nombre o headline…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {loading ? (
        <p className="text-sm text-forest-700/70">Cargando…</p>
      ) : candidates.length === 0 ? (
        <Empty title="No hay talentos con esa búsqueda" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map((c) => (
            <Link
              key={c.id}
              href={`/talentos/${c.id}`}
              className="rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-forest-300"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-forest-950">{c.name}</h3>
                <Badge tone={c.availability === "Disponible" ? "green" : "amber"}>{c.availability || "—"}</Badge>
              </div>
              <p className="mt-1 text-sm font-medium text-river-700">{c.headline || "Sin headline"}</p>
              <p className="mt-2 line-clamp-2 text-sm text-forest-800/75">{c.bio || "Sin bio."}</p>
              <p className="mt-2 text-xs text-forest-600">{c.location}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.skills.slice(0, 5).map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
