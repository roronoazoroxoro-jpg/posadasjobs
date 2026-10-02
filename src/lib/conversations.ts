import type { SessionUser } from "./auth";
import { prisma } from "./db";

export const MAX_MESSAGE = 2000;

export function cleanMessage(value: unknown) {
  return String(value ?? "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, MAX_MESSAGE);
}

export function membershipWhere(user: SessionUser) {
  if (user.company) return { companyId: user.company.id };
  if (user.candidate) return { candidateId: user.candidate.id };
  return null;
}

export async function findConversationFor(user: SessionUser, id: string) {
  const where = membershipWhere(user);
  if (!where) return null;
  return prisma.conversation.findFirst({
    where: { id, ...where },
    include: {
      company: { select: { id: true, companyName: true, industry: true } },
      candidate: { select: { id: true, headline: true, photoUrl: true, user: { select: { name: true } } } },
    },
  });
}

export async function unreadCount(user: SessionUser) {
  const where = membershipWhere(user);
  if (!where) return 0;
  return prisma.message.count({
    where: { readAt: null, senderUserId: { not: user.id }, conversation: where },
  });
}
