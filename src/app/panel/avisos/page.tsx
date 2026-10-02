"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { api, timeAgo } from "@/lib/format";
import { useSession } from "@/components/session";
import { Button, Empty, PageTitle } from "@/components/ui";

type Item = { id: string; title: string; body: string; href: string; kind: string; read: boolean; createdAt: string };

export default function AvisosPage() {
  const { user } = useSession();
  const [items, setItems] = useState<Item[] | null>(null);

  async function load() {
    const d = await api<{ notifications: Item[] }>("/api/notifications");
    setItems(d.notifications);
  }

  useEffect(() => {
    if (user) void load().catch(() => setItems([]));
  }, [user]);

  async function markAll() {
    await api("/api/notifications", { method: "PATCH", body: JSON.stringify({ all: true }) });
    await load();
  }

  async function open(item: Item) {
    if (!item.read) await api("/api/notifications", { method: "PATCH", body: JSON.stringify({ id: item.id }) });
  }

  if (!user) return null;

  return (
    <div>
      <PageTitle
        title="Avisos"
        subtitle="Verificación, recuperar clave, postulaciones y cambios de estado. En producción estos avisos también salen por email real."
        action={
          items?.some((i) => !i.read) ? (
            <Button type="button" variant="secondary" onClick={() => void markAll()}>
              <CheckCheck className="h-4 w-4" /> Marcar todos leídos
            </Button>
          ) : null
        }
      />
      {items === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/70" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Empty title="Sin avisos todavía">Cuando te postules o te contacten, van a aparecer acá.</Empty>
      ) : (
        <div className="space-y-3">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.href || "/panel"}
              onClick={() => void open(n)}
              className={`block rounded-2xl border p-4 shadow-soft transition hover:-translate-y-0.5 ${
                n.read ? "border-forest-100 bg-white/80" : "border-river-200 bg-river-50/70"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 rounded-xl p-2 ${n.read ? "bg-forest-50 text-forest-700" : "bg-gradient-to-br from-forest-500 to-river-600 text-white"}`}>
                  <Bell className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display font-bold text-forest-950">{n.title}</span>
                    <span className="shrink-0 text-[11px] text-forest-600">{timeAgo(n.createdAt)}</span>
                  </span>
                  <span className="mt-1 block text-sm text-forest-800/80">{n.body}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
