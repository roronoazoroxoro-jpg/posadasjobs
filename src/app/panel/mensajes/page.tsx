"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCheck, MessageCircle, Send } from "lucide-react";
import { api, timeAgo } from "@/lib/format";
import { useSession } from "@/components/session";
import { Button, PageTitle } from "@/components/ui";

type Other = { name: string; subtitle: string; photoUrl: string; href: string };
type ConversationItem = {
  id: string;
  jobTitle: string;
  lastMessageAt: string;
  unread: number;
  lastMessage: { body: string; mine: boolean } | null;
  other: Other;
};
type Msg = { id: string; body: string; mine: boolean; read: boolean; createdAt: string };

export default function MensajesPage() {
  return (
    <Suspense>
      <Mensajes />
    </Suspense>
  );
}

function Avatar({ other, size = 44 }: { other: Other; size?: number }) {
  return other.photoUrl ? (
    <Image src={other.photoUrl} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover object-top" style={{ width: size, height: size }} />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-forest-500 to-river-600 font-display font-bold text-white"
      style={{ width: size, height: size }}
    >
      {other.name.slice(0, 1)}
    </span>
  );
}

function Mensajes() {
  const { user, refreshUnread } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const activeId = params.get("c");
  const [list, setList] = useState<ConversationItem[] | null>(null);
  const [thread, setThread] = useState<{ other: Other; jobTitle: string } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadList = useCallback(() => {
    api<{ conversations: ConversationItem[] }>("/api/conversations")
      .then((d) => setList(d.conversations))
      .catch(() => setList([]));
  }, []);

  const loadThread = useCallback(
    (id: string) => {
      api<{ conversation: { other: Other; jobTitle: string }; messages: Msg[] }>(`/api/conversations/${id}`)
        .then((d) => {
          setThread(d.conversation);
          setMessages((prev) => (prev.length === d.messages.length && prev.at(-1)?.read === d.messages.at(-1)?.read ? prev : d.messages));
          void refreshUnread();
        })
        .catch((e) => setError(e instanceof Error ? e.message : "Error"));
    },
    [refreshUnread],
  );

  useEffect(() => {
    loadList();
    const t = setInterval(() => document.visibilityState === "visible" && loadList(), 15000);
    return () => clearInterval(t);
  }, [loadList]);

  useEffect(() => {
    setThread(null);
    setMessages([]);
    setError("");
    if (!activeId) return;
    loadThread(activeId);
    loadList();
    const t = setInterval(() => document.visibilityState === "visible" && loadThread(activeId), 5000);
    return () => clearInterval(t);
  }, [activeId, loadThread, loadList]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!activeId || !draft.trim()) return;
    setSending(true);
    setError("");
    try {
      const d = await api<{ message: Msg }>(`/api/conversations/${activeId}`, {
        method: "POST",
        body: JSON.stringify({ body: draft }),
      });
      setMessages((m) => [...m, d.message]);
      setDraft("");
      loadList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    } finally {
      setSending(false);
    }
  }

  if (!user) return null;

  return (
    <div>
      <PageTitle
        title="Mensajes"
        subtitle={
          user.role === "COMPANY"
            ? "Hablá directo con los talentos que te interesan."
            : "Respondé a las empresas y consultá sobre los puestos."
        }
      />
      <div className="grid h-[70vh] min-h-[480px] overflow-hidden rounded-3xl border border-forest-100 bg-white/90 shadow-soft md:grid-cols-[300px_1fr]">
        <aside className={`flex-col overflow-y-auto border-forest-100 md:flex md:border-r ${activeId ? "hidden" : "flex"}`}>
          {list === null ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-2xl bg-forest-50" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <Image src="/art/toucan-interview.jpg" alt="" width={120} height={120} className="h-24 w-24 animate-float rounded-3xl object-cover shadow-soft" />
              <p className="mt-4 font-display font-bold text-forest-950">Todavía no hay conversaciones</p>
              <p className="mt-1 text-sm text-forest-700/75">
                {user.role === "COMPANY" ? (
                  <>
                    Entrá a un{" "}
                    <Link href="/talentos" className="font-semibold text-river-700 hover:underline">
                      perfil de talento
                    </Link>{" "}
                    y tocá “Enviar mensaje”.
                  </>
                ) : (
                  <>
                    Desde un{" "}
                    <Link href="/empleos" className="font-semibold text-river-700 hover:underline">
                      empleo
                    </Link>{" "}
                    podés consultar a la empresa.
                  </>
                )}
              </p>
            </div>
          ) : (
            list.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => router.push(`/panel/mensajes?c=${c.id}`)}
                className={`flex w-full items-start gap-3 border-b border-forest-100 px-4 py-3 text-left transition ${
                  c.id === activeId ? "bg-forest-50" : "hover:bg-forest-50"
                }`}
              >
                <Avatar other={c.other} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-forest-950">{c.other.name}</span>
                    <span className="shrink-0 text-[11px] text-forest-600">{timeAgo(c.lastMessageAt)}</span>
                  </span>
                  {c.jobTitle ? <span className="block truncate text-[11px] font-semibold text-river-600">{c.jobTitle}</span> : null}
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className={`truncate text-xs ${c.unread ? "font-bold text-forest-900" : "text-forest-700/75"}`}>
                      {c.lastMessage ? `${c.lastMessage.mine ? "Vos: " : ""}${c.lastMessage.body}` : "Sin mensajes"}
                    </span>
                    {c.unread ? (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-forest-500 to-river-600 px-1 text-[10px] font-bold text-white">
                        {c.unread}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            ))
          )}
        </aside>

        <section className={`min-h-0 flex-col md:flex ${activeId ? "flex" : "hidden"}`}>
          {!activeId ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-forest-700/75">
              <MessageCircle className="h-10 w-10 text-river-500" />
              <p className="mt-3 text-sm">Elegí una conversación para empezar.</p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-forest-100 px-4 py-3">
                <button type="button" onClick={() => router.push("/panel/mensajes")} className="rounded-full p-1.5 hover:bg-forest-50 md:hidden" aria-label="Volver">
                  <ArrowLeft className="h-5 w-5 text-forest-800" />
                </button>
                {thread ? (
                  <>
                    <Avatar other={thread.other} size={40} />
                    <div className="min-w-0">
                      <Link href={thread.other.href} className="block truncate font-display font-bold text-forest-950 hover:text-river-700">
                        {thread.other.name}
                      </Link>
                      <p className="truncate text-xs text-forest-700/75">{thread.jobTitle || thread.other.subtitle}</p>
                    </div>
                  </>
                ) : (
                  <div className="h-10 w-48 animate-pulse rounded-xl bg-forest-50" />
                )}
              </header>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-gradient-to-b from-forest-50/40 to-river-50/40 px-4 py-4">
                {messages.map((m, i) => (
                  <div key={m.id} className={`flex animate-fade-in ${m.mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${
                        m.mine
                          ? "rounded-br-md bg-gradient-to-br from-forest-600 to-river-600 text-white"
                          : "rounded-bl-md bg-white text-forest-900 ring-1 ring-forest-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${m.mine ? "text-white/70" : "text-forest-600"}`}>
                        {timeAgo(m.createdAt)}
                        {m.mine && i === messages.length - 1 && m.read ? <CheckCheck className="h-3 w-3" /> : null}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={send} className="flex items-end gap-2 border-t border-forest-100 p-3">
                <textarea
                  rows={1}
                  value={draft}
                  maxLength={2000}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                  placeholder="Escribí un mensaje…"
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-forest-200 bg-white px-4 py-2.5 text-sm text-forest-950 outline-none placeholder:text-forest-400 focus:border-river-400"
                />
                <Button type="submit" disabled={sending || !draft.trim()} className="h-11 w-11 shrink-0 !p-0" aria-label="Enviar">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              {error ? <p className="px-4 pb-2 text-xs text-red-600">{error}</p> : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
