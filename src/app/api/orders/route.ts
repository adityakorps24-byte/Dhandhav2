import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";
import { ensureWholesalerStore } from "@/lib/store";

const CreateOrderSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  note: z.string().max(2000).optional(),
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

  const orders = await prisma.orderRequest.findMany({
    where:
      me.userType === "WHOLESALER"
        ? { wholesalerId: me.id }
        : { retailerId: me.id },
    orderBy: { createdAt: "desc" },
    take: 200,
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

  return NextResponse.json({ orders });
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
      { error: "Order request sirf retailer bhej sakta hai." },
      { status: 403 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = CreateOrderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Order details galat hai." },
      { status: 400 },
    );
  }

  const { productId, quantity, note } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      ownerId: true,
      isPublic: true,
      price: true,
      quantity: true,
      minOrderQty: true,
      stockStatus: true,
    },
  });

  if (!product || !product.isPublic) {
    return NextResponse.json({ error: "Product nahi mila." }, { status: 404 });
  }

  if (product.ownerId === me.id) {
    return NextResponse.json(
      { error: "Apne hi product pe order nahi kar sakte." },
      { status: 400 },
    );
  }

  if (quantity < product.minOrderQty) {
    return NextResponse.json(
      { error: `Minimum order qty ${product.minOrderQty} hai.` },
      { status: 400 },
    );
  }

  if (product.stockStatus === "STOCK_KHATAM" || product.quantity <= 0) {
    return NextResponse.json(
      { error: "Stock khatam hai. Dusra product dekho." },
      { status: 400 },
    );
  }

  const store = await ensureWholesalerStore(product.ownerId);
  if (!store) {
    return NextResponse.json(
      { error: "Wholesaler store create nahi ho paya." },
      { status: 500 },
    );
  }

  const order = await prisma.orderRequest.create({
    data: {
      storeId: store.id,
      retailerId: me.id,
      wholesalerId: product.ownerId,
      note: note ?? null,
      items: {
        create: {
          productId: product.id,
          quantity,
          unitPrice: product.price,
        },
      },
    },
    select: {
      id: true,
      status: true,
      note: true,
      createdAt: true,
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
