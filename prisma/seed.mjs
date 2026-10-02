import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const VALENTIN_PROJECTS = [
  {
    name: "Subiendo — plataforma de viajes",
    description: "Pasajero, conductor y admin. Go, mapas, pagos, GPS y operación real en Posadas.",
    url: "https://subiendo.app",
  },
  {
    name: "Sistema IPS – Banco Macro",
    description: "Recaudación de farmacias, conciliación bancaria, DeudaPub y comprobantes QR.",
    url: "",
  },
  {
    name: "Network Mapper IPS",
    description: "Escaneo de red, planos 2D/3D, VLANs, IP/MAC e inventario institucional.",
    url: "https://github.com/roronoazoroxoro-jpg/mapeo-network-ips",
  },
  {
    name: "GlucoControl IPS",
    description: "Asistente de diabetes para IPS Misiones: seguimiento de glucosa y acompañamiento.",
    url: "https://glucocontrol-ips.vercel.app",
  },
  {
    name: "MCneumáticos Ecommerce",
    description: "Tienda, catálogos por aro, chatbot de stock y marketing digital.",
    url: "https://mcneumaticoss-chi.vercel.app",
  },
  {
    name: "PosadasJobs",
    description: "Plataforma de empleo para Posadas: perfiles, CV, empresas y postulaciones.",
    url: "https://posadasjobs.vercel.app",
  },
  {
    name: "DiagnoCel Pro",
    description: "Software de escritorio para diagnóstico Android/iPhone con ADB.",
    url: "https://github.com/roronoazoroxoro-jpg",
  },
  {
    name: "AKI Systems",
    description: "Asistente con voz, chatbots, kinesiología, login facial y emergencias.",
    url: "https://akisystems-eta.vercel.app",
  },
  {
    name: "Asistencias con login facial",
    description: "Control de faltas y acceso biométrico con OpenCV / InsightFace.",
    url: "https://github.com/roronoazoroxoro-jpg/sistema-faltas-login-facial",
  },
  {
    name: "Diario digital IPSM",
    description: "Portal institucional de novedades del IPSM.",
    url: "https://github.com/roronoazoroxoro-jpg/diario-digital-ipsm",
  },
  {
    name: "Scrum IPS",
    description: "Tablero ágil para el equipo técnico de IPS Misiones.",
    url: "https://github.com/roronoazoroxoro-jpg/scrum-ips",
  },
  {
    name: "GEO TIERRA",
    description: "Plataforma de gestión territorial (San Pedro, Misiones).",
    url: "https://github.com/roronoazoroxoro-jpg/geo-tierra",
  },
  {
    name: "APP HAKA — Martín de Moussy",
    description: "Campus digital del Colegio Provincial Superior N°1.",
    url: "https://github.com/roronoazoroxoro-jpg/APP-HAKA-Martin-de-Moussy-Colegio-Nacional",
  },
  {
    name: "CallTecnics",
    description: "Asistente digital para técnicos de Posadas, Misiones.",
    url: "https://github.com/roronoazoroxoro-jpg/calltecnics",
  },
  {
    name: "IPSM Oncológico",
    description: "Sistema de gestión oncológica IPS Misiones.",
    url: "https://github.com/roronoazoroxoro-jpg/ipsm-oncologico",
  },
  {
    name: "Gobierno de Misiones",
    description: "App del portal oficial misiones.gob.ar.",
    url: "https://github.com/roronoazoroxoro-jpg/gobierno-misiones",
  },
  {
    name: "Postres Vivi",
    description: "Sitio de panadería artesanal y pedidos por WhatsApp.",
    url: "https://github.com/roronoazoroxoro-jpg/postres-vivi",
  },
  {
    name: "Pizarra táctica",
    description: "Tablero táctico digital para dibujar jugadas y analizar videos.",
    url: "https://github.com/roronoazoroxoro-jpg/pizarra-tactica",
  },
  {
    name: "OCR de recetas médicas",
    description: "Digitalización de recetas con Tesseract y extracción estructurada.",
    url: "",
  },
  {
    name: "Detección de personas y objetos",
    description: "Visión en tiempo real con YOLO, alertas y análisis de escena.",
    url: "",
  },
];

