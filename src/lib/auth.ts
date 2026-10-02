import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./db";

export const SESSION_COOKIE = "posadasjobs_session";
const SESSION_DAYS = 14;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value && process.env.NODE_ENV === "production" && process.env.VERCEL !== "1") {
    throw new Error("Falta AUTH_SECRET en el archivo .env");
  }
  return value || "posadasjobs-vercel-demo-secret-change-me";
}

function sign(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}

export function signSession(id: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * SESSION_DAYS;
  const body = Buffer.from(JSON.stringify({ id, exp })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function sessionCookie(token: string) {
  return {
    name: SESSION_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.COOKIE_SECURE === "true" || process.env.VERCEL === "1",
      path: "/",
      maxAge: 60 * 60 * 24 * SESSION_DAYS,
    },
  };
}

function readSession(raw: string | undefined) {
  if (!raw) return null;
  const [body, sig] = raw.split(".");
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(body));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as { id?: string; exp?: number };
    if (!data.id || !data.exp || data.exp < Date.now()) return null;
    return data.id;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const jar = await cookies();
  const id = readSession(jar.get(SESSION_COOKIE)?.value);
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    include: { candidate: true, company: true },
  });
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export function publicUser(user: SessionUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    candidate: user.candidate
      ? {
          id: user.candidate.id,
          headline: user.candidate.headline,
          bio: user.candidate.bio,
          skills: parseJsonArray(user.candidate.skills),
          experience: user.candidate.experience,
          education: user.candidate.education,
          location: user.candidate.location,
          phone: user.candidate.phone,
          cvText: user.candidate.cvText,
          linkedin: user.candidate.linkedin,
          portfolio: user.candidate.portfolio,
          availability: user.candidate.availability,
        }
      : null,
    company: user.company
      ? {
          id: user.company.id,
          companyName: user.company.companyName,
          description: user.company.description,
          industry: user.company.industry,
          website: user.company.website,
          location: user.company.location,
          phone: user.company.phone,
          size: user.company.size,
        }
      : null,
  };
}

export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function unauthorized() {
  return NextResponse.json({ error: "Tu sesión terminó. Volvé a ingresar." }, { status: 401 });
}

export function forbidden(message = "No tenés permiso para esta acción.") {
  return NextResponse.json({ error: message }, { status: 403 });
}
