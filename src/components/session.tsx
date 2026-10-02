"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Briefcase, Building2, Menu, UserRound, X } from "lucide-react";
import { api } from "@/lib/format";

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  candidate: {
    id: string;
    headline: string;
    bio: string;
    skills: string[];
    experience: string;
    education: string;
    location: string;
    phone: string;
    cvText: string;
    linkedin: string;
    portfolio: string;
    availability: string;
    photoUrl?: string;
    projects?: { name: string; description: string; url?: string }[];
    languages?: string[];
    featured?: boolean;
    cvFileUrl?: string;
    cvFileName?: string;
    cvPreviews?: string[];
  } | null;
  company: {
    id: string;
    companyName: string;
    description: string;
    industry: string;
    website: string;
    location: string;
    phone: string;
    size: string;
  } | null;
};

type SessionCtx = {
  user: PublicUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<SessionCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: PublicUser | null }>("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return <Ctx.Provider value={{ user, loading, refresh, logout }}>{children}</Ctx.Provider>;
}

export function useSession() {
  return useContext(Ctx);
}

const NAV = [
  { href: "/empleos", label: "Empleos", icon: Briefcase },
  { href: "/empresas", label: "Empresas", icon: Building2 },
  { href: "/talentos", label: "Talentos", icon: UserRound },
];

export function SiteHeader() {
  const { user, logout, loading } = useSession();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled ? "border-b border-forest-200/70 bg-white/80 shadow-soft backdrop-blur-xl" : "border-b border-transparent bg-white/40 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative">
            <span className="absolute inset-0 rounded-full bg-forest-400/40 opacity-0 blur-md transition group-hover:opacity-100" />
            <Image
              src="/toucan-mate.jpg"
              alt="PosadasJobs"
              width={40}
              height={40}
              className="relative rounded-full object-cover ring-2 ring-forest-300 transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-110"
            />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-forest-900">
            Posadas<span className="text-gradient">Jobs</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-white/60 p-1 ring-1 ring-forest-100 md:flex">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-300 ${
                isActive(href)
                  ? "bg-gradient-to-r from-forest-600 to-river-600 text-white shadow-soft"
                  : "text-forest-900/70 hover:bg-forest-50 hover:text-river-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-forest-100" />
          ) : user ? (
            <>
              <Link
                href="/panel"
                className="btn-shine hidden rounded-full bg-gradient-to-r from-forest-600 to-river-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow sm:inline-flex"
              >
                Mi panel
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-forest-800/70 hover:bg-forest-50 sm:inline-flex"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-50 sm:inline-flex">
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="btn-shine hidden rounded-full bg-gradient-to-r from-forest-600 to-river-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow sm:inline-flex"
              >
                Crear cuenta
              </Link>
            </>
          )}
          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-forest-800 ring-1 ring-forest-200 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-forest-100 bg-white/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 md:hidden ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                isActive(href) ? "bg-forest-50 text-forest-800" : "text-forest-900/80"
              }`}
            >
              <Icon className="h-4 w-4 text-river-600" /> {label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-forest-100 pt-3">
            {user ? (
              <>
                <Link href="/panel" className="rounded-full bg-gradient-to-r from-forest-600 to-river-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Mi panel
                </Link>
                <button type="button" onClick={() => void logout()} className="rounded-full px-4 py-2.5 text-sm font-semibold text-forest-800 ring-1 ring-forest-200">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-full px-4 py-2.5 text-center text-sm font-semibold text-forest-800 ring-1 ring-forest-200">
                  Ingresar
                </Link>
                <Link href="/registro" className="rounded-full bg-gradient-to-r from-forest-600 to-river-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Crear cuenta
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-river-950 text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-forest-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-river-500/20 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/toucan-mate.jpg" alt="" width={48} height={48} className="rounded-full object-cover ring-2 ring-white/20" />
            <div>
              <p className="font-display text-xl font-bold">PosadasJobs</p>
              <p className="text-sm text-white/60">Talento y empresas del NEA, con mate.</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            La plataforma de empleo hecha en Posadas, Misiones. Perfiles técnicos, CV y proyectos reales, conectados con empresas de la región.
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-forest-300">Explorar</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {NAV.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="transition hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-river-300">Empezá hoy</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            <li>
              <Link href="/registro?rol=CANDIDATE" className="transition hover:text-white">
                Crear perfil de candidato
              </Link>
            </li>
            <li>
              <Link href="/registro?rol=COMPANY" className="transition hover:text-white">
                Publicar un empleo
              </Link>
            </li>
            <li>
              <Link href="/login" className="transition hover:text-white">
                Ingresar
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-white/50 sm:px-6">
          © {new Date().getFullYear()} PosadasJobs · Posadas, Misiones, Argentina
        </p>
      </div>
    </footer>
  );
}
