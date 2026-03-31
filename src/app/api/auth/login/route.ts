import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = LoginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Email/password galat hai." },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        userType: true,
        businessName: true,
        category: true,
        location: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email/password galat hai." },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Email/password galat hai." },
        { status: 401 },
      );
    }

    await createSessionCookie({ userId: user.id });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });
  } catch {
    return NextResponse.json(
      { error: "Login fail ho gaya. Server issue." },
      { status: 500 },
    );
  }
}