const VALENTIN_CV = `VALENTÍN VAZQUEZ
Analista de Sistemas · Desarrollador Full Stack
Posadas, Misiones, Argentina
☎ 376 502-6029 · ✉ valentinprogramer234@gmail.com
GitHub: github.com/roronoazoroxoro-jpg
Portfolio: porfolio-vazquez-valentin.vercel.app
Disponibilidad: FULL TIME · Presencial o remoto

RESUMEN PROFESIONAL
Técnico Superior en Programación e Innovación Tecnológica. Combino desarrollo full stack, soporte IT e infraestructura de redes. En 2026 llevé a producción sistemas de movilidad, salud digital, recaudación bancaria, ecommerce, visión por computadora y mapeo de red institucional. Me especializo en automatizar procesos reales, desplegar productos de punta a punta y resolver problemas técnicos en operación.

EXPERIENCIA LABORAL

Desarrollador Técnico / Soporte IT — Actualidad
Instituto de Previsión Social de Misiones (IPSM) — Posadas
• Soporte técnico integral: PCs, impresoras, usuarios y continuidad operativa.
• Redes y cableado estructurado: racks, patch panels, switches, VLANs y MikroTik.
• Network Mapper IPS: inventario de red, conflictos IP/MAC y planos 2D/3D.
• Sistema IPS–Banco Macro: cierre de caja, conciliación y comprobantes con QR.
• GlucoControl IPS: seguimiento de glucosa para afiliados.
• Sistemas internos 2026: Scrum IPS, diario digital, turnos, asistencias faciales.

Fundador y Desarrollador Full Stack — 2026 – Actualidad
Subiendo — subiendo.app · Movilidad urbana en Posadas
• App pasajero, conductor, panel de operaciones y backend en Go.
• Mapas/GPS en tiempo real, tarifas, Mercado Pago, billetera y tickets.
• Producción en VPS con PostgreSQL, PWA y panel admin.

Desarrollo Web, Ecommerce y Marketing Digital — 2026 – Actualidad
MCneumáticos — remoto Argentina / Paraguay
• Ecommerce, catálogos, chatbot, campañas Meta/Google y SEO local.

Técnico Informático — 2020 – 2024
Subsecretaría de Acción Social
• Soporte técnico y continuidad de sistemas institucionales.

FORMACIÓN
• Técnico Superior en Programación e Innovación Tecnológica — INCADE (Finalizado)
• Bachillerato Secundario — Colegio Martín de Moussy (Finalizado)

CURSOS
• Técnico Electricista Automotriz — CFP N°1
• Marketing Digital Avanzado — Fundación Alfa
• Operador de PC Avanzado — Master Computación
• Cámaras de Seguridad — INCADE
• IA y sus Herramientas — INCADE

SKILLS
Python, Go, JavaScript, TypeScript, React, Node.js, Next.js, Electron, PostgreSQL, MySQL, MongoDB, SQLite, Firebase, APIs REST, OpenCV, YOLO, IA, Linux, MikroTik, Redes, Power BI, Git, Vercel, Docker, Nginx, Ciberseguridad

IDIOMAS
Español — Nativo | Inglés — Avanzado`;

const VALENTIN_EXPERIENCE = `Desarrollador Técnico / Soporte IT — IPSM Posadas (Actualidad)
Soporte IT, redes MikroTik, Network Mapper, recaudación Banco Macro, GlucoControl, Scrum, diario digital, turnos y asistencias con login facial.

Fundador Full Stack — Subiendo.app (2026 – Actualidad)
Plataforma de movilidad urbana en producción: pasajero, conductor, admin, Go + PostgreSQL, GPS, Mercado Pago.

Ecommerce & Marketing — MCneumáticos (2026 – Actualidad)
Tienda online, catálogos, chatbot de stock, campañas digitales y continuidad del sitio.

Técnico Informático — Subsecretaría de Acción Social (2020 – 2024)
Soporte institucional, equipos y asistencia a usuarios.`;

