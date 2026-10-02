"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { api } from "@/lib/format";
import { Button, Textarea } from "./ui";

type Props = {
  candidateId?: string;
  companyId?: string;
  jobTitle?: string;
  conversationId?: string | null;
  placeholder?: string;
  label?: string;
  className?: string;
  buttonClassName?: string;
};

export function MessageComposer({
  candidateId,
  companyId,
  jobTitle,
  conversationId,
  placeholder = "Hola, vimos tu perfil y nos gustaría charlar…",
  label = "Enviar mensaje",
  className = "",
  buttonClassName = "",
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  if (conversationId) {
    return (
      <Link href={`/panel/mensajes?c=${conversationId}`} className={className}>
        <Button type="button" variant="secondary" className={buttonClassName}>
          <MessageCircle className="h-4 w-4" /> Ver conversación
        </Button>
      </Link>
    );
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const d = await api<{ conversationId: string }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ candidateId, companyId, jobTitle, body: text }),
      });
      router.push(`/panel/mensajes?c=${d.conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
      setSending(false);
    }
  }

  if (!open) {
    return (
      <div className={className}>
        <Button type="button" variant="secondary" className={buttonClassName} onClick={() => setOpen(true)}>
          <MessageCircle className="h-4 w-4" /> {label}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={send} className={`w-full space-y-2 ${className}`}>
      <Textarea rows={3} autoFocus required maxLength={2000} placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="flex gap-2">
        <Button type="submit" disabled={sending || !text.trim()} className="flex-1">
          <Send className="h-4 w-4" /> {sending ? "Enviando…" : "Enviar"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
