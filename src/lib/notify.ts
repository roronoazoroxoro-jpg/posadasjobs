import { createHash, randomBytes } from "crypto";
import { prisma } from "./db";

export async function notify(userId: string, title: string, body: string, href = "", kind = "info") {
  return prisma.notification.create({
    data: { userId, title, body: body.slice(0, 2000), href, kind },
  });
}

export function makeToken() {
  return randomBytes(32).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issueToken(userId: string, type: "VERIFY_EMAIL" | "RESET_PASSWORD", hours = 24) {
  const raw = makeToken();
  await prisma.authToken.create({
    data: {
      userId,
      type,
      token: hashToken(raw),
      expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
    },
  });
  return raw;
}

export async function consumeToken(raw: string, type: "VERIFY_EMAIL" | "RESET_PASSWORD") {
  const token = hashToken(raw);
  const row = await prisma.authToken.findUnique({ where: { token } });
  if (!row || row.type !== type || row.usedAt || row.expiresAt < new Date()) return null;
  await prisma.authToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return row.userId;
}
