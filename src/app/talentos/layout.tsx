import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Talentos de Posadas y el NEA",
  description: "Perfiles técnicos con CV, skills y proyectos reales de Posadas y Misiones, listos para que las empresas los contacten.",
  alternates: { canonical: "/talentos" },
};

export default function TalentosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
