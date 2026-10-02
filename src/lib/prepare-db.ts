import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";

/** Bump this when seed data changes so Vercel /tmp refreshes. */
export const SEED_VERSION = "2026-10-02-tucanjobs-v6";

/**
 * En Vercel el filesystem es efímero salvo /tmp.
 * Copiamos una DB seededa al arrancar si no existe o cambió de versión.
 */
export function prepareProductionDatabase() {
  const onVercel = process.env.VERCEL === "1";

  if (onVercel) {
    process.env.DATABASE_URL = "file:/tmp/tucanjobs.db";
  }

  if (!onVercel) return;

  const target = "/tmp/tucanjobs.db";
  const versionFile = "/tmp/tucanjobs.seed.version";
  const seedDb = join(process.cwd(), "prisma", "prod-seed.db");

  if (!existsSync(seedDb)) {
    throw new Error("Falta prisma/prod-seed.db en el deploy");
  }

  const current = existsSync(versionFile) ? readFileSync(versionFile, "utf8").trim() : "";
  if (existsSync(target) && current === SEED_VERSION) return;

  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(seedDb, target);
  writeFileSync(versionFile, SEED_VERSION);
}
