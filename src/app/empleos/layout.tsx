import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Empleos en Posadas y el NEA",
  description: "Ofertas de trabajo en Posadas, Misiones: presencial, remoto e híbrido. Mirá el mapa, tu compatibilidad y postulate en un clic.",
  alternates: { canonical: "/empleos" },
};

export default function EmpleosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
