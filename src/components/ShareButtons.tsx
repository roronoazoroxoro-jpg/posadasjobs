"use client";

import { Check, Link2, Linkedin, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  function url() {
    return `${window.location.origin}${path}`;
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} — TucanJobs`, url: url() });
        return;
      } catch {
        return;
      }
    }
    await copy();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  const btn =
    "inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-forest-800 ring-1 ring-forest-200 transition hover:-translate-y-0.5 hover:bg-forest-50";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={btn}
        onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${title} — ${url()}`)}`, "_blank", "noopener")}
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-[#25D366]" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.1.1.6-.1 1.2Z" />
        </svg>
        WhatsApp
      </button>
      <button
        type="button"
        className={btn}
        onClick={() =>
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url())}`, "_blank", "noopener")
        }
      >
        <Linkedin className="h-3.5 w-3.5 text-[#0A66C2]" /> LinkedIn
      </button>
      <button type="button" className={btn} onClick={copy}>
        {copied ? <Check className="h-3.5 w-3.5 text-forest-600" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? "¡Copiado!" : "Copiar link"}
      </button>
      <button type="button" className={`${btn} sm:hidden`} onClick={nativeShare}>
        <Share2 className="h-3.5 w-3.5" /> Más
      </button>
    </div>
  );
}
