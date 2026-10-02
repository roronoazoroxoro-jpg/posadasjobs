"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Download, ExternalLink, Github, Mail, Phone, Sparkles } from "lucide-react";
import { api } from "@/lib/format";
import { Badge, Button } from "@/components/ui";
import { CvViewer } from "@/components/CvViewer";

type Project = { name: string; description: string; url?: string };

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
  photoUrl: string;
  projects: Project[];
  languages: string[];
  featured: boolean;
  cvFileUrl: string;
  cvFileName: string;
  cvPreviews: string[];
};

export default function TalentoDetailPage() {
  const params = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"perfil" | "proyectos" | "cv">("perfil");

  useEffect(() => {
    api<{ candidate: Candidate }>(`/api/candidates/${params.id}`)
      .then((d) => setCandidate(d.candidate))
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [params.id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!candidate) return <p className="text-forest-700/70">Cargando perfil…</p>;

  const wa = candidate.phone.replace(/\D/g, "");
  const waLink = wa ? `https://wa.me/${wa.startsWith("54") ? wa : `54${wa}`}` : null;

  return (
    <div>
      <section className="mb-8 overflow-hidden rounded-[1.75rem] border border-forest-100 bg-gradient-to-br from-forest-800 via-forest-700 to-river-800 p-6 text-white shadow-glow sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative mx-auto h-32 w-32 shrink-0 overflow-hidden rounded-3xl ring-4 ring-white/30 sm:mx-0 sm:h-36 sm:w-36">
            {candidate.photoUrl ? (
              <Image src={candidate.photoUrl} alt={candidate.name} fill className="object-cover object-top" sizes="144px" priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/10 font-display text-4xl font-bold">
                {candidate.name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left">
            {candidate.featured ? (
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                <Sparkles className="h-3.5 w-3.5" /> Talento destacado
              </span>
            ) : null}
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{candidate.name}</h1>
            <p className="mt-2 text-lg text-forest-50/95">{candidate.headline}</p>
            <p className="mt-2 text-sm text-white/75">
              {candidate.location} · {candidate.availability}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              <a href={`mailto:${candidate.email}`}>
                <Button type="button" className="bg-white text-forest-800 hover:bg-forest-50">
                  <Mail className="h-4 w-4" /> Contactar
                </Button>
              </a>
              {waLink ? (
                <a href={waLink} target="_blank" rel="noreferrer">
                  <Button type="button" variant="secondary">
                    <Phone className="h-4 w-4" /> WhatsApp
                  </Button>
                </a>
              ) : null}
              {candidate.portfolio ? (
                <a href={candidate.portfolio} target="_blank" rel="noreferrer">
                  <Button type="button" variant="secondary">
                    <ExternalLink className="h-4 w-4" /> Portfolio
                  </Button>
                </a>
              ) : null}
              {candidate.cvFileUrl || candidate.cvText ? (
                <Button type="button" variant="secondary" onClick={() => setTab("cv")}>
                  <Download className="h-4 w-4" /> Ver / descargar CV
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["perfil", "Perfil"],
            ["proyectos", `Proyectos (${candidate.projects.length})`],
            ["cv", "Curriculum"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === key
                ? "bg-gradient-to-r from-forest-600 to-river-600 text-white shadow-soft"
                : "bg-white text-forest-800 ring-1 ring-forest-200 hover:bg-forest-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "perfil" ? (
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5 rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft sm:p-8">
            <div>
              <h2 className="font-display text-xl font-bold text-forest-950">Sobre mí</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-forest-900/85">{candidate.bio}</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-forest-950">Experiencia</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-forest-900/85">{candidate.experience}</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-forest-950">Formación</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-forest-900/85">{candidate.education}</p>
            </div>
          </div>
          <aside className="space-y-4">
            <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
              <h2 className="font-display text-lg font-bold">Skills</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {candidate.skills.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            </div>
            {candidate.languages.length ? (
              <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">Idiomas</h2>
                <ul className="mt-3 space-y-1 text-sm text-forest-800">
                  {candidate.languages.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft text-sm">
              <h2 className="font-display text-lg font-bold">Contacto</h2>
              <p className="mt-2">{candidate.email}</p>
              {candidate.phone ? <p>{candidate.phone}</p> : null}
              {candidate.portfolio ? (
                <a className="mt-2 flex items-center gap-1 text-river-700 hover:underline" href={candidate.portfolio} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Portfolio web
                </a>
              ) : null}
              <a
                className="mt-1 flex items-center gap-1 text-river-700 hover:underline"
                href="https://github.com/roronoazoroxoro-jpg"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
            </div>
          </aside>
        </div>
      ) : null}

      {tab === "proyectos" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {candidate.projects.map((p) => (
            <div key={p.name} className="rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft transition hover:border-river-200">
              <h3 className="font-display text-lg font-bold text-forest-950">{p.name}</h3>
              <p className="mt-2 text-sm text-forest-800/80">{p.description}</p>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-river-700 hover:underline">
                  Ver proyecto <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
          ))}
          {!candidate.projects.length ? <p className="text-sm text-forest-600">Sin proyectos cargados.</p> : null}
        </div>
      ) : null}

      {tab === "cv" ? (
        <div>
          <CvViewer
            name={candidate.name}
            cvText={candidate.cvText}
            cvFileUrl={candidate.cvFileUrl}
            cvFileName={candidate.cvFileName}
            cvPreviews={candidate.cvPreviews}
          />
          <div className="mt-4">
            <Link href="/empleos" className="text-sm font-semibold text-river-700 hover:underline">
              Ver empleos compatibles →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
