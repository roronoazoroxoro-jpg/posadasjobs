import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { SessionProvider, SiteFooter, SiteHeader } from "@/components/session";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PosadasJobs — Trabajo y talento en Posadas",
  description:
    "Plataforma para que candidatos publiquen su perfil y CV, y empresas publiquen puestos en Posadas, Misiones.",
  icons: { icon: "/toucan-mate.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jakarta.variable} ${sora.variable}`}>
      <body className="font-sans antialiased" style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
        <SessionProvider>
          <SiteHeader />
          <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8 sm:px-6">{children}</main>
          <SiteFooter />
        </SessionProvider>
      </body>
    </html>
  );
}
