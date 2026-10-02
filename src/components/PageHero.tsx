import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  image: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, subtitle, image, children }: Props) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-forest-800 via-forest-700 to-river-800 text-white shadow-glow">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 animate-blob rounded-full bg-forest-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-1/3 h-56 w-56 animate-blob rounded-full bg-river-400/30 blur-3xl [animation-delay:-6s]" />
      <div className="relative grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1.4fr_0.6fr]">
        <div className="animate-fade-up">
          <p className="text-xs font-bold uppercase tracking-widest text-forest-200">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-xl text-white/80">{subtitle}</p> : null}
          {children ? <div className="mt-5">{children}</div> : null}
        </div>
        <div className="relative mx-auto hidden w-40 md:block lg:w-48">
          <Image
            src={image}
            alt=""
            width={384}
            height={384}
            sizes="192px"
            className="aspect-square animate-float rounded-3xl object-cover shadow-float ring-4 ring-white/25"
          />
        </div>
      </div>
    </section>
  );
}
