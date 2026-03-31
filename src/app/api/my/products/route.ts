import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

export async function GET() {
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
      { error: "Sirf wholesaler apne products dekh sakta hai." },
      { status: 403 },
    );
  }

  const products = await prisma.product.findMany({
    where: { ownerId: me.id },
    orderBy: { createdAt: "desc" },
    take: 100,
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

  return NextResponse.json({ products });
}
