import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { issueToken, notify } from "@/lib/notify";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let email = "";
  try {
    email = String(((await request.json()) as { email?: string }).email || "")
      .trim()
      .toLowerCase();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  if (!email) return NextResponse.json({ error: "Ingresá tu email" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  // Always 200 to avoid email enumeration
  if (!user || !user.passwordHash) {
    return NextResponse.json({ ok: true, message: "Si el email existe, te mandamos un aviso para recuperar la clave." });
  }

  const token = await issueToken(user.id, "RESET_PASSWORD", 2);
  await notify(
    user.id,
    "Recuperar tu contraseña",
    "Pediste restablecer tu clave. El enlace vence en 2 horas. Si no fuiste vos, ignorá este aviso.",
    `/recuperar?token=${token}`,
    "email",
  );

  return NextResponse.json({
    ok: true,
    message: "Te dejamos el enlace en tu bandeja de avisos de TucanJobs.",
    resetUrl: process.env.NODE_ENV === "production" ? undefined : `${SITE_URL}/recuperar?token=${token}`,
  });
}
