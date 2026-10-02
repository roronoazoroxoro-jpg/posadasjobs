"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, MapPin, MessageCircle, Share2, Users } from "lucide-react";
import { api, APP_STATUS, formatSalary, JOB_TYPES, MODALITIES, timeAgo } from "@/lib/format";
import { useSession } from "@/components/session";
import { Badge, Button, Textarea } from "@/components/ui";
import { MatchPanel, type MatchInfo } from "@/components/Match";
import { JobMap } from "@/components/JobMap";
import { ShareButtons } from "@/components/ShareButtons";

type JobDetail = {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  type: string;
  modality: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  skills: string[];
  status: string;
  zone: string;
  lat: number;
  lng: number;
  views: number;
  applicationsCount: number;
  createdAt: string;
  company: {
    id: string;
    companyName: string;
    description: string;
    industry: string;
    website: string;
    location: string;
    size: string;
  };
};

export default function EmpleoDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: sessionLoading } = useSession();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    api<{ job: JobDetail; alreadyApplied: boolean; match: MatchInfo | null }>(`/api/jobs/${params.id}`)
      .then((d) => {
        setJob(d.job);
        setMatch(d.match);
        setAlreadyApplied(d.alreadyApplied);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [params.id, sessionLoading]);

  async function apply(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api(`/api/jobs/${params.id}/apply`, {
        method: "POST",
        body: JSON.stringify({ coverLetter }),
      });
      setAlreadyApplied(true);
      setMessage("¡Postulación enviada!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo postular");
    } finally {
      setLoading(false);
    }
  }

  async function ask(e: FormEvent) {
    e.preventDefault();
    if (!job) return;
    setAsking(true);
    setError("");
    try {
      const d = await api<{ conversationId: string }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ companyId: job.company.id, body: question, jobTitle: job.title }),
      });
      router.push(`/panel/mensajes?c=${d.conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
      setAsking(false);
    }
  }

  if (error && !job) return <p className="text-red-600">{error}</p>;
  if (!job) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="h-96 animate-pulse rounded-3xl bg-white/70" />
        <div className="h-64 animate-pulse rounded-3xl bg-white/70" />
      </div>
    );
  }

  return (
    <div>
      <Link href="/empleos" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-river-700 hover:underline">
        <ArrowLeft className="h-4 w-4" /> Volver a empleos
      </Link>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          <article className="animate-fade-up rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="blue">{MODALITIES[job.modality]}</Badge>
              <Badge tone="green">{JOB_TYPES[job.type]}</Badge>
              {job.status !== "OPEN" ? <Badge tone="slate">Cerrado</Badge> : null}
              <span className="text-xs text-forest-600">{timeAgo(job.createdAt)}</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold text-forest-950">{job.title}</h1>
            <p className="mt-1 text-river-700">
              <Link href={`/empresas/${job.company.id}`} className="hover:underline">
                {job.company.companyName}
              </Link>
              {" · "}
              {job.location}
            </p>
            <p className="mt-2 font-semibold text-forest-800">{formatSalary(job.salaryMin, job.salaryMax)}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-forest-700/70">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> {job.views} {job.views === 1 ? "vista" : "vistas"}
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> {job.applicationsCount} {job.applicationsCount === 1 ? "postulación" : "postulaciones"}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {job.zone}, Posadas
              </span>
            </div>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-forest-900/85">
              <div>
                <h2 className="font-display text-lg font-bold text-forest-950">Descripción</h2>
                <p className="mt-1 whitespace-pre-wrap">{job.description}</p>
              </div>
              {job.requirements ? (
                <div>
                  <h2 className="font-display text-lg font-bold text-forest-950">Requisitos</h2>
                  <p className="mt-1 whitespace-pre-wrap">{job.requirements}</p>
                </div>
              ) : null}
            </div>
            {job.skills.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <Badge key={s}>{s}</Badge>
                ))}
              </div>
            ) : null}
            <div className="mt-6 border-t border-forest-100 pt-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-forest-600">
                <Share2 className="h-3.5 w-3.5" /> Compartir este empleo
              </p>
              <ShareButtons title={`${job.title} en ${job.company.companyName}`} path={`/empleos/${job.id}`} />
            </div>
          </article>

          <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold text-forest-950">
              <MapPin className="h-5 w-5 text-river-600" /> Ubicación aproximada
            </h2>
            <JobMap
              height={280}
              jobs={[
                {
                  id: job.id,
                  title: job.title,
                  company: job.company.companyName,
                  zone: job.zone,
                  modality: MODALITIES[job.modality] || job.modality,
                  lat: job.lat,
                  lng: job.lng,
                },
              ]}
            />
          </div>
        </div>

        <aside className="space-y-4">
          {match ? (
            <div className="animate-fade-up">
              <MatchPanel match={match} />
            </div>
          ) : null}

          <div className="animate-fade-up rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft" style={{ animationDelay: "80ms" }}>
            <h2 className="font-display text-lg font-bold text-forest-950">Postulate</h2>
            {!user ? (
              <p className="mt-2 text-sm text-forest-700/80">
                <Link href="/login" className="font-semibold text-river-700 hover:underline">
                  Ingresá
                </Link>{" "}
                o{" "}
                <Link href="/registro?rol=CANDIDATE" className="font-semibold text-river-700 hover:underline">
                  creá tu cuenta
                </Link>{" "}
                de candidato para postularte y ver tu compatibilidad.
              </p>
            ) : user.role !== "CANDIDATE" ? (
              <p className="mt-2 text-sm text-forest-700/80">Las empresas no pueden postularse. Usá una cuenta de candidato.</p>
            ) : alreadyApplied ? (
              <p className="mt-2 text-sm font-medium text-forest-700">Ya estás postulado/a a este empleo. Seguilo desde tu panel.</p>
            ) : job.status !== "OPEN" ? (
              <p className="mt-2 text-sm text-forest-700/80">Este empleo está cerrado.</p>
            ) : (
              <form onSubmit={apply} className="mt-3 space-y-3">
                <Textarea
                  rows={4}
                  placeholder="Carta de presentación (opcional)"
                  value={coverLetter}
                  maxLength={3000}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Enviando…" : "Postularme"}
                </Button>
              </form>
            )}
            {message ? <p className="mt-2 text-sm text-forest-700">{message}</p> : null}
            {alreadyApplied ? <p className="mt-2 text-xs text-forest-600">Estado inicial: {APP_STATUS.PENDING}</p> : null}

            {user?.role === "CANDIDATE" ? (
              <div className="mt-4 border-t border-forest-100 pt-4">
                {askOpen ? (
                  <form onSubmit={ask} className="space-y-2">
                    <Textarea
                      rows={3}
                      autoFocus
                      required
                      maxLength={2000}
                      placeholder={`Hola ${job.company.companyName}, quería consultar sobre el puesto…`}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button type="submit" disabled={asking || !question.trim()} className="flex-1">
                        {asking ? "Enviando…" : "Enviar consulta"}
                      </Button>
                      <Button type="button" variant="ghost" onClick={() => setAskOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button type="button" variant="secondary" className="w-full" onClick={() => setAskOpen(true)}>
                    <MessageCircle className="h-4 w-4" /> Consultar a la empresa
                  </Button>
                )}
              </div>
            ) : null}
            {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          </div>

          <div className="animate-fade-up rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft" style={{ animationDelay: "160ms" }}>
            <h2 className="font-display text-lg font-bold text-forest-950">Empresa</h2>
            <Link href={`/empresas/${job.company.id}`} className="mt-1 block font-semibold text-river-700 hover:underline">
              {job.company.companyName}
            </Link>
            <p className="mt-2 text-sm text-forest-800/75">{job.company.description || "Sin descripción."}</p>
            <p className="mt-3 text-xs text-forest-600">
              {job.company.industry || "Industria"} · {job.company.size} · {job.company.location}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
