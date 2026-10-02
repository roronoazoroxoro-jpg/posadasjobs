import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { consumeToken, notify } from "@/lib/notify";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { token?: string; password?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const token = String(body.token || "");
  const password = String(body.password || "");
  if (!token || password.length < 6) {
    return NextResponse.json({ error: "Token inválido o clave muy corta (mín. 6)" }, { status: 400 });
  }

  const userId = await consumeToken(token, "RESET_PASSWORD");
  if (!userId) return NextResponse.json({ error: "El enlace expiró o ya se usó. Pedí uno nuevo." }, { status: 400 });

  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(password, 10) } });
  await notify(userId, "Contraseña actualizada", "Tu clave se cambió correctamente. Ya podés ingresar.", "/login", "security");
  return NextResponse.json({ ok: true });
}
