import { NextResponse } from "next/server";
import { getSessionUser, publicUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: publicUser(user) });
}
