import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { publicUser, sessionCookie, signSession } from "@/lib/auth";
import { issueToken, notify } from "@/lib/notify";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
    companyName?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const name = body.name?.trim() || "";
  const role = body.role === "COMPANY" ? "COMPANY" : "CANDIDATE";
  const companyName = body.companyName?.trim() || name;

  if (!email || !password || !name) {
    return NextResponse.json({ error: "Completá nombre, email y clave" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "La clave debe tener al menos 6 caracteres" }, { status: 400 });
  }
  if (role === "COMPANY" && !companyName) {
    return NextResponse.json({ error: "Indicá el nombre de la empresa" }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Ese email ya está registrado" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
      ...(role === "CANDIDATE"
        ? { candidate: { create: {} } }
        : { company: { create: { companyName } } }),
    },
    include: { candidate: true, company: true },
  });

  const verify = await issueToken(user.id, "VERIFY_EMAIL", 48);
  await notify(
    user.id,
    "Bienvenido a TucanJobs",
    `Hola ${name.split(" ")[0]}, tu cuenta quedó lista. Verificá tu email para completar el perfil.`,
    `/verificar?token=${verify}`,
    "welcome",
  );
  await notify(
    user.id,
    "Verificá tu correo",
    `Tocá el enlace para confirmar ${email}. En esta demo el aviso llega a tu bandeja de TucanJobs.`,
    `/verificar?token=${verify}`,
    "email",
  );

  const cookie = sessionCookie(signSession(user.id));
  const response = NextResponse.json({
    user: publicUser(user),
    verifyUrl: `${SITE_URL}/verificar?token=${verify}`,
  });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
