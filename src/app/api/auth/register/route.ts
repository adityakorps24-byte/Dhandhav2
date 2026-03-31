import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(["WHOLESALER", "RETAILER"]),
  businessName: z.string().min(2),
  category: z.string().optional(),
  location: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Galat details. Email/password check karo." },
        { status: 400 },
      );
    }

    const { email, password, userType, businessName, category, location } =
      parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Ye email pehle se registered hai." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        userType,
        businessName,
        category: category || null,
        location: location || null,
      },
      select: { id: true, email: true, userType: true, businessName: true },
    });

    await createSessionCookie({ userId: user.id });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: "Registration fail ho gaya. Server issue." },
      { status: 500 },
    );
  }
}
