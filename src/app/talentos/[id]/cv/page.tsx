import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Mail, MapPin, Phone } from "lucide-react";
import { prisma } from "@/lib/db";
import { parseJsonArray, parseProjects } from "@/lib/auth";
import { PrintButton } from "@/components/PrintButton";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  return prisma.candidateProfile.findUnique({ where: { id }, include: { user: { select: { name: true, email: true } } } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await load((await params).id);
  if (!c) return { title: "CV no encontrado" };
  return { title: `CV de ${c.user.name}`, description: c.headline, robots: { index: false } };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <h2 className="mb-2 flex items-center gap-2 font-display text-[13px] font-bold uppercase tracking-[0.18em] text-emerald-700">
        <span className="h-[3px] w-6 rounded-full bg-gradient-to-r from-emerald-600 to-blue-600" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function CvDisenadoPage({ params }: Props) {
  const c = await load((await params).id);
  if (!c) notFound();

  const skills = parseJsonArray(c.skills);
  const languages = parseJsonArray(c.languages);
  const projects = parseProjects(c.projects).slice(0, 8);
  const fileName = `CV_${c.user.name.replace(/\s+/g, "_")}`;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/talentos/${c.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-river-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Volver al perfil
        </Link>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-forest-700/70 sm:block">Elegí “Guardar como PDF” en la ventana de impresión.</p>
          <PrintButton fileName={fileName} />
        </div>
      </div>

      <article className="cv-sheet mx-auto grid max-w-[210mm] overflow-hidden rounded-2xl bg-[#ffffff] text-slate-800 shadow-float ring-1 ring-gray-200 sm:grid-cols-[34%_1fr] print:grid-cols-[34%_1fr] print:rounded-none print:shadow-none print:ring-0">
        <aside className="bg-gradient-to-b from-emerald-700 via-emerald-800 to-blue-900 p-7 text-white">
          <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full ring-4 ring-white/30">
            {c.photoUrl ? (
              <Image src={c.photoUrl} alt={c.user.name} fill sizes="144px" className="object-cover object-top" priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/10 font-display text-5xl font-bold">{c.user.name.slice(0, 1)}</div>
            )}
          </div>

          <div className="mt-7 space-y-2.5 text-[12.5px]">
            <p className="flex items-start gap-2 break-all">
              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200" /> {c.user.email}
            </p>
            {c.phone ? (
              <p className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200" /> {c.phone}
              </p>
            ) : null}
            <p className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200" /> {c.location}
            </p>
            {c.portfolio ? (
              <p className="flex items-start gap-2 break-all">
                <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200" /> {c.portfolio.replace(/^https?:\/\//, "")}
              </p>
            ) : null}
          </div>

          {skills.length ? (
            <div className="mt-8">
              <p className="mb-2.5 font-display text-[12px] font-bold uppercase tracking-[0.18em] text-emerald-200">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium ring-1 ring-white/20">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {languages.length ? (
            <div className="mt-8">
              <p className="mb-2.5 font-display text-[12px] font-bold uppercase tracking-[0.18em] text-emerald-200">Idiomas</p>
              <ul className="space-y-1 text-[12.5px]">
                {languages.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {c.availability ? (
            <div className="mt-8">
              <p className="mb-2.5 font-display text-[12px] font-bold uppercase tracking-[0.18em] text-emerald-200">Disponibilidad</p>
              <p className="text-[12.5px]">{c.availability}</p>
            </div>
          ) : null}

          <p className="mt-10 text-[10px] text-white/50">Generado con TucanJobs</p>
        </aside>

        <div className="space-y-6 p-7 sm:p-9">
          <header>
            <h1 className="font-display text-[34px] font-bold leading-tight text-slate-900">{c.user.name}</h1>
            <p className="mt-1.5 text-[14px] font-semibold text-blue-700">{c.headline}</p>
          </header>

          {c.bio ? (
            <Section title="Perfil">
              <p className="text-[13px] leading-relaxed text-slate-700">{c.bio}</p>
            </Section>
          ) : null}

          {c.experience ? (
            <Section title="Experiencia">
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-700">{c.experience}</p>
            </Section>
          ) : null}

          {projects.length ? (
            <Section title="Proyectos destacados">
              <ul className="grid gap-2.5">
                {projects.map((p) => (
                  <li key={p.name} className="break-inside-avoid">
                    <p className="text-[13px] font-bold text-slate-900">
                      {p.name}
                      {p.url ? <span className="ml-1.5 text-[11px] font-medium text-blue-700">{p.url.replace(/^https?:\/\//, "")}</span> : null}
                    </p>
                    <p className="text-[12.5px] leading-snug text-slate-600">{p.description}</p>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {c.education ? (
            <Section title="Formación">
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-slate-700">{c.education}</p>
            </Section>
          ) : null}
        </div>
      </article>
    </div>
  );
}
