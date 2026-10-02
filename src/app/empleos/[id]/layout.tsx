import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/auth";
import { JOB_TYPES, MODALITIES } from "@/lib/format";
import { clip, JsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

const getJob = cache((id: string) =>
  prisma.job.findUnique({ where: { id }, include: { company: true } }).catch(() => null),
);

const EMPLOYMENT: Record<string, string> = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
  INTERNSHIP: "INTERN",
};

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: "Empleo no encontrado" };
  const title = `${job.title} en ${job.company.companyName}`;
  const description = clip(
    `${MODALITIES[job.modality] || job.modality} · ${JOB_TYPES[job.type] || job.type} · ${job.location}. ${job.description}`,
  );
  return {
    title,
    description,
    alternates: { canonical: `/empleos/${job.id}` },
    openGraph: { title, description, url: `/empleos/${job.id}`, type: "article" },
    twitter: { title, description },
  };
}

export default async function EmpleoLayout({ params, children }: Props) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return children;

  const validThrough = new Date(job.createdAt.getTime() + 1000 * 60 * 60 * 24 * 60);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `${job.description}${job.requirements ? `\n\nRequisitos: ${job.requirements}` : ""}`,
    datePosted: job.createdAt.toISOString(),
    validThrough: validThrough.toISOString(),
    employmentType: EMPLOYMENT[job.type] || "OTHER",
    directApply: true,
    url: `${SITE_URL}/empleos/${job.id}`,
    skills: parseJsonArray(job.skills).join(", "),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.companyName,
      ...(job.company.website ? { sameAs: job.company.website } : {}),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Posadas",
        addressRegion: "Misiones",
        addressCountry: "AR",
        streetAddress: job.zone,
      },
    },
    ...(job.modality === "REMOTO"
      ? { jobLocationType: "TELECOMMUTE", applicantLocationRequirements: { "@type": "Country", name: "Argentina" } }
      : {}),
    ...(job.salaryMin || job.salaryMax
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "ARS",
            value: {
              "@type": "QuantitativeValue",
              ...(job.salaryMin ? { minValue: job.salaryMin } : {}),
              ...(job.salaryMax ? { maxValue: job.salaryMax } : {}),
              unitText: "MONTH",
            },
          },
        }
      : {}),
  };

  return (
    <>
      {job.status === "OPEN" ? <JsonLd data={data} /> : null}
      {children}
    </>
  );
}
