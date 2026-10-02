"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, MapPin } from "lucide-react";
import { api } from "@/lib/format";
import { Badge, Empty, PageTitle } from "@/components/ui";

type Company = {
  id: string;
  companyName: string;
  description: string;
  industry: string;
  location: string;
  size: string;
  openJobs: number;
};

export default function EmpresasPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ companies: Company[] }>("/api/companies")
      .then((d) => setCompanies(d.companies))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageTitle title="Empresas" subtitle="Conocé quién está buscando talento en Posadas." />
      {loading ? (
        <p className="text-sm text-forest-700/70">Cargando…</p>
      ) : companies.length === 0 ? (
        <Empty title="Todavía no hay empresas registradas" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {companies.map((c) => (
            <Link
              key={c.id}
              href={`/empresas/${c.id}`}
              className="rounded-2xl border border-forest-100 bg-white/90 p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-river-200"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-river-50 p-2 text-river-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-forest-950">{c.companyName}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-forest-800/75">{c.description || "Sin descripción."}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-forest-700/70">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {c.location}
                    </span>
                    {c.industry ? <Badge tone="blue">{c.industry}</Badge> : null}
                    <Badge>{c.openJobs} empleos abiertos</Badge>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
