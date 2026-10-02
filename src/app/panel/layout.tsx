"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building2, FileText, LayoutDashboard, MessageCircle, UserRound, Users } from "lucide-react";
import { useSession } from "@/components/session";
import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  const { user, loading, unread } = useSession();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <div className="h-72 animate-pulse rounded-3xl bg-white/70" />
        <div className="h-96 animate-pulse rounded-3xl bg-white/70" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-sm text-forest-700/70">Redirigiendo al login…</p>;
  }

  const links =
    user.role === "COMPANY"
      ? [
          { href: "/panel", label: "Resumen", icon: LayoutDashboard },
          { href: "/panel/perfil", label: "Perfil empresa", icon: Building2 },
          { href: "/panel/empleos", label: "Mis empleos", icon: Briefcase },
          { href: "/panel/postulaciones", label: "Postulaciones", icon: Users },
          { href: "/panel/mensajes", label: "Mensajes", icon: MessageCircle, badge: unread },
        ]
      : [
          { href: "/panel", label: "Resumen", icon: LayoutDashboard },
          { href: "/panel/perfil", label: "Mi perfil", icon: UserRound },
          { href: "/panel/cv", label: "Curriculum", icon: FileText },
          { href: "/panel/postulaciones", label: "Mis postulaciones", icon: Briefcase },
          { href: "/panel/mensajes", label: "Mensajes", icon: MessageCircle, badge: unread },
        ];

  return (
    <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
      <aside className="h-fit rounded-3xl border border-forest-100 bg-white/90 p-4 shadow-soft lg:sticky lg:top-24">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-forest-600">
          {user.role === "COMPANY" ? "Empresa" : "Candidato"}
        </p>
        <p className="mt-1 truncate px-2 font-display text-lg font-bold text-forest-950">{user.name}</p>
        <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
          {links.map((l) => {
            const active = pathname === l.href;
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-gradient-to-r from-forest-600 to-river-600 text-white shadow-soft" : "text-forest-800 hover:bg-forest-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {l.label}
                {"badge" in l && l.badge ? (
                  <span
                    className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                      active ? "bg-white text-forest-700" : "bg-gradient-to-r from-forest-500 to-river-600 text-white"
                    }`}
                  >
                    {l.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
