import { Check, Sparkles, X } from "lucide-react";

export type MatchInfo = { score: number; matched: string[]; missing: string[]; label: string };

function tone(score: number) {
  if (score >= 80) return { ring: "#059669", text: "text-forest-700", bg: "bg-forest-50 ring-forest-200" };
  if (score >= 60) return { ring: "#0ea5e9", text: "text-river-700", bg: "bg-river-50 ring-river-200" };
  if (score >= 40) return { ring: "#f59e0b", text: "text-amber-700", bg: "bg-amber-50 ring-amber-200" };
  return { ring: "#94a3b8", text: "text-slate-600", bg: "bg-slate-50 ring-slate-200" };
}

export function MatchBadge({ match, className = "" }: { match: MatchInfo; className?: string }) {
  const t = tone(match.score);
  return (
    <span
      title={match.label}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${t.bg} ${t.text} ${className}`}
    >
      <Sparkles className="h-3 w-3" /> {match.score}% match
    </span>
  );
}

export function MatchRing({ score, size = 88 }: { score: number; size?: number }) {
  const t = tone(score);
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth={8} fill="none" className="text-forest-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={t.ring}
          strokeWidth={8}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-display text-xl font-bold ${t.text}`}>{score}%</span>
    </div>
  );
}

export function MatchPanel({ match }: { match: MatchInfo }) {
  return (
    <div className="rounded-3xl border border-forest-100 bg-white/90 p-6 shadow-soft">
      <div className="flex items-center gap-4">
        <MatchRing score={match.score} />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-river-600">Compatibilidad con tu perfil</p>
          <p className="font-display text-lg font-bold text-forest-950">{match.label}</p>
          <p className="text-xs text-forest-700/70">Calculada con tus skills, experiencia, proyectos y CV.</p>
        </div>
      </div>
      {match.matched.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold text-forest-700">Tenés</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {match.matched.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-1 text-xs font-medium text-forest-800 ring-1 ring-forest-200">
                <Check className="h-3 w-3" /> {s}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {match.missing.length ? (
        <div className="mt-3">
          <p className="text-xs font-semibold text-forest-700">Para sumar puntos</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {match.missing.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                <X className="h-3 w-3" /> {s}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
