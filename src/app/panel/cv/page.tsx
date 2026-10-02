"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { useSession } from "@/components/session";
import { api } from "@/lib/format";
import { CvViewer } from "@/components/CvViewer";
import { Button, Field, PageTitle, Textarea } from "@/components/ui";

export default function CvPage() {
  const { user, refresh } = useSession();
  const fileInput = useRef<HTMLInputElement>(null);
  const [cvText, setCvText] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  async function onUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/cv", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "No se pudo subir el PDF");
      await refresh();
      setMessage("PDF subido. Ya se puede ver y descargar desde tu perfil.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function removePdf() {
    if (!confirm("¿Quitar el PDF de tu perfil?")) return;
    setError("");
    setMessage("");
    try {
      await api("/api/profile/cv", { method: "DELETE" });
      await refresh();
      setMessage("PDF eliminado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  if (!user) return null;
  if (user.role !== "CANDIDATE" || !user.candidate) {
    return <p className="text-sm text-forest-700">Solo candidatos tienen curriculum.</p>;
  }

  const { cvFileUrl, cvFileName, cvPreviews } = user.candidate;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Curriculum"
        subtitle="Subí tu CV en PDF y/o escribilo en texto. Las empresas lo pueden ver y descargar desde tu perfil."
      />

      <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
        <p className="font-display text-lg font-bold text-forest-950">CV en PDF</p>
        <p className="mt-1 text-sm text-forest-700/80">
          {cvFileUrl ? `Archivo actual: ${cvFileName || "curriculum.pdf"}` : "Todavía no subiste un PDF."} Máximo 4 MB.
        </p>
        <input ref={fileInput} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => void onUpload(e)} />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" disabled={uploading} onClick={() => fileInput.current?.click()}>
            <Upload className="h-4 w-4" /> {uploading ? "Subiendo…" : cvFileUrl ? "Reemplazar PDF" : "Subir PDF"}
          </Button>
          {cvFileUrl ? (
            <Button type="button" variant="secondary" onClick={() => void removePdf()}>
              <Trash2 className="h-4 w-4" /> Quitar PDF
            </Button>
          ) : null}
        </div>
      </div>

      {message ? <p className="text-sm text-forest-700">{message}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {cvFileUrl ? <CvViewer name={user.name} cvFileUrl={cvFileUrl} cvFileName={cvFileName} cvPreviews={cvPreviews} /> : null}

      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
        <Field label="Texto del curriculum">
          <Textarea rows={16} value={cvText} onChange={(e) => setCvText(e.target.value)} placeholder="Nombre, experiencia, educación, skills…" />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando…" : "Guardar texto"}
        </Button>
      </form>
    </div>
  );
}
