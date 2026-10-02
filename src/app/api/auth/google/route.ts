import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publicUser, sessionCookie, signSession } from "@/lib/auth";
import { notify } from "@/lib/notify";

export const runtime = "nodejs";

/**
 * Demo Google login: creates or signs in a candidate linked to a Google-like id.
 * When GOOGLE_CLIENT_ID is configured later, this can be swapped for real OAuth.
 */
export async function POST(request: Request) {
  let body: { name?: string; role?: string; companyName?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const role = body.role === "COMPANY" ? "COMPANY" : "CANDIDATE";
  const googleId = role === "COMPANY" ? "google-demo-company" : "google-demo-candidate";
  const email = role === "COMPANY" ? "google.empresa@tucanjobs.com" : "google.candidato@tucanjobs.com";
  const name = body.name?.trim() || (role === "COMPANY" ? "Empresa Google Demo" : "Candidato Google Demo");
  const companyName = body.companyName?.trim() || "Google Demo SA";

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId }, { email }] },
    include: { candidate: true, company: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: "",
        googleId,
        name,
        role,
        emailVerified: new Date(),
        ...(role === "CANDIDATE"
          ? { candidate: { create: { headline: "Cuenta creada con Google (demo)" } } }
          : { company: { create: { companyName } } }),
      },
      include: { candidate: true, company: true },
    });
    await notify(
      user.id,
      "Ingresaste con Google",
      "Esta es la demo de TucanJobs con Google. En producción se usa OAuth real de Google Cloud.",
      "/panel",
      "welcome",
    );
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId, emailVerified: user.emailVerified || new Date() },
      include: { candidate: true, company: true },
    });
  }

  const cookie = sessionCookie(signSession(user.id));
  const response = NextResponse.json({ user: publicUser(user), demo: true });
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
