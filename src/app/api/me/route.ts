import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthCookieName, verifyUserToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(getAuthCookieName())?.value;
    if (!token) return NextResponse.json({ user: null }, { status: 200 });

    const { userId } = await verifyUserToken(token);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, userType: true, businessName: true },
    });

    return NextResponse.json({ user: user ?? null });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
