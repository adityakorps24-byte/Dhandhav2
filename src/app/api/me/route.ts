import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      userType: true,
      businessName: true,
      category: true,
      location: true,
      ratingAvg: true,
      ratingCount: true,
      store: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({ user: user ?? null }, { status: 200 });
}
