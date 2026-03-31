import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

const SendSchema = z.object({
  toUserId: z.string().min(1),
  body: z.string().min(1).max(2000),
});

export async function GET(req: Request) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Login karo pehle." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("withUserId")?.trim();
  if (!withUserId) {
    return NextResponse.json({ error: "withUserId missing" }, { status: 400 });
  }

  const meId = session.userId;

  const isConnected = await prisma.connection.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { wholesalerId: withUserId, retailerId: meId },
        { wholesalerId: meId, retailerId: withUserId },
      ],
    },
    select: { id: true },
  });

  if (!isConnected) {
    return NextResponse.json(
      { error: "Pehle connect ho jao." },
      { status: 403 },
    );
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: meId, receiverId: withUserId },
        { senderId: withUserId, receiverId: meId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 200,
    select: {
      id: true,
      senderId: true,
      receiverId: true,
      body: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Login karo pehle." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = SendSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Message galat hai." }, { status: 400 });
  }

  const meId = session.userId;

  const isConnected = await prisma.connection.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { wholesalerId: parsed.data.toUserId, retailerId: meId },
        { wholesalerId: meId, retailerId: parsed.data.toUserId },
      ],
    },
    select: { id: true },
  });

  if (!isConnected) {
    return NextResponse.json(
      { error: "Pehle connect ho jao." },
      { status: 403 },
    );
  }

  const msg = await prisma.message.create({
    data: {
      senderId: meId,
      receiverId: parsed.data.toUserId,
      body: parsed.data.body,
    },
    select: {
      id: true,
      senderId: true,
      receiverId: true,
      body: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ message: msg });
}
