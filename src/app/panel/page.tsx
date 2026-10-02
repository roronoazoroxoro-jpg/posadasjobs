"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Briefcase, ExternalLink, Eye, FileDown, FileText, MessageCircle, Sparkles, Users } from "lucide-react";
import { useSession } from "@/components/session";
import { api, APP_STATUS, MODALITIES } from "@/lib/format";
import { Button, PageTitle } from "@/components/ui";
import { MatchBadge, type MatchInfo } from "@/components/Match";
import { CountUp } from "@/components/CountUp";

type CandidateStats = {
  role: "CANDIDATE";
  views: number;
  cvViews: number;
  applications: number;
  byStatus: Record<string, number>;
  conversations: number;
  unread: number;
  completeness: number;
  recommended: { id: string; title: string; modality: string; company: { id: string; companyName: string }; match: MatchInfo }[];
};

type CompanyStats = {
  role: "COMPANY";
  jobs: { id: string; title: string; status: string; views: number; applications: number }[];
  totalViews: number;
  totalApplications: number;
  openJobs: number;
  conversations: number;
  unread: number;
  suggestions: {
    jobId: string;
    jobTitle: string;
    candidates: { id: string; name: string; headline: string; photoUrl: string; match: MatchInfo }[];
  }[];
};

export default function PanelHomePage() {
  const { user } = useSession();
  const [stats, setStats] = useState<CandidateStats | CompanyStats | null>(null);

  useEffect(() => {
    if (!user) return;
    api<CandidateStats | CompanyStats>("/api/stats")
      .then(setStats)
      .catch(() => setStats(null));
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <PageTitle
        title={`Hola, ${user.name.split(" ")[0]} 👋`}
        subtitle={
          user.role === "COMPANY"
            ? "Así vienen tus empleos, postulantes y conversaciones."
            : "Así ven las empresas tu perfil. Seguí sumando para destacar."
        }
        action={
          user.role === "CANDIDATE" && user.candidate ? (
            <Link href={`/talentos/${user.candidate.id}`}>
              <Button type="button" variant="secondary">
                <ExternalLink className="h-4 w-4" /> Ver perfil público
              </Button>
            </Link>
          ) : (
            <Link href="/panel/empleos">
              <Button type="button">
                <Briefcase className="h-4 w-4" /> Publicar empleo
              </Button>
            </Link>
          )
        }
      />

      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/70 ring-1 ring-forest-100" />
          ))}
        </div>
      ) : stats.role === "CANDIDATE" ? (
        <CandidateDashboard stats={stats} />
      ) : (
        <CompanyDashboard stats={stats} />
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  href,
  hint,
  delay = 0,
}: {
  icon: typeof Briefcase;
  label: string;
  value: number;
  href: string;
  hint?: string;
  delay?: number;
}) {
  return (
    <Link
      href={href}
      style={{ animationDelay: `${delay}ms` }}
      className="group animate-fade-up rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-river-200 hover:shadow-glow"
    >
      <span className="inline-flex rounded-xl bg-gradient-to-br from-forest-500 to-river-600 p-2 text-white shadow-soft transition group-hover:rotate-[-6deg]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 font-display text-3xl font-bold text-forest-950">
        <CountUp value={value} />
      </p>
      <p className="text-sm font-medium text-forest-700/80">{label}</p>
      {hint ? <p className="mt-1 text-xs text-forest-600">{hint}</p> : null}
    </Link>
  );
}

