"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "@/components/session";
import { api } from "@/lib/format";
import { Button, Field, PageTitle, Textarea } from "@/components/ui";

export default function CvPage() {
  const { user, refresh } = useSession();
  const [cvText, setCvText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.candidate) setCvText(user.candidate.cvText || "");
  }, [user]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api("/api/profile", { method: "PUT", body: JSON.stringify({ cvText }) });
      await refresh();
      setMessage("Curriculum guardado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;
  if (user.role !== "CANDIDATE") {
    return <p className="text-sm text-forest-700">Solo candidatos tienen curriculum.</p>;
  }

  return (
    <div>
      <PageTitle
        title="Curriculum"
        subtitle="Pegá o escribí tu CV. Las empresas lo verán en tu perfil y en tus postulaciones."
      />
      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
        <Field label="Texto del curriculum">
          <Textarea rows={16} value={cvText} onChange={(e) => setCvText(e.target.value)} placeholder="Nombre, experiencia, educación, skills…" />
        </Field>
        {message ? <p className="text-sm text-forest-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar CV"}
        </Button>
      </form>
    </div>
  );
}
