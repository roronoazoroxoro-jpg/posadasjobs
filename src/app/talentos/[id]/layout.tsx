import type { Metadata } from "next";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/auth";
import { clip, JsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }>; children: React.ReactNode };

const getCandidate = cache((id: string) =>
  prisma.candidateProfile.findUnique({ where: { id }, include: { user: { select: { name: true } } } }).catch(() => null),
);

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { id } = await params;
  const c = await getCandidate(id);
  if (!c) return { title: "Talento no encontrado" };
  const title = `${c.user.name} — ${clip(c.headline || "Talento", 70)}`;
  const description = clip(c.bio || `${c.user.name}, talento de ${c.location}. Skills: ${parseJsonArray(c.skills).join(", ")}`);
  return {
    title,
    description,
    alternates: { canonical: `/talentos/${c.id}` },
    openGraph: { title, description, url: `/talentos/${c.id}`, type: "profile" },
    twitter: { title, description },
  };
}

export default async function TalentoLayout({ params, children }: Props) {
  const { id } = await params;
  const c = await getCandidate(id);
  if (!c) return children;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: c.user.name,
          jobTitle: c.headline,
          description: clip(c.bio, 300),
          url: `${SITE_URL}/talentos/${c.id}`,
          ...(c.photoUrl ? { image: c.photoUrl.startsWith("http") ? c.photoUrl : `${SITE_URL}${c.photoUrl}` } : {}),
          address: { "@type": "PostalAddress", addressLocality: "Posadas", addressRegion: "Misiones", addressCountry: "AR" },
          knowsAbout: parseJsonArray(c.skills),
          ...(c.portfolio ? { sameAs: [c.portfolio] } : {}),
        }}
      />
      {children}
    </>
  );
}
