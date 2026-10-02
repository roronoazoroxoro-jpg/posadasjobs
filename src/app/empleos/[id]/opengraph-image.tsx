import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/auth";
import { formatSalary, MODALITIES } from "@/lib/format";
import { fetchImageData, OG_SIZE, OgCard } from "@/lib/og";

export const alt = "Empleo en TucanJobs";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, include: { company: true } }).catch(() => null);
  const image = await fetchImageData("/art/toucan-hero.jpg");
  if (!job) {
    return new ImageResponse(<OgCard eyebrow="TucanJobs" title="Empleo no disponible" image={image} />, size);
  }
  return new ImageResponse(
    (
      <OgCard
        eyebrow={`${job.company.companyName} · ${MODALITIES[job.modality] || job.modality}`}
        title={job.title}
        subtitle={formatSalary(job.salaryMin, job.salaryMax)}
        chips={parseJsonArray(job.skills)}
        image={image}
      />
    ),
    size,
  );
}
