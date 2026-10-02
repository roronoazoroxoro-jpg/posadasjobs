import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Empresas que contratan en Posadas",
  description: "Conocé las empresas de Posadas y Misiones que buscan talento y sus puestos abiertos.",
  alternates: { canonical: "/empresas" },
};

export default function EmpresasLayout({ children }: { children: React.ReactNode }) {
  return children;
}
