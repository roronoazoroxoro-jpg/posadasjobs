import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser, unauthorized } from "@/lib/auth";
import { consumeToken, issueToken, notify } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let token = "";
  try {
    token = String(((await request.json()) as { token?: string }).token || "");
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  if (!token) return NextResponse.json({ error: "Falta el token" }, { status: 400 });

  const userId = await consumeToken(token, "VERIFY_EMAIL");
  if (!userId) return NextResponse.json({ error: "El enlace expiró o ya se usó." }, { status: 400 });

  await prisma.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
  await notify(userId, "Email verificado", "Tu correo quedó confirmado. ¡Listo para postularte o publicar empleos!", "/panel", "success");
  return NextResponse.json({ ok: true });
}

export async function PUT() {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  if (user.emailVerified) return NextResponse.json({ ok: true, already: true });

  const token = await issueToken(user.id, "VERIFY_EMAIL", 48);
  await notify(
    user.id,
    "Nuevo enlace de verificación",
    `Te regeneramos el enlace para confirmar ${user.email}.`,
    `/verificar?token=${token}`,
    "email",
  );
  return NextResponse.json({ ok: true });
}
