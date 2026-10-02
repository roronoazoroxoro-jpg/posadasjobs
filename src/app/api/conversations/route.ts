import { NextResponse } from "next/server";
import { forbidden, getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cleanMessage, membershipWhere, unreadCount } from "@/lib/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  if (new URL(request.url).searchParams.get("count") === "1") {
    return NextResponse.json({ unread: await unreadCount(user) });
  }

  const where = membershipWhere(user);
  if (!where) return forbidden();

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      company: { select: { id: true, companyName: true } },
      candidate: { select: { id: true, photoUrl: true, headline: true, user: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: { select: { messages: { where: { readAt: null, senderUserId: { not: user.id } } } } },
    },
  });

  return NextResponse.json({
    conversations: conversations.map((c) => {
      const last = c.messages[0];
      return {
        id: c.id,
        jobTitle: c.jobTitle,
        lastMessageAt: c.lastMessageAt.toISOString(),
        unread: c._count.messages,
        lastMessage: last ? { body: last.body, mine: last.senderUserId === user.id } : null,
        other: user.company
          ? { name: c.candidate.user.name, subtitle: c.candidate.headline, photoUrl: c.candidate.photoUrl, href: `/talentos/${c.candidate.id}` }
          : { name: c.company.companyName, subtitle: "Empresa", photoUrl: "", href: `/empresas/${c.company.id}` },
      };
    }),
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const text = cleanMessage(body.body);
  if (!text) return NextResponse.json({ error: "Escribí un mensaje" }, { status: 400 });
  const jobTitle = String(body.jobTitle || "").slice(0, 140);

  let companyId: string;
  let candidateId: string;
  if (user.company && typeof body.candidateId === "string") {
    const exists = await prisma.candidateProfile.findUnique({ where: { id: body.candidateId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Talento no encontrado" }, { status: 404 });
    companyId = user.company.id;
    candidateId = exists.id;
  } else if (user.candidate && typeof body.companyId === "string") {
    const exists = await prisma.companyProfile.findUnique({ where: { id: body.companyId }, select: { id: true } });
    if (!exists) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    companyId = exists.id;
    candidateId = user.candidate.id;
  } else {
    return forbidden("No podés iniciar esta conversación.");
  }

  const now = new Date();
  const conversation = await prisma.conversation.upsert({
    where: { companyId_candidateId: { companyId, candidateId } },
    create: { companyId, candidateId, jobTitle, lastMessageAt: now },
    update: { lastMessageAt: now, ...(jobTitle ? { jobTitle } : {}) },
  });
  await prisma.message.create({
    data: { conversationId: conversation.id, senderUserId: user.id, body: text },
  });

  return NextResponse.json({ conversationId: conversation.id }, { status: 201 });
}
