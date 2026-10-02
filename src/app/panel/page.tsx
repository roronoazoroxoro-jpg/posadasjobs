"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Briefcase, FileText, Users } from "lucide-react";
import { useSession } from "@/components/session";
import { api } from "@/lib/format";
import { PageTitle } from "@/components/ui";

export default function PanelHomePage() {
  const { user } = useSession();
  const [stats, setStats] = useState({ jobs: 0, apps: 0 });

  useEffect(() => {
    if (!user) return;
    if (user.role === "COMPANY") {
      Promise.all([
        api<{ jobs: unknown[] }>("/api/jobs?mine=1"),
        api<{ applications: unknown[] }>("/api/applications"),
      ]).then(([j, a]) => setStats({ jobs: j.jobs.length, apps: a.applications.length }));
    } else {
      api<{ applications: unknown[] }>("/api/applications").then((a) =>
        setStats({ jobs: 0, apps: a.applications.length }),
      );
    }
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <PageTitle
        title={`Hola, ${user.name.split(" ")[0]}`}
        subtitle={
          user.role === "COMPANY"
            ? "Gestioná tu empresa, empleos y postulantes."
            : "Completá tu perfil técnico y postulá a empleos."
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {user.role === "COMPANY" ? (
          <>
            <Stat icon={Briefcase} label="Empleos publicados" value={stats.jobs} href="/panel/empleos" />
            <Stat icon={Users} label="Postulaciones" value={stats.apps} href="/panel/postulaciones" />
            <Stat icon={FileText} label="Perfil empresa" value="Editar" href="/panel/perfil" />
          </>
        ) : (
          <>
            <Stat icon={FileText} label="Mi CV / perfil" value="Editar" href="/panel/cv" />
            <Stat icon={Briefcase} label="Mis postulaciones" value={stats.apps} href="/panel/postulaciones" />
            <Stat icon={Users} label="Ver empleos" value="Explorar" href="/empleos" />
          </>
        )}
      </div>
      <div className="mt-8 rounded-3xl border border-dashed border-forest-200 bg-white/60 p-6 text-sm text-forest-800/80">
        {user.role === "CANDIDATE" && !user.candidate?.headline ? (
          <p>
            Tu perfil está incompleto.{" "}
            <Link href="/panel/perfil" className="font-semibold text-river-700 hover:underline">
              Completá tu headline y skills
            </Link>{" "}
            para que las empresas te encuentren.
          </p>
        ) : user.role === "COMPANY" && !user.company?.description ? (
          <p>
            Contá más sobre tu empresa en{" "}
            <Link href="/panel/perfil" className="font-semibold text-river-700 hover:underline">
              Perfil empresa
            </Link>
            .
          </p>
        ) : (
          <p>Todo listo. Seguí actualizando tu información para mejores resultados.</p>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link href={href} className="rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft transition hover:border-river-200">
      <Icon className="h-5 w-5 text-river-600" />
      <p className="mt-3 font-display text-2xl font-bold text-forest-950">{value}</p>
      <p className="text-sm text-forest-700/70">{label}</p>
    </Link>
  );
}
