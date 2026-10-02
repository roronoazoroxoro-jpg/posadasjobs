import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { publicUser, sessionCookie, signSession } from "@/lib/auth";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 5;
const failures = new Map<string, { count: number; first: number }>();

function blocked(key: string) {
  const entry = failures.get(key);
  if (!entry) return 0;
  const elapsed = Date.now() - entry.first;
  if (elapsed > WINDOW_MS) {
    failures.delete(key);
    return 0;
  }
  return entry.count >= MAX_FAILS ? Math.ceil((WINDOW_MS - elapsed) / 60000) : 0;
}

function fail(key: string) {
  const entry = failures.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS) failures.set(key, { count: 1, first: Date.now() });
  else entry.count += 1;
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Datos de acceso inválidos" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Completá email y clave" }, { status: 400 });
  }
  const minutes = blocked(email);
  if (minutes) {
    return NextResponse.json({ error: `Demasiados intentos. Probá de nuevo en ${minutes} min.` }, { status: 429 });
  }
  const user = await prisma.user.findUnique({
    where: { email },
    include: { candidate: true, company: true },
  });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    fail(email);
    return NextResponse.json({ error: "Email o clave incorrectos" }, { status: 401 });
  }
  failures.delete(email);
  const cookie = sessionCookie(signSession(user.id));
  const response = NextResponse.json({ user: publicUser(user) });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
