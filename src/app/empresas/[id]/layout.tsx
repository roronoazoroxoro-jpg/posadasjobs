import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { clip } from "@/lib/seo";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const c = await prisma.companyProfile.findUnique({ where: { id } }).catch(() => null);
  if (!c) return { title: "Empresa no encontrada" };
  const title = `${c.companyName} — empleos en ${c.location}`;
  const description = clip(c.description || `${c.companyName} busca talento en TucanJobs.`);
  return {
    title,
    description,
    alternates: { canonical: `/empresas/${c.id}` },
    openGraph: { title, description, url: `/empresas/${c.id}` },
  };
}

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
