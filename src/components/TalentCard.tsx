import Image from "next/image";
import Link from "next/link";
import { MapPin, Sparkles } from "lucide-react";
import { Badge } from "./ui";

export type TalentCardData = {
  id: string;
  name: string;
  headline: string;
  bio: string;
  skills: string[];
  location: string;
  availability: string;
  photoUrl?: string;
  featured?: boolean;
  projects?: { name: string }[];
};

export function TalentCard({ talent }: { talent: TalentCardData }) {
  return (
    <Link
      href={`/talentos/${talent.id}`}
      className={`group relative block overflow-hidden rounded-2xl border bg-white/90 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow ${
        talent.featured ? "border-river-300 ring-1 ring-river-200" : "border-forest-100 hover:border-forest-300"
      }`}
    >
      {talent.featured ? (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-forest-600 to-river-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          <Sparkles className="h-3 w-3" /> Destacado
        </span>
      ) : null}
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-forest-100 ring-2 ring-white">
          {talent.photoUrl ? (
            <Image src={talent.photoUrl} alt={talent.name} fill className="object-cover object-top" sizes="64px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-forest-700">
              {talent.name.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-forest-950 group-hover:text-river-700">{talent.name}</h3>
          <p className="mt-0.5 line-clamp-1 text-sm font-medium text-river-700">{talent.headline || "Sin headline"}</p>
          <p className="mt-2 line-clamp-2 text-sm text-forest-800/75">{talent.bio || "Sin bio."}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-forest-600">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {talent.location}
            </span>
            <Badge tone={talent.availability?.toLowerCase().includes("disponible") ? "green" : "amber"}>
              {talent.availability || "—"}
            </Badge>
            {talent.projects?.length ? <Badge tone="blue">{talent.projects.length} proyectos</Badge> : null}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {talent.skills.slice(0, 5).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
