import Image from "next/image";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "btn-shine bg-gradient-to-r from-forest-600 to-river-600 text-white shadow-soft hover:-translate-y-0.5 hover:shadow-glow",
    secondary: "bg-white text-forest-800 ring-1 ring-forest-200 hover:-translate-y-0.5 hover:bg-forest-50",
    ghost: "text-forest-800 hover:bg-forest-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-forest-950 outline-none ring-river-400/40 transition placeholder:text-forest-400 focus:border-river-400 focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-forest-950 outline-none ring-river-400/40 transition placeholder:text-forest-400 focus:border-river-400 focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Select({ className = "", children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-xl border border-forest-200 bg-white px-3.5 py-2.5 text-sm text-forest-950 outline-none ring-river-400/40 transition focus:border-river-400 focus:ring-2 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-forest-800">
      {children}
    </label>
  );
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function Badge({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "blue" | "amber" | "red" | "slate" }) {
  const tones = {
    green: "bg-forest-100 text-forest-800",
    blue: "bg-river-100 text-river-800",
    amber: "bg-amber-100 text-amber-900",
    red: "bg-red-100 text-red-800",
    slate: "bg-slate-100 text-slate-700",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="animate-fade-up rounded-3xl border border-dashed border-forest-200 bg-white/70 px-6 py-12 text-center">
      <Image
        src="/art/toucan-cv.jpg"
        alt=""
        width={160}
        height={160}
        className="mx-auto h-28 w-28 animate-float rounded-3xl object-cover shadow-soft ring-4 ring-white"
      />
      <p className="mt-5 font-display text-lg font-semibold text-forest-900">{title}</p>
      {children ? <div className="mt-2 text-sm text-forest-700/80">{children}</div> : null}
    </div>
  );
}

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-forest-950">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-2xl text-forest-700/80">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
