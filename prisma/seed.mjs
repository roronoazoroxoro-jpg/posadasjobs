import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.user.count();
  if (count > 0) {
    console.log("Seed omitido: ya hay datos.");
    return;
  }

  const passwordHash = await bcrypt.hash("Posadas2026!", 10);

  const candidateUser = await prisma.user.create({
    data: {
      email: "candidato@posadasjobs.com",
      passwordHash,
      role: "CANDIDATE",
      name: "Valentina Acosta",
      candidate: {
        create: {
          headline: "Desarrolladora Full Stack | React & Node.js",
          bio: "Desarrolladora de Posadas con experiencia en plataformas web, APIs y productos digitales para el NEA.",
          skills: JSON.stringify(["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Tailwind"]),
          experience: "3 años en desarrollo web. Participé en sistemas de salud, e-commerce y apps internas.",
          education: "Licenciatura en Sistemas — UNaM",
          location: "Posadas, Misiones",
          phone: "+54 376 400-0001",
          cvText:
            "VALENTINA ACOSTA\nDesarrolladora Full Stack\n\nEXPERIENCIA\n- Full Stack Developer en startups locales\n- Integraciones API y dashboards\n\nEDUCACIÓN\n- Lic. en Sistemas, UNaM\n\nSKILLS\nReact, Next.js, TypeScript, Node.js, Prisma, Tailwind",
          linkedin: "https://linkedin.com",
          portfolio: "https://github.com",
          availability: "Disponible",
        },
      },
    },
    include: { candidate: true },
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
            "Empresa de software de Posadas que construye productos digitales para el interior del país. Cultura mateada y remota-friendly.",
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

  await prisma.job.createMany({
    data: [
      {
        companyId: company1.company.id,
        title: "Desarrollador/a Frontend React",
        description:
          "Sumate al equipo de producto para construir interfaces modernas con React y Next.js. Trabajo híbrido desde Posadas.",
        requirements: "2+ años con React, TypeScript y CSS moderno. Experiencia con Git y trabajo en equipo.",
        location: "Posadas, Misiones",
        type: "FULL_TIME",
        modality: "HIBRIDO",
        salaryMin: 900000,
        salaryMax: 1400000,
        skills: JSON.stringify(["React", "TypeScript", "Next.js", "Tailwind"]),
        status: "OPEN",
      },
      {
        companyId: company1.company.id,
        title: "Backend Node.js / APIs",
        description:
          "Diseño e implementación de APIs REST, autenticación y bases de datos para productos SaaS regionales.",
        requirements: "Node.js, Prisma o similar, SQL, buenas prácticas de seguridad.",
        location: "Posadas, Misiones",
        type: "FULL_TIME",
        modality: "REMOTO",
        salaryMin: 1000000,
        salaryMax: 1600000,
        skills: JSON.stringify(["Node.js", "Prisma", "PostgreSQL", "API REST"]),
        status: "OPEN",
      },
      {
        companyId: company2.company.id,
        title: "Analista de Sistemas de Salud",
        description:
          "Relevamiento de procesos clínicos y acompañamiento de implementaciones de software sanitario.",
        requirements: "Conocimiento del sector salud, documentación funcional y comunicación con usuarios.",
        location: "Posadas, Misiones",
        type: "FULL_TIME",
        modality: "PRESENCIAL",
        salaryMin: 800000,
        salaryMax: 1200000,
        skills: JSON.stringify(["Análisis", "Salud", "Documentación", "SQL"]),
        status: "OPEN",
      },
      {
        companyId: company2.company.id,
        title: "Diseñador/a UX/UI",
        description: "Diseño de experiencias claras para pacientes y equipos clínicos. Portfolio requerido.",
        requirements: "Figma, sistemas de diseño, prototipado y validación con usuarios.",
        location: "Posadas, Misiones",
        type: "PART_TIME",
        modality: "HIBRIDO",
        salaryMin: 600000,
        salaryMax: 950000,
        skills: JSON.stringify(["Figma", "UX", "UI", "Prototipado"]),
        status: "OPEN",
      },
    ],
  });

  console.log("Seed OK");
  console.log("Candidato:", candidateUser.email, "/ Posadas2026!");
  console.log("Empresa:", company1.email, "/ Posadas2026!");
  console.log("Empresa 2:", company2.email, "/ Posadas2026!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
