"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/session";
import { api, APP_STATUS, timeAgo } from "@/lib/format";
import { Badge, Button, Empty, PageTitle, Select } from "@/components/ui";

type CandidateApp = {
  id: string;
  status: string;
  coverLetter: string;
  createdAt: string;
  job: { id: string; title: string; location: string; status: string; company: { id: string; companyName: string } };
};

type CompanyApp = {
  id: string;
  status: string;
  coverLetter: string;
  createdAt: string;
  job: { id: string; title: string };
  candidate: {
    id: string;
    name: string;
    email: string;
    headline: string;
    skills: string[];
    location: string;
    phone: string;
    cvText: string;
    cvFileUrl: string;
    cvFileName: string;
    availability: string;
  };
};

export default function PostulacionesPage() {
  const { user } = useSession();
  const [candidateApps, setCandidateApps] = useState<CandidateApp[]>([]);
  const [companyApps, setCompanyApps] = useState<CompanyApp[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      if (user?.role === "COMPANY") {
        const data = await api<{ applications: CompanyApp[] }>("/api/applications");
        setCompanyApps(data.applications);
      } else {
        const data = await api<{ applications: CandidateApp[] }>("/api/applications");
        setCandidateApps(data.applications);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function updateStatus(id: string, status: string) {
    await api("/api/applications", { method: "PATCH", body: JSON.stringify({ id, status }) });
    await load();
  }

  if (!user) return null;

  return (
    <div>
      <PageTitle
        title="Postulaciones"
        subtitle={user.role === "COMPANY" ? "Revisá y contactá candidatos." : "Seguí el estado de tus postulaciones."}
      />

      {loading ? (
        <p className="text-sm text-forest-700/70">Cargando…</p>
      ) : user.role === "CANDIDATE" ? (
        candidateApps.length === 0 ? (
          <Empty title="Todavía no te postulaste">
            <Link href="/empleos" className="mt-3 inline-block text-sm font-semibold text-river-700 hover:underline">
              Ver empleos
            </Link>
          </Empty>
        ) : (
          <div className="space-y-3">
            {candidateApps.map((a) => (
              <div key={a.id} className="rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/empleos/${a.job.id}`} className="font-display text-lg font-bold text-forest-950 hover:text-river-700">
                      {a.job.title}
                    </Link>
                    <p className="text-sm text-forest-700/80">
                      {a.job.company.companyName} · {a.job.location}
                    </p>
                    <p className="mt-1 text-xs text-forest-600">{timeAgo(a.createdAt)}</p>
                  </div>
                  <Badge tone={statusTone(a.status)}>{APP_STATUS[a.status] || a.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )
      ) : companyApps.length === 0 ? (
        <Empty title="Todavía no hay postulaciones" />
      ) : (
        <div className="space-y-4">
          {companyApps.map((a) => (
            <div key={a.id} className="rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-river-600">{a.job.title}</p>
                  <Link href={`/talentos/${a.candidate.id}`} className="font-display text-lg font-bold text-forest-950 hover:text-river-700">
                    {a.candidate.name}
                  </Link>
                  <p className="text-sm text-forest-700/80">{a.candidate.headline || a.candidate.email}</p>
                  <p className="mt-1 text-xs text-forest-600">
                    {a.candidate.location} · {a.candidate.email}
                    {a.candidate.phone ? ` · ${a.candidate.phone}` : ""} · {timeAgo(a.createdAt)}
                  </p>
                  {a.coverLetter ? <p className="mt-3 text-sm text-forest-800/80">{a.coverLetter}</p> : null}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {a.candidate.skills.slice(0, 6).map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                  </div>
                  {a.candidate.cvFileUrl ? (
                    <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                      <a href={a.candidate.cvFileUrl} target="_blank" rel="noreferrer" className="text-river-700 hover:underline">
                        Ver CV (PDF)
                      </a>
                      <a
                        href={a.candidate.cvFileUrl.startsWith("/api/") ? `${a.candidate.cvFileUrl}?download=1` : a.candidate.cvFileUrl}
                        download={a.candidate.cvFileName || "curriculum.pdf"}
                        className="text-forest-700 hover:underline"
                      >
                        Descargar CV
                      </a>
                    </div>
                  ) : null}
                  {a.candidate.cvText ? (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-semibold text-river-700">Ver CV</summary>
                      <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-forest-50 p-3 text-xs">{a.candidate.cvText}</pre>
                    </details>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2">
                  <Badge tone={statusTone(a.status)}>{APP_STATUS[a.status] || a.status}</Badge>
                  <Select value={a.status} onChange={(e) => void updateStatus(a.id, e.target.value)}>
                    {Object.entries(APP_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </Select>
                  <a href={`mailto:${a.candidate.email}`}>
                    <Button type="button" variant="secondary" className="w-full">
                      Contactar
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusTone(status: string): "green" | "blue" | "amber" | "red" | "slate" {
  if (status === "ACCEPTED") return "green";
  if (status === "REVIEWING") return "blue";
  if (status === "REJECTED") return "red";
  if (status === "PENDING") return "amber";
  return "slate";
}