const VALENTIN_EDUCATION = `Técnico Superior en Programación e Innovación Tecnológica — INCADE (Finalizado)
Bachillerato Secundario — Colegio Martín de Moussy (Finalizado)
Cursos: Electricista Automotriz (CFP N°1), Marketing Digital (Fundación Alfa), Operador PC (Master Computación), Cámaras de Seguridad (INCADE), IA y herramientas (INCADE)`;

const VALENTIN_SKILLS = [
  "Python",
  "Go",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Electron",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "SQLite",
  "Firebase",
  "APIs REST",
  "OpenCV",
  "YOLO",
  "Inteligencia Artificial",
  "Linux",
  "MikroTik",
  "Redes",
  "Docker",
  "Nginx",
  "Vercel",
  "Git",
  "Power BI",
  "Ciberseguridad",
];

async function main() {
  // Reset clean seed so Valentin always is the featured profile
  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.job.deleteMany();
  await prisma.candidateProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Posadas2026!", 10);

  const valentin = await prisma.user.create({
    data: {
      email: "valentinprogramer234@gmail.com",
      passwordHash,
      role: "CANDIDATE",
      name: "Valentín Vazquez",
      candidate: {
        create: {
          headline: "Analista de Sistemas · Desarrollador Full Stack | IPSM · Subiendo · IA",
          bio: "Técnico Superior en Programación e Innovación Tecnológica. Combino desarrollo full stack, soporte IT e infraestructura de redes. En 2026 llevé a producción sistemas de movilidad, salud digital, recaudación bancaria, ecommerce, visión por computadora y mapeo de red institucional. Productos reales para salud, movilidad y organismos públicos en Posadas.",
          skills: JSON.stringify(VALENTIN_SKILLS),
          experience: VALENTIN_EXPERIENCE,
          education: VALENTIN_EDUCATION,
          location: "Posadas, Misiones, Argentina",
          phone: "+54 376 502-6029",
          cvText: VALENTIN_CV,
          linkedin: "",
          portfolio: "https://porfolio-vazquez-valentin.vercel.app",
          availability: "Disponible · Full time",
          photoUrl: "/valentin.jpg",
          projects: JSON.stringify(VALENTIN_PROJECTS),
          languages: JSON.stringify(["Español — Nativo", "Inglés — Avanzado"]),
          featured: true,
        },
      },
    },
  });

  // Keep secondary demo candidate
  await prisma.user.create({
    data: {
      email: "candidato@posadasjobs.com",
      passwordHash,
      role: "CANDIDATE",
      name: "Demo Candidato",
      candidate: {
        create: {
          headline: "Cuenta demo de candidato",
          bio: "Perfil de prueba para explorar PosadasJobs.",
          skills: JSON.stringify(["React", "TypeScript"]),
          experience: "Demo",
          education: "Demo",
          location: "Posadas, Misiones",
          phone: "",
          cvText: "CV demo",
          availability: "Disponible",
          featured: false,
        },
      },
    },
  });

  const company1 = await prisma.user.create({
    data: {
      email: "empresa@posadasjobs.com",
      passwordHash,
      role: "COMPANY",
      name: "RRHH Tech Misiones",
      company: {
        create: {
          companyName: "Tech Misiones SA",
          description:
            "Empresa de software de Posadas. Productos digitales, cultura mateada y foco en talento local del NEA.",
          industry: "Tecnología",
          website: "https://techmisiones.example",
          location: "Posadas, Misiones",
          phone: "+54 376 400-1000",
          size: "11-50",
        },
      },
    },
    include: { company: true },
  });

  const company2 = await prisma.user.create({
    data: {
      email: "salud@posadasjobs.com",
      passwordHash,
      role: "COMPANY",
      name: "RRHH Salud Digital NEA",
      company: {
        create: {
          companyName: "Salud Digital NEA",
          description: "Plataformas de salud digital para clínicas y obras sociales en Misiones y Corrientes.",
          industry: "Salud",
          website: "https://saludnea.example",
          location: "Posadas, Misiones",
          phone: "+54 376 400-2000",
          size: "51-200",
        },
      },
    },
    include: { company: true },
  });

  const company3 = await prisma.user.create({
    data: {
      email: "ips@posadasjobs.com",
      passwordHash,
      role: "COMPANY",
      name: "RRHH IPSM Demo",
      company: {
        create: {
          companyName: "IPSM Tecnología (demo)",
          description: "Perfil demo orientado a sistemas institucionales, redes y salud digital en Posadas.",
          industry: "Sector público / Salud",
          website: "",
          location: "Posadas, Misiones",
          phone: "",
          size: "200+",
        },
      },
    },
    include: { company: true },
  });

  await prisma.job.createMany({
    data: [
      {
        companyId: company1.company.id,
        title: "Desarrollador/a Full Stack (Next.js + Node)",
        description:
          "Sumate a un equipo que construye productos web modernos. Buscamos alguien con experiencia real en React/Next y APIs.",
        requirements: "Next.js, TypeScript, Prisma o similar, Git, deploy en Vercel/VPS.",
        location: "Posadas, Misiones",
        type: "FULL_TIME",
        modality: "HIBRIDO",
        salaryMin: 1100000,
        salaryMax: 1800000,
        skills: JSON.stringify(["Next.js", "TypeScript", "Node.js", "Prisma"]),
        status: "OPEN",
      },
      {
        companyId: company1.company.id,
        title: "DevOps / Infra Linux junior-mid",
        description: "Administración de VPS, Nginx, Docker y monitoreo de apps en producción.",
        requirements: "Linux, redes básicas, Docker, Nginx. MikroTik es un plus.",
        location: "Posadas, Misiones",
        type: "FULL_TIME",
        modality: "PRESENCIAL",
        salaryMin: 900000,
        salaryMax: 1400000,
        skills: JSON.stringify(["Linux", "Docker", "Nginx", "Redes"]),
        status: "OPEN",
      },
      {
        companyId: company2.company.id,
        title: "Desarrollador/a Salud Digital",
        description: "Sistemas clínicos, dashboards y acompañamiento digital de pacientes.",
        requirements: "Experiencia en apps de salud o institucionales. Python o Node. UI clara.",
        location: "Posadas, Misiones",
        type: "FULL_TIME",
        modality: "HIBRIDO",
        salaryMin: 1000000,
        salaryMax: 1600000,
        skills: JSON.stringify(["Python", "React", "PostgreSQL", "Salud"]),
        status: "OPEN",
      },
      {
        companyId: company2.company.id,
        title: "Especialista Computer Vision",
        description: "Proyectos con OpenCV/YOLO: detección, OCR y asistencias biométricas.",
        requirements: "OpenCV, Python, experiencia con cámaras y datasets reales.",
        location: "Posadas, Misiones",
        type: "CONTRACT",
        modality: "REMOTO",
        salaryMin: 1200000,
        salaryMax: 2000000,
        skills: JSON.stringify(["OpenCV", "YOLO", "Python", "IA"]),
        status: "OPEN",
      },
      {
        companyId: company3.company.id,
        title: "Analista de Sistemas / Soporte avanzado",
        description: "Soporte de planta, redes y desarrollo de herramientas internas.",
        requirements: "Soporte IT, redes, scripting y ganas de automatizar procesos.",
        location: "Posadas, Misiones",
        type: "FULL_TIME",
        modality: "PRESENCIAL",
        salaryMin: 850000,
        salaryMax: 1300000,
        skills: JSON.stringify(["Soporte IT", "Redes", "MikroTik", "Python"]),
        status: "OPEN",
      },
      {
        companyId: company1.company.id,
        title: "Mobile / PWA Developer",
        description: "Apps PWA y experiencias móviles para productos regionales.",
        requirements: "React, PWA, consumo de APIs, UX móvil.",
        location: "Posadas, Misiones",
        type: "PART_TIME",
        modality: "REMOTO",
        salaryMin: 700000,
        salaryMax: 1100000,
        skills: JSON.stringify(["React", "PWA", "JavaScript", "UX"]),
        status: "OPEN",
      },
    ],
  });

  console.log("Seed OK — Valentín Vazquez destacado");
  console.log("Login Valentín:", valentin.email, "/ Posadas2026!");
  console.log("Empresa demo: empresa@posadasjobs.com / Posadas2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
