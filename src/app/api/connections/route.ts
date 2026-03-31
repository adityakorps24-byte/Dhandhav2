import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

const CreateConnectionSchema = z.object({
  wholesalerId: z.string().min(1),
});

export async function GET() {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Login karo pehle." }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, userType: true },
  });

  if (!me) {
    return NextResponse.json({ error: "User nahi mila." }, { status: 404 });
  }

  const connections = await prisma.connection.findMany({
    where:
      me.userType === "WHOLESALER"
        ? { wholesalerId: me.id }
        : { retailerId: me.id },
    orderBy: { updatedAt: "desc" },
    take: 200,
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      wholesaler: { select: { id: true, businessName: true } },
      retailer: { select: { id: true, businessName: true } },
    },
  });

  return NextResponse.json({ connections });
}

export async function POST(req: Request) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Login karo pehle." }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, userType: true },
  });

  if (!me || me.userType !== "RETAILER") {
    return NextResponse.json(
      { error: "Connect request sirf retailer bhej sakta hai." },
      { status: 403 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = CreateConnectionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Details galat hai." }, { status: 400 });
  }

  const { wholesalerId } = parsed.data;

  const target = await prisma.user.findUnique({
    where: { id: wholesalerId },
    select: { id: true, userType: true },
  });

  if (!target || target.userType !== "WHOLESALER") {
    return NextResponse.json(
      { error: "Wholesaler nahi mila." },
      { status: 404 },
    );
  }

  const conn = await prisma.connection.upsert({
    where: {
      wholesalerId_retailerId: {
        wholesalerId,
        retailerId: me.id,
      },
    },
    update: {
      status: "PENDING",
    },
    create: {
      wholesalerId,
      retailerId: me.id,
      status: "PENDING",
    },
    select: {
      id: true,
      status: true,
      wholesaler: { select: { id: true, businessName: true } },
      retailer: { select: { id: true, businessName: true } },
    },
  });

  return NextResponse.json({ connection: conn });
}
