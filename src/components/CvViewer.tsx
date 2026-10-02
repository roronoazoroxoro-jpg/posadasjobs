"use client";

import Image from "next/image";
import { Download, ExternalLink, FileText, Printer } from "lucide-react";
import { Button } from "./ui";

type Props = {
  candidateId?: string;
  name: string;
  cvText?: string;
  cvFileUrl?: string;
  cvFileName?: string;
  cvPreviews?: string[];
};

function downloadHref(url: string) {
  return url.startsWith("/api/") ? `${url}?download=1` : url;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function CvViewer({ candidateId, name, cvText, cvFileUrl, cvFileName, cvPreviews = [] }: Props) {
  const fileName = cvFileName || `CV_${name.replace(/\s+/g, "_")}.pdf`;

  function track() {
    if (!candidateId) return;
    const url = `/api/candidates/${candidateId}/cv`;
    if (!navigator.sendBeacon?.(url)) fetch(url, { method: "POST", keepalive: true }).catch(() => undefined);
  }

  function downloadText() {
    const blob = new Blob([cvText || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_${name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printText() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>CV — ${escapeHtml(name)}</title>
<style>body{font-family:system-ui,"Segoe UI",sans-serif;max-width:780px;margin:32px auto;padding:0 24px;color:#0f172a}
h1{color:#047857;margin:0 0 16px}pre{white-space:pre-wrap;font-family:inherit;font-size:13px;line-height:1.55}</style>
</head><body><h1>${escapeHtml(name)}</h1><pre>${escapeHtml(cvText || "")}</pre></body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="space-y-6">
      {cvFileUrl ? (
        <div className="overflow-hidden rounded-3xl border border-forest-100 bg-white/90 shadow-soft">
          <div className="flex flex-col gap-3 border-b border-forest-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-river-50 p-2 text-river-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display font-bold text-forest-950">Curriculum en PDF</p>
                <p className="text-xs text-forest-600">{fileName}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href={cvFileUrl} target="_blank" rel="noreferrer" onClick={track}>
                <Button type="button" variant="secondary">
                  <ExternalLink className="h-4 w-4" /> Abrir
                </Button>
              </a>
              <a href={downloadHref(cvFileUrl)} download={fileName} onClick={track}>
                <Button type="button">
                  <Download className="h-4 w-4" /> Descargar PDF
                </Button>
              </a>
            </div>
          </div>
          {cvPreviews.length ? (
            <div className="grid gap-6 bg-gradient-to-b from-forest-50 to-river-50 p-4 sm:p-8">
              {cvPreviews.map((src, i) => (
                <a
                  key={src}
                  href={cvFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={track}
                  className="group mx-auto block w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-forest-100 transition duration-300 hover:-translate-y-1 hover:shadow-glow"
                >
                  <Image
                    src={src}
                    alt={`CV de ${name} — página ${i + 1}`}
                    width={1012}
                    height={1432}
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="h-auto w-full"
                  />
                </a>
              ))}
            </div>
          ) : (
            <>
              <iframe src={`${cvFileUrl}#view=FitH`} title={`CV de ${name}`} className="hidden h-[80vh] w-full bg-forest-50 md:block" />
              <div className="p-6 text-center text-sm text-forest-700 md:hidden">
                En el celular, tocá <b>Abrir</b> para ver el PDF o <b>Descargar PDF</b> para guardarlo.
              </div>
            </>
          )}
        </div>
      ) : null}

      {cvText ? (
        <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-bold text-forest-950">{cvFileUrl ? "Versión en texto" : "Curriculum"}</p>
              <p className="text-xs text-forest-600">Para leer rápido o copiar.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={downloadText}>
                <Download className="h-4 w-4" /> Descargar .txt
              </Button>
              <Button type="button" variant="secondary" onClick={printText}>
                <Printer className="h-4 w-4" /> Imprimir / guardar PDF
              </Button>
            </div>
          </div>
          <pre className="overflow-auto whitespace-pre-wrap rounded-2xl bg-forest-950 p-5 text-xs leading-relaxed text-forest-50 sm:text-sm">
            {cvText}
          </pre>
        </div>
      ) : null}

      {!cvFileUrl && !cvText ? <p className="text-sm text-forest-600">Este perfil todavía no cargó su curriculum.</p> : null}
    </div>
  );
}
