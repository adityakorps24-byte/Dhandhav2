import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

const UpdateSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED", "FULFILLED"]),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Login karo pehle." }, { status: 401 });
  }

  const me = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, userType: true },
  });

  if (!me || me.userType !== "WHOLESALER") {
    return NextResponse.json(
      { error: "Sirf wholesaler order status change kar sakta hai." },
      { status: 403 },
    );
  }

  const { id } = await ctx.params;

  const json = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Status galat hai." }, { status: 400 });
  }

  const existing = await prisma.orderRequest.findUnique({
    where: { id },
    select: { id: true, wholesalerId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Order nahi mila." }, { status: 404 });
  }

  if (existing.wholesalerId !== me.id) {
    return NextResponse.json({ error: "Access nahi hai." }, { status: 403 });
  }

  const order = await prisma.orderRequest.update({
    where: { id },
    data: { status: parsed.data.status },
    select: {
      id: true,
      status: true,
      note: true,
      createdAt: true,
      updatedAt: true,
      retailer: { select: { id: true, businessName: true } },
      wholesaler: { select: { id: true, businessName: true } },
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          product: { select: { id: true, name: true, category: true } },
        },
      },
    },
  });

  return NextResponse.json({ order });
}
