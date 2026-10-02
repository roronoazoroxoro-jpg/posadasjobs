"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/format";
import { Badge, PageTitle } from "@/components/ui";

type Candidate = {
  id: string;
  name: string;
  email: string;
  headline: string;
  bio: string;
  skills: string[];
  experience: string;
  education: string;
  location: string;
  phone: string;
  cvText: string;
  linkedin: string;
  portfolio: string;
  availability: string;
};

export default function TalentoDetailPage() {
  const params = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ candidate: Candidate }>(`/api/candidates/${params.id}`)
      .then((d) => setCandidate(d.candidate))
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [params.id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!candidate) return <p className="text-forest-700/70">Cargando…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-forest-100 bg-white/90 p-8 shadow-soft">
        <PageTitle title={candidate.name} subtitle={candidate.headline || "Perfil técnico"} />
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge tone="green">{candidate.availability}</Badge>
          <Badge tone="blue">{candidate.location}</Badge>
        </div>
        <section className="space-y-4 text-sm text-forest-900/85">
          <div>
            <h2 className="font-display text-lg font-bold">Sobre mí</h2>
            <p className="mt-1 whitespace-pre-wrap">{candidate.bio || "Sin bio."}</p>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Experiencia</h2>
            <p className="mt-1 whitespace-pre-wrap">{candidate.experience || "Sin experiencia cargada."}</p>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Educación</h2>
            <p className="mt-1 whitespace-pre-wrap">{candidate.education || "Sin educación cargada."}</p>
          </div>
          {candidate.cvText ? (
            <div>
              <h2 className="font-display text-lg font-bold">Curriculum</h2>
              <pre className="mt-2 overflow-auto rounded-xl bg-forest-50 p-4 text-xs leading-relaxed text-forest-900">
                {candidate.cvText}
              </pre>
            </div>
          ) : null}
        </section>
      </div>
      <aside className="space-y-4">
        <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold">Skills</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {candidate.skills.length ? candidate.skills.map((s) => <Badge key={s}>{s}</Badge>) : <p className="text-sm text-forest-600">Sin skills</p>}
          </div>
        </div>
        <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft text-sm">
          <h2 className="font-display text-lg font-bold">Contacto</h2>
          <p className="mt-2">{candidate.email}</p>
          {candidate.phone ? <p>{candidate.phone}</p> : null}
          {candidate.linkedin ? (
            <a className="mt-2 block text-river-700 hover:underline" href={candidate.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          ) : null}
          {candidate.portfolio ? (
            <a className="block text-river-700 hover:underline" href={candidate.portfolio} target="_blank" rel="noreferrer">
              Portfolio
            </a>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
