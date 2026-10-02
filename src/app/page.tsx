import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  FileText,
  Handshake,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap,
} from "lucide-react";
import { prisma } from "@/lib/db";
import { parseJsonArray, parseProjects } from "@/lib/auth";
import { JobCard } from "@/components/JobCard";
import { TalentCard } from "@/components/TalentCard";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";

export const dynamic = "force-dynamic";

const TECH = [
  "React",
  "Next.js",
  "Python",
  "Go",
  "Node.js",
  "PostgreSQL",
  "OpenCV",
  "MikroTik",
  "TypeScript",
  "Docker",
  "Linux",
  "Figma",
  "Power BI",
  "Ciberseguridad",
  "IA",
  "Soporte IT",
];

const STEPS = [
  {
    image: "/art/toucan-cv.jpg",
    icon: FileText,
    title: "Armá tu perfil",
    text: "Cargá tu CV en PDF, tus skills y tus proyectos reales. Tu vitrina profesional en minutos.",
  },
  {
    image: "/art/toucan-interview.jpg",
    icon: Handshake,
    title: "Conectá con empresas",
    text: "Postulate con un clic o dejá que las empresas de Posadas te encuentren y te contacten.",
  },
  {
    image: "/art/toucan-hired.jpg",
    icon: BadgeCheck,
    title: "Conseguí el laburo",
    text: "Seguí el estado de cada postulación en tu panel hasta el sí. Y festejá con un mate.",
  },
];

const FEATURES = [
  { icon: FileText, title: "CV visible y descargable", text: "PDF embebido, vista previa y descarga directa para reclutadores." },
  { icon: Zap, title: "Postulación instantánea", text: "Un clic, carta de presentación opcional y seguimiento en tiempo real." },
  { icon: Search, title: "Búsqueda inteligente", text: "Filtrá empleos por modalidad y tipo, y talentos por skill o proyecto." },
  { icon: ShieldCheck, title: "Acceso seguro con email", text: "Sesiones firmadas, claves cifradas y protección contra intentos repetidos." },
  { icon: Building2, title: "Panel para empresas", text: "Publicá, cerrá o reabrí puestos y gestioná candidatos por estado." },
  { icon: MapPin, title: "Hecho para el NEA", text: "Talento y empresas de Posadas, Misiones y la región, en un solo lugar." },
];

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

async function getFeaturedTalents() {
  const talents = await prisma.candidateProfile.findMany({
    where: { featured: true },
    include: { user: { select: { name: true } } },
    take: 2,
  });
  return talents.map((c) => ({
    id: c.id,
    name: c.user.name,
    headline: c.headline,
    bio: c.bio,
    skills: parseJsonArray(c.skills),
    location: c.location,
    availability: c.availability,
    photoUrl: c.photoUrl,
    featured: c.featured,
    projects: parseProjects(c.projects),
  }));
}

