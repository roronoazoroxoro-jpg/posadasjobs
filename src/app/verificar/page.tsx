"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/format";
import { useSession } from "@/components/session";
import { Button, PageTitle } from "@/components/ui";

export default function VerificarPage() {
  return (
    <Suspense>
      <Verificar />
    </Suspense>
  );
}

function Verificar() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const { user, refresh } = useSession();
  const [status, setStatus] = useState<"idle" | "ok" | "error" | "loading">(token ? "loading" : "idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    api("/api/auth/verify", { method: "POST", body: JSON.stringify({ token }) })
      .then(async () => {
        setStatus("ok");
        setMessage("¡Email verificado!");
        await refresh();
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e instanceof Error ? e.message : "No se pudo verificar");
      });
  }, [token, refresh]);

  async function resend() {
    setStatus("loading");
    try {
      await api("/api/auth/verify", { method: "PUT" });
      setStatus("ok");
      setMessage("Te mandamos un nuevo enlace a tu bandeja de avisos.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageTitle title="Verificar email" subtitle="Confirmá tu correo para completar tu cuenta." />
      <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
        {status === "loading" ? <p className="text-sm text-forest-700/80">Verificando…</p> : null}
        {status === "ok" ? <p className="text-sm font-medium text-forest-700">{message}</p> : null}
        {status === "error" ? <p className="text-sm text-red-600">{message}</p> : null}
        {status === "idle" ? (
          <p className="text-sm text-forest-700/80">
            {user?.emailVerified
              ? "Tu email ya está verificado."
              : "Si te registraste recién, abrí el aviso de verificación en tu bandeja."}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/panel">
            <Button type="button">Ir al panel</Button>
          </Link>
          {user && !user.emailVerified ? (
            <Button type="button" variant="secondary" onClick={() => void resend()}>
              Reenviar enlace
            </Button>
          ) : null}
          <Link href="/panel/avisos" className="self-center text-sm font-semibold text-river-700 hover:underline">
            Ver avisos
          </Link>
        </div>
      </div>
    </div>
  );
}
