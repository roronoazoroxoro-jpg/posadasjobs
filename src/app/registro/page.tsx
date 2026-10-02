"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { api } from "@/lib/format";
import { useSession } from "@/components/session";
import { Button, Field, Input, Select } from "@/components/ui";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const [role, setRole] = useState(params.get("rol") === "COMPANY" ? "COMPANY" : "CANDIDATE");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name, role, companyName: companyName || name }),
      });
      await refresh();
      router.push("/panel");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
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
            src={role === "COMPANY" ? "/art/toucan-interview.jpg" : "/art/toucan-hired.jpg"}
            alt="Ilustración del tucán de PosadasJobs"
            width={512}
            height={512}
            priority
            sizes="(max-width: 768px) 100vw, 440px"
            className="relative animate-float-slow rounded-[2rem] object-cover shadow-float ring-4 ring-white/80"
          />
        </div>
        <p className="mt-4 font-display text-2xl font-bold text-forest-950">
          Unite a Posadas<span className="text-river-600">Jobs</span>
        </p>
      </div>
      <div className="rounded-3xl border border-forest-100 bg-white/90 p-8 shadow-soft">
        <h1 className="font-display text-3xl font-bold text-forest-950">Crear cuenta</h1>
        <p className="mt-1 text-sm text-forest-700/75">Registro con correo electrónico.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field label="Tipo de cuenta">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="CANDIDATE">Candidato / Talento</option>
              <option value="COMPANY">Empresa</option>
            </Select>
          </Field>
          <Field label={role === "COMPANY" ? "Nombre de contacto" : "Nombre completo"}>
            <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
          </Field>
          {role === "COMPANY" ? (
            <Field label="Nombre de la empresa">
              <Input required value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ej. Tech Misiones SA" />
            </Field>
          ) : null}
          <Field label="Correo electrónico">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" />
          </Field>
          <Field label="Clave">
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </Field>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creando…" : "Crear cuenta"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-forest-700/80">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="font-semibold text-river-700 hover:underline">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
