import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Creá tu cuenta gratis en TucanJobs: perfil de candidato con CV y proyectos, o perfil de empresa para publicar empleos.",
  alternates: { canonical: "/registro" },
};

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
