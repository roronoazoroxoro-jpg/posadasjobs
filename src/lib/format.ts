export async function api<T = unknown>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || "Error de servidor");
  }
  return data as T;
}

export const JOB_TYPES: Record<string, string> = {
  FULL_TIME: "Tiempo completo",
  PART_TIME: "Medio tiempo",
  CONTRACT: "Contrato",
  INTERNSHIP: "Pasantía",
};

export const MODALITIES: Record<string, string> = {
  PRESENCIAL: "Presencial",
  REMOTO: "Remoto",
  HIBRIDO: "Híbrido",
};

export const APP_STATUS: Record<string, string> = {
  PENDING: "Pendiente",
  REVIEWING: "En revisión",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
};

export function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return "A convenir";
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `Desde ${fmt(min)}`;
  return `Hasta ${fmt(max!)}`;
}

export function timeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${Math.max(1, mins)} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `hace ${days} d`;
  return d.toLocaleDateString("es-AR");
}
