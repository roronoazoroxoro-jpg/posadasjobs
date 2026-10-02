"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/format";
import { Button, Field, Input, PageTitle } from "@/components/ui";

export default function RecuperarPage() {
  return (
    <Suspense>
      <Recuperar />
    </Suspense>
  );
}

function Recuperar() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestReset(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const d = await api<{ message: string }>("/api/auth/forgot", { method: "POST", body: JSON.stringify({ email }) });
      setMessage(d.message || "Revisá tu bandeja de avisos.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api("/api/auth/reset", { method: "POST", body: JSON.stringify({ token, password }) });
      setMessage("¡Clave actualizada! Ya podés ingresar.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <PageTitle
        title={token ? "Nueva contraseña" : "Olvidé mi contraseña"}
        subtitle={token ? "Elegí una clave nueva (mínimo 6 caracteres)." : "Te dejamos el enlace en tu bandeja de avisos de TucanJobs."}
      />
      {token ? (
        <form onSubmit={resetPassword} className="space-y-4 rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
          <Field label="Nueva clave">
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? (
            <p className="text-sm text-forest-700">
              {message}{" "}
              <Link href="/login" className="font-semibold text-river-700 hover:underline">
                Ir al login
              </Link>
            </p>
          ) : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Guardando…" : "Guardar clave"}
          </Button>
        </form>
      ) : (
        <form onSubmit={requestReset} className="space-y-4 rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
          <Field label="Email de tu cuenta">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? (
            <p className="text-sm text-forest-700">
              {message}{" "}
              <Link href="/panel/avisos" className="font-semibold text-river-700 hover:underline">
                Ver avisos
              </Link>
            </p>
          ) : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Enviando…" : "Enviar enlace"}
          </Button>
          <Link href="/login" className="block text-center text-sm font-semibold text-river-700 hover:underline">
            Volver al login
          </Link>
        </form>
      )}
    </div>
  );
}
