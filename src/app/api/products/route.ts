import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

const CreateProductSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(1),
  price: z.number().int().min(0),
  quantity: z.number().int().min(0),
  minOrderQty: z.number().int().min(1),
  stockStatus: z.enum(["MAAL_AVAILABLE", "STOCK_KAM_HAI", "STOCK_KHATAM"]).optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const category = searchParams.get("category")?.trim() || "";

  const minPriceRaw = searchParams.get("minPrice")?.trim() || "";
  const maxPriceRaw = searchParams.get("maxPrice")?.trim() || "";
  const minPrice = minPriceRaw ? Number.parseInt(minPriceRaw, 10) : undefined;
  const maxPrice = maxPriceRaw ? Number.parseInt(maxPriceRaw, 10) : undefined;

  const priceFilter: { gte?: number; lte?: number } = {};
  if (Number.isFinite(minPrice) && (minPrice as number) >= 0) priceFilter.gte = minPrice as number;
  if (Number.isFinite(maxPrice) && (maxPrice as number) >= 0) priceFilter.lte = maxPrice as number;

  const products = await prisma.product.findMany({
    where: {
      isPublic: true,
      ...(category
        ? {
            category: { equals: category },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { category: { contains: q } },
              { owner: { businessName: { contains: q } } },
            ],
          }
        : {}),
      ...(Object.keys(priceFilter).length
        ? {
            price: priceFilter,
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      quantity: true,
      minOrderQty: true,
      stockStatus: true,
      isPublic: true,
      owner: { select: { id: true, businessName: true } },
    },
  });

  return NextResponse.json({ products });
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

  if (!me || me.userType !== "WHOLESALER") {
    return NextResponse.json(
      { error: "Sirf wholesaler product add kar sakta hai." },
      { status: 403 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = CreateProductSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Product details galat hai." },
      { status: 400 },
    );
  }

  const p = parsed.data;

  const product = await prisma.product.create({
    data: {
      ownerId: me.id,
      name: p.name,
      category: p.category,
      price: p.price,
      quantity: p.quantity,
      minOrderQty: p.minOrderQty,
      stockStatus: p.stockStatus ?? "MAAL_AVAILABLE",
      isPublic: p.isPublic ?? true,
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
