import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

const PatchProductSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().min(1).optional(),
  price: z.number().int().min(0).optional(),
  quantity: z.number().int().min(0).optional(),
  minOrderQty: z.number().int().min(1).optional(),
  stockStatus: z.enum(["MAAL_AVAILABLE", "STOCK_KAM_HAI", "STOCK_KHATAM"]).optional(),
  isPublic: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Login karo pehle." }, { status: 401 });
  }

  const { id } = await ctx.params;

  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true, ownerId: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Product nahi mila." }, { status: 404 });
  }

  if (existing.ownerId !== session.userId) {
    return NextResponse.json({ error: "Access nahi hai." }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = PatchProductSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Update details galat hai." },
      { status: 400 },
    );
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...parsed.data,
    },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      quantity: true,
      minOrderQty: true,
      stockStatus: true,
      isPublic: true,
    },
  });

  return NextResponse.json({ product });
}
