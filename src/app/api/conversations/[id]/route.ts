import { NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cleanMessage, findConversationFor } from "@/lib/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const conv = await findConversationFor(user, id);
  if (!conv) return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });

  await prisma.message.updateMany({
    where: { conversationId: id, readAt: null, senderUserId: { not: user.id } },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    conversation: {
      id: conv.id,
      jobTitle: conv.jobTitle,
      other: user.company
        ? { name: conv.candidate.user.name, subtitle: conv.candidate.headline, photoUrl: conv.candidate.photoUrl, href: `/talentos/${conv.candidate.id}` }
        : { name: conv.company.companyName, subtitle: conv.company.industry || "Empresa", photoUrl: "", href: `/empresas/${conv.company.id}` },
    },
    messages: messages.reverse().map((m) => ({
      id: m.id,
      body: m.body,
      mine: m.senderUserId === user.id,
      read: Boolean(m.readAt),
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request, ctx: Ctx) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const conv = await findConversationFor(user, id);
  if (!conv) return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  const text = cleanMessage(body.body);
  if (!text) return NextResponse.json({ error: "Escribí un mensaje" }, { status: 400 });

  const message = await prisma.message.create({
    data: { conversationId: id, senderUserId: user.id, body: text },
  });
  await prisma.conversation.update({ where: { id }, data: { lastMessageAt: message.createdAt } });

  return NextResponse.json(
    { message: { id: message.id, body: message.body, mine: true, read: false, createdAt: message.createdAt.toISOString() } },
    { status: 201 },
  );
}