function CandidateDashboard({ stats }: { stats: CandidateStats }) {
  const { user } = useSession();
  const statusOrder = ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"] as const;
  const total = Math.max(1, stats.applications);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Eye} label="Visitas a tu perfil" value={stats.views} href={`/talentos/${user?.candidate?.id}`} delay={0} />
        <Stat icon={FileDown} label="Aperturas de tu CV" value={stats.cvViews} href="/panel/cv" delay={70} />
        <Stat icon={Briefcase} label="Postulaciones" value={stats.applications} href="/panel/postulaciones" delay={140} />
        <Stat
          icon={MessageCircle}
          label="Conversaciones"
          value={stats.conversations}
          href="/panel/mensajes"
          hint={stats.unread ? `${stats.unread} sin leer` : undefined}
          delay={210}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="animate-fade-up rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
          <p className="font-display text-lg font-bold text-forest-950">Perfil completo</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-4xl font-bold text-gradient">{stats.completeness}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-forest-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-forest-500 to-river-600 transition-[width] duration-1000"
              style={{ width: `${stats.completeness}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-forest-700/80">
            {stats.completeness >= 90
              ? "¡Impecable! Tu perfil está listo para destacar."
              : "Completá foto, experiencia, proyectos y CV para aparecer mejor en las búsquedas."}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
            <Link href="/panel/perfil" className="text-river-700 hover:underline">
              Editar perfil
            </Link>
            <Link href="/panel/cv" className="text-river-700 hover:underline">
              Actualizar CV
            </Link>
            {user?.candidate ? (
              <Link href={`/talentos/${user.candidate.id}/cv`} className="text-river-700 hover:underline">
                Generar CV en PDF
              </Link>
            ) : null}
          </div>

          {stats.applications ? (
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wide text-forest-600">Estado de tus postulaciones</p>
              <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-forest-100">
                {statusOrder.map((s, i) =>
                  stats.byStatus[s] ? (
                    <div
                      key={s}
                      title={`${APP_STATUS[s]}: ${stats.byStatus[s]}`}
                      className={["bg-slate-400", "bg-river-500", "bg-forest-500", "bg-red-400"][i]}
                      style={{ width: `${(stats.byStatus[s] / total) * 100}%` }}
                    />
                  ) : null,
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-forest-700/80">
                {statusOrder.map((s, i) => (
                  <span key={s} className="inline-flex items-center gap-1">
                    <span className={`h-2 w-2 rounded-full ${["bg-slate-400", "bg-river-500", "bg-forest-500", "bg-red-400"][i]}`} />
                    {APP_STATUS[s]} ({stats.byStatus[s] || 0})
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="animate-fade-up rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft" style={{ animationDelay: "120ms" }}>
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-forest-950">
              <Sparkles className="h-5 w-5 text-river-600" /> Recomendados para vos
            </p>
            <Link href="/empleos" className="text-sm font-semibold text-river-700 hover:underline">
              Ver todos
            </Link>
          </div>
          <p className="mt-1 text-xs text-forest-700/70">Ordenados por compatibilidad con tus skills, experiencia y proyectos.</p>
          <div className="mt-4 space-y-3">
            {stats.recommended.length ? (
              stats.recommended.map((j) => (
                <Link
                  key={j.id}
                  href={`/empleos/${j.id}`}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-forest-100 p-3 transition hover:border-river-200 hover:bg-forest-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-forest-950 group-hover:text-river-700">{j.title}</span>
                    <span className="block truncate text-xs text-forest-700/75">
                      {j.company.companyName} · {MODALITIES[j.modality] || j.modality}
                    </span>
                  </span>
                  <MatchBadge match={j.match} className="shrink-0" />
                </Link>
              ))
            ) : (
              <p className="text-sm text-forest-700/75">Ya te postulaste a todo lo abierto. ¡Crack! Volvé pronto.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyDashboard({ stats }: { stats: CompanyStats }) {
  const maxViews = Math.max(1, ...stats.jobs.map((j) => j.views));
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Briefcase} label="Empleos abiertos" value={stats.openJobs} href="/panel/empleos" delay={0} />
        <Stat icon={Eye} label="Vistas de tus empleos" value={stats.totalViews} href="/panel/empleos" delay={70} />
        <Stat icon={Users} label="Postulaciones" value={stats.totalApplications} href="/panel/postulaciones" delay={140} />
        <Stat
          icon={MessageCircle}
          label="Conversaciones"
          value={stats.conversations}
          href="/panel/mensajes"
          hint={stats.unread ? `${stats.unread} sin leer` : undefined}
          delay={210}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="animate-fade-up rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
          <p className="font-display text-lg font-bold text-forest-950">Rendimiento por empleo</p>
          <div className="mt-4 space-y-4">
            {stats.jobs.length ? (
              stats.jobs.slice(0, 6).map((j) => {
                const conv = j.views ? Math.round((j.applications / j.views) * 100) : 0;
                return (
                  <Link key={j.id} href={`/empleos/${j.id}`} className="group block">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate font-semibold text-forest-900 group-hover:text-river-700">{j.title}</span>
                      <span className="shrink-0 text-xs text-forest-700/75">
                        {j.views} vistas · {j.applications} post. · {conv}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-forest-100">
                      <div
                        className={`h-full rounded-full transition-[width] duration-1000 ${
                          j.status === "OPEN" ? "bg-gradient-to-r from-forest-500 to-river-600" : "bg-slate-400"
                        }`}
                        style={{ width: `${Math.max(4, (j.views / maxViews) * 100)}%` }}
                      />
                    </div>
                  </Link>
                );
              })
            ) : (
              <p className="text-sm text-forest-700/75">
                Todavía no publicaste empleos.{" "}
                <Link href="/panel/empleos" className="font-semibold text-river-700 hover:underline">
                  Publicá el primero
                </Link>
                .
              </p>
            )}
          </div>
        </div>

        <div className="animate-fade-up rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft" style={{ animationDelay: "120ms" }}>
          <p className="flex items-center gap-2 font-display text-lg font-bold text-forest-950">
            <Sparkles className="h-5 w-5 text-river-600" /> Talentos sugeridos
          </p>
          <p className="mt-1 text-xs text-forest-700/70">Perfiles con mayor compatibilidad para tus empleos abiertos.</p>
          <div className="mt-4 space-y-5">
            {stats.suggestions.filter((s) => s.candidates.length).length ? (
              stats.suggestions
                .filter((s) => s.candidates.length)
                .map((s) => (
                  <div key={s.jobId}>
                    <p className="text-xs font-bold uppercase tracking-wide text-forest-600">{s.jobTitle}</p>
                    <div className="mt-2 space-y-2">
                      {s.candidates.map((c) => (
                        <Link
                          key={c.id}
                          href={`/talentos/${c.id}`}
                          className="group flex items-center gap-3 rounded-2xl border border-forest-100 p-2.5 transition hover:border-river-200 hover:bg-forest-50"
                        >
                          {c.photoUrl ? (
                            <Image src={c.photoUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover object-top" />
                          ) : (
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-forest-500 to-river-600 font-bold text-white">
                              {c.name.slice(0, 1)}
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-forest-950 group-hover:text-river-700">{c.name}</span>
                            <span className="block truncate text-xs text-forest-700/75">{c.headline}</span>
                          </span>
                          <MatchBadge match={c.match} className="shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-sm text-forest-700/75">
                Publicá empleos con skills para recibir sugerencias.{" "}
                <Link href="/talentos" className="inline-flex items-center gap-1 font-semibold text-river-700 hover:underline">
                  Explorar talentos <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-forest-700/60">
        <FileText className="h-3.5 w-3.5" /> Las estadísticas se actualizan en tiempo real con cada visita y postulación.
      </p>
    </div>
  );
}
