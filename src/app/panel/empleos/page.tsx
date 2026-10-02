"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSession } from "@/components/session";
import { api, formatSalary, JOB_TYPES, MODALITIES, timeAgo } from "@/lib/format";
import { Badge, Button, Empty, Field, Input, PageTitle, Select, Textarea } from "@/components/ui";

type Job = {
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
  applicationsCount?: number;
};

const emptyForm = {
  title: "",
  description: "",
  requirements: "",
  location: "Posadas, Misiones",
  type: "FULL_TIME",
  modality: "PRESENCIAL",
  salaryMin: "",
  salaryMax: "",
  skills: "",
};

export default function MisEmpleosPage() {
  const { user } = useSession();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const data = await api<{ jobs: Job[] }>("/api/jobs?mine=1");
    setJobs(data.jobs);
  }

  useEffect(() => {
    if (user?.role === "COMPANY") void load().catch(() => setJobs([]));
  }, [user]);

  async function createJob(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(job: Job) {
    await api(`/api/jobs/${job.id}`, {
      method: "PUT",
      body: JSON.stringify({ status: job.status === "OPEN" ? "CLOSED" : "OPEN" }),
    });
    await load();
  }

  async function removeJob(id: string) {
    if (!confirm("¿Eliminar este empleo?")) return;
    await api(`/api/jobs/${id}`, { method: "DELETE" });
    await load();
  }

  if (!user) return null;
  if (user.role !== "COMPANY") return <p>Solo empresas.</p>;

  return (
    <div>
      <PageTitle
        title="Mis empleos"
        subtitle="Publicá y administrá puestos de trabajo."
        action={
          <Button type="button" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancelar" : "Nuevo empleo"}
          </Button>
        }
      />

      {showForm ? (
        <form onSubmit={createJob} className="mb-8 space-y-4 rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
          <Field label="Título">
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </Field>
          <Field label="Descripción">
            <Textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="Requisitos">
            <Textarea rows={3} value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Tipo">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(JOB_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Modalidad">
              <Select value={form.modality} onChange={(e) => setForm({ ...form, modality: e.target.value })}>
                {Object.entries(MODALITIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Ubicación">
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Salario mín (ARS)">
              <Input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} />
            </Field>
            <Field label="Salario máx (ARS)">
              <Input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} />
            </Field>
            <Field label="Skills (coma)">
              <Input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            </Field>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={loading}>
            {loading ? "Publicando…" : "Publicar empleo"}
          </Button>
        </form>
      ) : null}

      {jobs.length === 0 ? (
        <Empty title="Todavía no publicaste empleos">
          <Button type="button" className="mt-3" onClick={() => setShowForm(true)}>
            Crear el primero
          </Button>
        </Empty>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/empleos/${job.id}`} className="font-display text-lg font-bold text-forest-950 hover:text-river-700">
                    {job.title}
                  </Link>
                  <p className="mt-1 text-xs text-forest-600">
                    {timeAgo(job.createdAt)} · {formatSalary(job.salaryMin, job.salaryMax)} · {job.applicationsCount ?? 0} postulaciones
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone={job.status === "OPEN" ? "green" : "slate"}>{job.status === "OPEN" ? "Abierto" : "Cerrado"}</Badge>
                    <Badge tone="blue">{MODALITIES[job.modality]}</Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => void toggleStatus(job)}>
                    {job.status === "OPEN" ? "Cerrar" : "Reabrir"}
                  </Button>
                  <Button type="button" variant="danger" onClick={() => void removeJob(job.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
