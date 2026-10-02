"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
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

export function SiteHeader() {
  const { user, logout, loading } = useSession();
  const pathname = usePathname();

  const link = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`text-sm font-medium transition ${
          active ? "text-forest-700" : "text-forest-900/70 hover:text-river-700"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-forest-200/60 bg-white/75 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/toucan-mate.jpg" alt="PosadasJobs" width={40} height={40} className="rounded-full object-cover ring-2 ring-forest-300" />
          <span className="font-display text-lg font-bold tracking-tight text-forest-900">
            Posadas<span className="text-river-600">Jobs</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {link("/empleos", "Empleos")}
          {link("/empresas", "Empresas")}
          {link("/talentos", "Talentos")}
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-forest-100" />
          ) : user ? (
            <>
              <Link
                href="/panel"
                className="rounded-full bg-gradient-to-r from-forest-600 to-river-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:brightness-110"
              >
                Mi panel
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-full px-3 py-2 text-sm font-medium text-forest-800/70 hover:bg-forest-50"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-50">
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-gradient-to-r from-forest-600 to-river-600 px-4 py-2 text-sm font-semibold text-white shadow-soft"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-forest-200/70 bg-white/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 sm:flex-row sm:px-6">
        <div className="flex items-center gap-3">
          <Image src="/toucan-mate.jpg" alt="" width={36} height={36} className="rounded-full object-cover" />
          <div>
            <p className="font-display font-bold text-forest-900">PosadasJobs</p>
            <p className="text-xs text-forest-700/70">Talento y empresas del NEA, con mate.</p>
          </div>
        </div>
        <p className="text-xs text-forest-700/60">© {new Date().getFullYear()} PosadasJobs · Posadas, Misiones</p>
      </div>
    </footer>
  );
}