export default async function HomePage() {
  const [jobs, talents, jobCount, companyCount, talentCount, projectRows] = await Promise.all([
    getFeaturedJobs(),
    getFeaturedTalents(),
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.companyProfile.count(),
    prisma.candidateProfile.count(),
    prisma.candidateProfile.findMany({ select: { projects: true } }),
  ]);
  const projectCount = projectRows.reduce((acc, r) => acc + parseProjects(r.projects).length, 0);
  const star = talents[0];

  return (
    <div className="-mt-8">
      {/* HERO */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden">
        <div className="grid-pattern pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 animate-blob rounded-full bg-forest-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-32 h-[28rem] w-[28rem] animate-blob rounded-full bg-river-400/30 blur-3xl [animation-delay:-5s]" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-cyan-300/20 blur-3xl [animation-delay:-9s]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:pb-24 lg:pt-20">
          <div>
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-forest-800 shadow-soft ring-1 ring-forest-100">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-forest-500" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-forest-500" />
                </span>
                {jobCount} empleos abiertos en Posadas ahora
              </span>
            </div>
            <h1 className="mt-6 animate-fade-up font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-forest-950 [animation-delay:80ms] sm:text-5xl lg:text-6xl">
              Tu próximo laburo
              <br />
              está a un <span className="text-gradient">mate</span> de distancia.
            </h1>
            <p className="mt-5 max-w-lg animate-fade-up text-lg text-forest-800/80 [animation-delay:160ms]">
              La plataforma de empleo de Posadas y el NEA. Mostrá tu perfil técnico, tu CV y tus proyectos, o encontrá el talento que tu empresa necesita.
            </p>

            <form
              action="/empleos"
              method="get"
              className="glass mt-8 flex animate-fade-up flex-col gap-2 rounded-2xl p-2 shadow-float [animation-delay:240ms] sm:flex-row sm:items-center sm:rounded-full"
            >
              <label className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 shrink-0 text-river-600" />
                <span className="sr-only">Buscar empleos</span>
                <input
                  name="q"
                  placeholder="Puesto, skill o empresa…"
                  className="w-full bg-transparent py-2.5 text-sm text-forest-950 outline-none placeholder:text-forest-500"
                />
              </label>
              <button
                type="submit"
                className="btn-shine rounded-full bg-gradient-to-r from-forest-600 to-river-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:shadow-glow"
              >
                Buscar empleos
              </button>
            </form>

            <div className="mt-5 flex animate-fade-up flex-wrap items-center gap-2 text-xs text-forest-700 [animation-delay:320ms]">
              <span className="font-semibold">Populares:</span>
              {["React", "Python", "Soporte IT", "Diseño UX"].map((t) => (
                <Link
                  key={t}
                  href={`/empleos?q=${encodeURIComponent(t)}`}
                  className="rounded-full bg-white/70 px-3 py-1 font-medium ring-1 ring-forest-100 transition hover:-translate-y-0.5 hover:bg-white hover:text-river-700"
                >
                  {t}
                </Link>
              ))}
            </div>

            <div className="mt-8 flex animate-fade-up flex-wrap gap-3 [animation-delay:400ms]">
              <Link
                href="/registro?rol=CANDIDATE"
                className="group inline-flex items-center gap-2 rounded-full bg-forest-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-forest-800"
              >
                Soy candidato <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                href="/registro?rol=COMPANY"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-forest-800 ring-1 ring-forest-200 transition hover:-translate-y-0.5 hover:bg-forest-50"
              >
                Soy empresa
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-up [animation-delay:200ms]">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-forest-400/40 via-cyan-300/30 to-river-500/40 blur-2xl" />
            <div className="relative animate-float-slow">
              <Image
                src="/art/toucan-hero.jpg"
                alt="Tucán tomando mate mientras busca trabajo en su laptop"
                width={1024}
                height={768}
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="w-full rounded-[2rem] object-cover shadow-float ring-4 ring-white/80"
              />
            </div>

            <div className="glass absolute -left-4 top-8 hidden animate-float items-center gap-3 rounded-2xl px-4 py-3 shadow-float sm:flex [animation-delay:-1.5s]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-100 text-forest-700">
                <BadgeCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-forest-950">¡Postulación enviada!</p>
                <p className="text-[11px] text-forest-600">Desarrollador Full Stack</p>
              </div>
            </div>

            <div className="glass absolute -right-3 bottom-24 hidden animate-float items-center gap-3 rounded-2xl px-4 py-3 shadow-float sm:flex [animation-delay:-3s]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-river-100 text-river-700">
                <Building2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold text-forest-950">Una empresa vio tu CV</p>
                <p className="text-[11px] text-forest-600">hace 2 min</p>
              </div>
            </div>

            {star ? (
              <Link
                href={`/talentos/${star.id}`}
                className="glass absolute -bottom-6 left-6 hidden items-center gap-3 rounded-2xl px-4 py-3 shadow-float transition hover:-translate-y-1 sm:flex"
              >
                {star.photoUrl ? (
                  <Image src={star.photoUrl} alt={star.name} width={40} height={40} className="h-10 w-10 rounded-xl object-cover object-top" />
                ) : null}
                <div>
                  <p className="flex items-center gap-1 text-xs font-bold text-forest-950">
                    <Sparkles className="h-3.5 w-3.5 text-river-600" /> Talento destacado
                  </p>
                  <p className="text-[11px] text-forest-600">{star.name}</p>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen border-y border-forest-100 bg-white/60 py-5 backdrop-blur">
        <div className="mask-fade-x overflow-hidden">
          <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
            {[...TECH, ...TECH].map((t, i) => (
              <span
                key={`${t}-${i}`}
                className="rounded-full bg-gradient-to-r from-forest-50 to-river-50 px-4 py-2 text-sm font-semibold text-forest-800 ring-1 ring-forest-100"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Search, label: "Empleos abiertos", value: jobCount, tone: "from-forest-500 to-forest-700" },
          { icon: Building2, label: "Empresas", value: companyCount, tone: "from-river-500 to-river-700" },
          { icon: UserRound, label: "Talentos", value: talentCount, tone: "from-cyan-500 to-river-600" },
          { icon: Sparkles, label: "Proyectos publicados", value: projectCount, tone: "from-forest-500 to-river-600" },
        ].map((item, i) => (
          <Reveal key={item.label} delay={i * 90}>
            <div className="group rounded-2xl border border-forest-100 bg-white/85 p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-glow">
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.tone} text-white shadow-soft transition group-hover:scale-110`}>
                <item.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-display text-3xl font-extrabold text-forest-950">
                <CountUp value={item.value} />
              </p>
              <p className="text-sm text-forest-700/70">{item.label}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto mt-24 max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-river-600">Cómo funciona</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-forest-950 sm:text-4xl">De la búsqueda al “¡quedaste!” en tres pasos</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 140}>
              <article className="group h-full overflow-hidden rounded-3xl border border-forest-100 bg-white/90 shadow-soft transition duration-500 hover:-translate-y-2 hover:shadow-glow">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 360px"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 font-display text-lg font-extrabold text-forest-800 shadow-soft">
                    {i + 1}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="flex items-center gap-2 font-display text-xl font-bold text-forest-950">
                    <step.icon className="h-5 w-5 text-river-600" /> {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-800/75">{step.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED TALENT */}
      {talents.length ? (
        <section className="mx-auto mt-24 max-w-6xl">
          <Reveal className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-forest-600">Vitrina</p>
              <h2 className="mt-1 font-display text-3xl font-bold text-forest-950">Talento destacado</h2>
              <p className="mt-1 text-sm text-forest-700/75">Perfiles con CV, skills y proyectos listos para contactar.</p>
            </div>
            <Link href="/talentos" className="group inline-flex items-center gap-1 text-sm font-semibold text-river-700">
              Ver todos <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            {talents.map((t, i) => (
              <Reveal key={t.id} delay={i * 120}>
                <TalentCard talent={t} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* JOBS */}
      <section className="mx-auto mt-24 max-w-6xl">
        <Reveal className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-river-600">Oportunidades</p>
            <h2 className="mt-1 font-display text-3xl font-bold text-forest-950">Empleos destacados</h2>
            <p className="mt-1 text-sm text-forest-700/75">Puestos frescos en Posadas y alrededores.</p>
          </div>
          <Link href="/empleos" className="group inline-flex items-center gap-1 text-sm font-semibold text-river-700">
            Ver todos <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {jobs.map((job, i) => (
            <Reveal key={job.id} delay={i * 110}>
              <JobCard job={job} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto mt-24 max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-forest-600">Por qué PosadasJobs</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-forest-950 sm:text-4xl">Todo lo que necesitás, sin vueltas</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <div className="group h-full rounded-2xl border border-forest-100 bg-white/80 p-6 shadow-soft transition duration-300 hover:-translate-y-1 hover:border-river-200 hover:bg-white">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-forest-100 to-river-100 text-forest-700 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-forest-950">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-forest-800/75">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <Reveal className="mx-auto mt-24 max-w-6xl">
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-forest-700 via-forest-600 to-river-700 bg-[length:200%_100%] p-8 text-white shadow-glow animate-gradient-x sm:p-12">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">¿Listo para que te encuentren?</h2>
              <p className="mt-3 max-w-lg text-white/85">
                Creá tu cuenta gratis con tu email, subí tu CV y empezá a postularte hoy. Las empresas de Posadas ya están buscando.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/registro?rol=CANDIDATE"
                  className="btn-shine inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-forest-800 shadow-soft transition hover:-translate-y-0.5"
                >
                  Crear mi perfil <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/registro?rol=COMPANY"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white ring-1 ring-white/50 transition hover:bg-white/10"
                >
                  Publicar un empleo
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-48 sm:w-64">
              <Image
                src="/art/toucan-hired.jpg"
                alt="Tucán festejando con un maletín y un mate"
                width={512}
                height={512}
                sizes="256px"
                className="animate-float rounded-[1.75rem] object-cover shadow-float ring-4 ring-white/30"
              />
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
