import { NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  if (new URL(request.url).searchParams.get("count") === "1") {
    const unread = await prisma.notification.count({ where: { userId: user.id, readAt: null } });
    return NextResponse.json({ unread });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      href: n.href,
      kind: n.kind,
      read: Boolean(n.readAt),
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  let body: { id?: string; all?: boolean };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (body.all) {
    await prisma.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
    return NextResponse.json({ ok: true });
  }

  if (!body.id) return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  await prisma.notification.updateMany({
    where: { id: body.id, userId: user.id },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
