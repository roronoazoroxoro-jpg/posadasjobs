"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/components/session";
import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const pathname = usePathname();

  if (loading) {
    return <p className="text-sm text-forest-700/70">Cargando panel…</p>;
  }

  if (!user) {
    return <p className="text-sm text-forest-700/70">Redirigiendo al login…</p>;
  }

  const links =
    user.role === "COMPANY"
      ? [
          { href: "/panel", label: "Resumen" },
          { href: "/panel/perfil", label: "Perfil empresa" },
          { href: "/panel/empleos", label: "Mis empleos" },
          { href: "/panel/postulaciones", label: "Postulaciones" },
        ]
      : [
          { href: "/panel", label: "Resumen" },
          { href: "/panel/perfil", label: "Mi perfil" },
          { href: "/panel/cv", label: "Curriculum" },
          { href: "/panel/postulaciones", label: "Mis postulaciones" },
        ];

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="h-fit rounded-3xl border border-forest-100 bg-white/90 p-4 shadow-soft">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-forest-600">
          {user.role === "COMPANY" ? "Empresa" : "Candidato"}
        </p>
        <p className="mt-1 px-2 font-display text-lg font-bold text-forest-950">{user.name}</p>
        <nav className="mt-4 space-y-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-gradient-to-r from-forest-600 to-river-600 text-white" : "text-forest-800 hover:bg-forest-50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
