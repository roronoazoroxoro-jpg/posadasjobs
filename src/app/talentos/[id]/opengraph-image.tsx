import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/auth";
import { fetchImageData, OG_SIZE, OgCard } from "@/lib/og";

export const alt = "Perfil de talento en TucanJobs";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await prisma.candidateProfile
    .findUnique({ where: { id }, include: { user: { select: { name: true } } } })
    .catch(() => null);
  if (!c) {
    return new ImageResponse(<OgCard eyebrow="TucanJobs" title="Perfil no disponible" image={await fetchImageData("/art/toucan-cv.jpg")} />, size);
  }
  const photo = c.photoUrl ? await fetchImageData(c.photoUrl) : null;
  const headline = c.headline.length > 70 ? `${c.headline.slice(0, 69)}…` : c.headline;
  return new ImageResponse(
    (
      <OgCard
        eyebrow={c.featured ? "Talento destacado" : "Talento del NEA"}
        title={c.user.name}
        subtitle={headline}
        chips={parseJsonArray(c.skills)}
        image={photo || (await fetchImageData("/art/toucan-cv.jpg"))}
        round={Boolean(photo)}
      />
    ),
    size,
  );
}
