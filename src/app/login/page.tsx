"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { api } from "@/lib/format";
import { useSession } from "@/components/session";
import { Button, Field, Input } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      await refresh();
      router.push(params.get("next") || "/panel");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al ingresar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl items-center gap-10 md:grid-cols-2">
      <div className="hidden md:block">
        <div className="relative">
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-forest-400/40 to-river-500/40 blur-2xl" />
          <Image
            src="/art/toucan-hero.jpg"
            alt="Tucán tomando mate mientras busca trabajo"
            width={1024}
            height={768}
            priority
            sizes="(max-width: 768px) 100vw, 440px"
            className="relative animate-float-slow rounded-[2rem] object-cover shadow-float ring-4 ring-white/80"
          />
        </div>
        <p className="mt-6 font-display text-2xl font-bold text-forest-950">
          Bienvenido de vuelta <span className="text-gradient">al mate</span>.
        </p>
        <p className="mt-1 text-sm text-forest-700/80">Tus postulaciones y tu perfil te están esperando.</p>
      </div>
      <div className="rounded-3xl border border-forest-100 bg-white/90 p-8 shadow-soft">
        <h1 className="font-display text-3xl font-bold text-forest-950">Ingresar</h1>
        <p className="mt-1 text-sm text-forest-700/75">Con tu correo electrónico y clave.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Correo electrónico">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" />
          </Field>
          <Field label="Clave">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </Field>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-forest-700/80">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="font-semibold text-river-700 hover:underline">
            Registrate
          </Link>
        </p>
        <div className="mt-6 rounded-xl bg-forest-50 p-3 text-xs text-forest-800/80">
          <p className="font-semibold">Demo</p>
          <p>valentinprogramer234@gmail.com / Posadas2026!</p>
          <p>empresa@posadasjobs.com / Posadas2026!</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
