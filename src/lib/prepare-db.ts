import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

/**
 * En Vercel el filesystem es efímero salvo /tmp.
 * Copiamos una DB seededa al arrancar si no existe.
 */
export function prepareProductionDatabase() {
  if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production") return;

  const target = process.env.DATABASE_URL?.replace(/^file:/, "") || "/tmp/posadasjobs.db";
  if (existsSync(target)) return;

  const seedDb = join(process.cwd(), "prisma", "prod-seed.db");
  if (!existsSync(seedDb)) return;

  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(seedDb, target);
}
