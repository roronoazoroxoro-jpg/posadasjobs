import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import { SessionProvider, SiteFooter, SiteHeader } from "@/components/session";
import { ThemeProvider, themeInitScript } from "@/components/theme";
import { SITE_URL } from "@/lib/site";

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

const description =
  "La plataforma de empleo de Posadas y el NEA. Perfiles técnicos con CV y proyectos, empresas que publican puestos y compatibilidad inteligente entre talento y empleo.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TucanJobs — Trabajo y talento en Posadas",
    template: "%s · TucanJobs",
  },
  description,
  applicationName: "TucanJobs",
  keywords: ["empleo Posadas", "trabajo Misiones", "bolsa de trabajo NEA", "programadores Posadas", "CV", "TucanJobs"],
  icons: { icon: "/toucan-mate.jpg", apple: "/toucan-mate.jpg" },
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "TucanJobs",
    title: "TucanJobs — Tu próximo laburo está a un mate de distancia",
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "TucanJobs — Trabajo y talento en Posadas",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#059669" },
    { media: "(prefers-color-scheme: dark)", color: "#022c22" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${jakarta.variable} ${sora.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
        <ThemeProvider>
          <SessionProvider>
            <SiteHeader />
            <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-8 sm:px-6 print:max-w-none print:p-0">{children}</main>
            <SiteFooter />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
