import { readFile } from "fs/promises";
import { join } from "path";
import { ImageResponse } from "next/og";
import { OG_SIZE, OgCard } from "@/lib/og";

export const alt = "TucanJobs — Tu próximo laburo está a un mate de distancia";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  let image: string | null = null;
  try {
    const buf = await readFile(join(process.cwd(), "public", "art", "toucan-hero.jpg"));
    image = `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {}
  return new ImageResponse(
    (
      <OgCard
        eyebrow="Empleo y talento del NEA"
        title="Tu próximo laburo está a un mate de distancia"
        chips={["Perfiles con CV", "Match inteligente", "Empresas locales"]}
        image={image}
      />
    ),
    size,
  );
}
