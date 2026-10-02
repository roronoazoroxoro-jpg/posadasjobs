"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, APP_STATUS, formatSalary, JOB_TYPES, MODALITIES, timeAgo } from "@/lib/format";
import { useSession } from "@/components/session";
import { Badge, Button, Textarea } from "@/components/ui";

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
  const { user } = useSession();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ job: JobDetail; alreadyApplied: boolean }>(`/api/jobs/${params.id}`)
      .then((d) => {
        setJob(d.job);
        setAlreadyApplied(d.alreadyApplied);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, [params.id]);

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

  if (error && !job) return <p className="text-red-600">{error}</p>;
  if (!job) return <p className="text-forest-700/70">Cargando…</p>;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
      <article className="rounded-3xl border border-forest-100 bg-white/90 p-8 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="blue">{MODALITIES[job.modality]}</Badge>
          <Badge tone="green">{JOB_TYPES[job.type]}</Badge>
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
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-forest-900/85">
          <div>
            <h2 className="font-display text-lg font-bold">Descripción</h2>
            <p className="mt-1 whitespace-pre-wrap">{job.description}</p>
          </div>
          {job.requirements ? (
            <div>
              <h2 className="font-display text-lg font-bold">Requisitos</h2>
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
      </article>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-forest-950">Empresa</h2>
          <p className="mt-1 font-semibold text-river-700">{job.company.companyName}</p>
          <p className="mt-2 text-sm text-forest-800/75">{job.company.description || "Sin descripción."}</p>
          <p className="mt-3 text-xs text-forest-600">
            {job.company.industry || "Industria"} · {job.company.size} · {job.company.location}
          </p>
        </div>

        <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
          <h2 className="font-display text-lg font-bold text-forest-950">Postulate</h2>
          {!user ? (
            <p className="mt-2 text-sm text-forest-700/80">
              <Link href="/login" className="font-semibold text-river-700 hover:underline">
                Ingresá
              </Link>{" "}
              o{" "}
              <Link href="/registro?rol=CANDIDATE" className="font-semibold text-river-700 hover:underline">
                crea tu cuenta
              </Link>{" "}
              de candidato para postularte.
            </p>
          ) : user.role !== "CANDIDATE" ? (
            <p className="mt-2 text-sm text-forest-700/80">Las empresas no pueden postularse. Usá una cuenta de candidato.</p>
          ) : alreadyApplied ? (
            <p className="mt-2 text-sm font-medium text-forest-700">Ya estás postulado/a a este empleo.</p>
          ) : job.status !== "OPEN" ? (
            <p className="mt-2 text-sm text-forest-700/80">Este empleo está cerrado.</p>
          ) : (
            <form onSubmit={apply} className="mt-3 space-y-3">
              <Textarea
                rows={4}
                placeholder="Carta de presentación (opcional)"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Enviando…" : "Postularme"}
              </Button>
            </form>
          )}
          {message ? <p className="mt-2 text-sm text-forest-700">{message}</p> : null}
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          {alreadyApplied ? <p className="mt-2 text-xs text-forest-600">Estado inicial: {APP_STATUS.PENDING}</p> : null}
        </div>
      </aside>
    </div>
  );
}
