import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Search, UserRound } from "lucide-react";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/auth";
import { JobCard } from "@/components/JobCard";

export const dynamic = "force-dynamic";

async function getFeaturedJobs() {
  const jobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    include: { company: { select: { id: true, companyName: true, industry: true } } },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  return jobs.map((j) => ({
    ...j,
    skills: parseJsonArray(j.skills),
    createdAt: j.createdAt.toISOString(),
  }));
}

export default async function HomePage() {
  const jobs = await getFeaturedJobs();
  const [jobCount, companyCount, talentCount] = await Promise.all([
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.companyProfile.count(),
    prisma.candidateProfile.count(),
  ]);

  return (
    <div className="-mt-8">
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden mesh">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="animate-fade-up">
            <p className="font-display text-4xl font-bold tracking-tight text-forest-950 sm:text-5xl lg:text-6xl">
              Posadas<span className="text-river-600">Jobs</span>
            </p>
            <h1 className="mt-4 max-w-xl text-balance text-xl font-medium text-forest-900/90 sm:text-2xl">
              Donde el talento del NEA encuentra su próximo mate… y su próximo laburo.
            </h1>
            <p className="mt-4 max-w-lg text-forest-800/75">
              Publicá tu perfil técnico o tu empresa. Postulate, contactá y construí equipo desde Posadas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/registro?rol=CANDIDATE"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-forest-600 to-river-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
              >
                Soy candidato <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/registro?rol=COMPANY"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-forest-800 ring-1 ring-forest-200 transition hover:bg-forest-50"
              >
                Soy empresa
              </Link>
            </div>
          </div>
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-forest-400/30 to-river-500/30 blur-2xl" />
            <Image
              src="/toucan-mate.jpg"
              alt="Tucán tomando mate — mascota de PosadasJobs"
              width={720}
              height={720}
              priority
              className="relative mx-auto w-full max-w-md animate-float rounded-[2rem] object-cover shadow-glow ring-4 ring-white/70"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-3">
        {[
          { icon: Search, label: "Empleos abiertos", value: jobCount },
          { icon: Building2, label: "Empresas", value: companyCount },
          { icon: UserRound, label: "Talentos", value: talentCount },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-forest-100 bg-white/80 px-5 py-4 shadow-soft">
            <item.icon className="h-5 w-5 text-river-600" />
            <p className="mt-2 font-display text-2xl font-bold text-forest-950">{item.value}</p>
            <p className="text-sm text-forest-700/70">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto mt-16 max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-forest-950">Empleos destacados</h2>
            <p className="text-sm text-forest-700/75">Oportunidades frescas en Posadas y alrededores.</p>
          </div>
          <Link href="/empleos" className="text-sm font-semibold text-river-700 hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-2">
        <div className="rounded-[1.5rem] bg-gradient-to-br from-forest-700 to-forest-900 p-8 text-white shadow-soft">
          <h3 className="font-display text-2xl font-bold">Para candidatos</h3>
          <p className="mt-2 text-forest-100/90">Armá tu perfil técnico, cargá tu CV y dejá que las empresas te encuentren.</p>
          <Link href="/registro?rol=CANDIDATE" className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-forest-800">
            Crear perfil
          </Link>
        </div>
        <div className="rounded-[1.5rem] bg-gradient-to-br from-river-700 to-river-950 p-8 text-white shadow-soft">
          <h3 className="font-display text-2xl font-bold">Para empresas</h3>
          <p className="mt-2 text-river-100/90">Publicá puestos, revisá postulaciones y contactá talento local.</p>
          <Link href="/registro?rol=COMPANY" className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-river-800">
            Publicar empleo
          </Link>
        </div>
      </section>
    </div>
  );
}
