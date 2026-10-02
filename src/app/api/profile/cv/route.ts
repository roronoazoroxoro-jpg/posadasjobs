import { NextResponse } from "next/server";
import { forbidden, getSessionUser, publicUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

// Vercel rejects request bodies above ~4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user?.candidate) return forbidden("Solo candidatos pueden subir un CV.");

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Archivo inválido" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Elegí un archivo PDF" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "El PDF no puede superar 4 MB" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return NextResponse.json({ error: "El archivo tiene que ser un PDF" }, { status: 400 });
  }

  const candidateId = user.candidate.id;
  const fileName = file.name.replace(/[^\w.\- ]+/g, "").trim() || "curriculum.pdf";

  await prisma.cvFile.upsert({
    where: { candidateId },
    create: { candidateId, data: bytes, size: bytes.length },
    update: { data: bytes, size: bytes.length, createdAt: new Date() },
  });
  await prisma.candidateProfile.update({
    where: { id: candidateId },
    data: { cvFileUrl: `/api/candidates/${candidateId}/cv`, cvFileName: fileName, cvPreviews: "[]" },
  });

  const refreshed = await getSessionUser();
  return NextResponse.json({ user: refreshed ? publicUser(refreshed) : null });
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user?.candidate) return forbidden("Solo candidatos tienen CV.");

  await prisma.cvFile.deleteMany({ where: { candidateId: user.candidate.id } });
  await prisma.candidateProfile.update({
    where: { id: user.candidate.id },
    data: { cvFileUrl: "", cvFileName: "", cvPreviews: "[]" },
  });

  const refreshed = await getSessionUser();
  return NextResponse.json({ user: refreshed ? publicUser(refreshed) : null });
}
