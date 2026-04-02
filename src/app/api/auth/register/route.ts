import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthCookieName, hashPassword, signUserToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      userType?: "WHOLESALER" | "RETAILER";
      businessName?: string;
      category?: string;
      location?: string;
    };

    const email = (body.email ?? "").trim().toLowerCase();
    const password = body.password ?? "";
    const userType = body.userType;
    const businessName = (body.businessName ?? "").trim();

    if (!email || !password || !userType || !businessName) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        userType,
        businessName,
        category: body.category?.trim() || null,
        location: body.location?.trim() || null,
      },
      select: { id: true, email: true, userType: true, businessName: true },
    });

    const token = await signUserToken({ userId: user.id });

    const res = NextResponse.json(user);
    res.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Register failed" }, { status: 500 });
  }
}
