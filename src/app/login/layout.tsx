import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ingresar",
  description: "Ingresá a TucanJobs con tu email para gestionar tu perfil, CV, empleos y mensajes.",
  alternates: { canonical: "/login" },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
