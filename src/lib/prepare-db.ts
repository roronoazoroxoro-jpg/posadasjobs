import { copyFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";

/**
 * En Vercel el filesystem es efímero salvo /tmp.
 * Copiamos una DB seededa al arrancar si no existe.
 */
export function prepareProductionDatabase() {
  const onVercel = process.env.VERCEL === "1";

  if (onVercel) {
    process.env.DATABASE_URL = "file:/tmp/posadasjobs.db";
  }

  if (!onVercel) return;

  const target = "/tmp/posadasjobs.db";
  if (existsSync(target)) return;

  const seedDb = join(process.cwd(), "prisma", "prod-seed.db");
  if (!existsSync(seedDb)) {
    throw new Error("Falta prisma/prod-seed.db en el deploy");
  }

  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(seedDb, target);
}
