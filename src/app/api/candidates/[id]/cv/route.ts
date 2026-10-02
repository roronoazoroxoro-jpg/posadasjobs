import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

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
