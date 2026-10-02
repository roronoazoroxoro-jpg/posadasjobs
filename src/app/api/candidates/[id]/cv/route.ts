import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const viewer = await getSessionUser();
  if (viewer?.candidate?.id !== id) {
    await prisma.candidateProfile
      .update({ where: { id }, data: { cvViews: { increment: 1 } } })
      .catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}

function safeFileName(name: string) {
  const cleaned = name.replace(/[^\w.\- ]+/g, "").trim();
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned || "curriculum"}.pdf`;
}

export async function GET(request: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const candidate = await prisma.candidateProfile.findUnique({
    where: { id },
    select: { cvFileUrl: true, cvFileName: true, cvFile: { select: { data: true } } },
  });
  if (!candidate) return NextResponse.json({ error: "Talento no encontrado" }, { status: 404 });

  if (!candidate.cvFile) {
    if (candidate.cvFileUrl.startsWith("/") && !candidate.cvFileUrl.startsWith("/api/")) {
      return NextResponse.redirect(new URL(candidate.cvFileUrl, request.url));
    }
    return NextResponse.json({ error: "Este perfil no tiene CV en PDF" }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const fileName = safeFileName(candidate.cvFileName || "curriculum.pdf");

  return new NextResponse(new Blob([new Uint8Array(candidate.cvFile.data)], { type: "application/pdf" }), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
