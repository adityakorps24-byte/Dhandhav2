import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

const CreateDealSchema = z.object({
  dealType: z.enum(["REQUIREMENT", "OFFER"]),
  title: z.string().min(3),
  description: z.string().max(2000).optional(),
  category: z.string().optional(),
  quantity: z.number().int().min(1).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dealType = searchParams.get("dealType")?.trim();

  const deals = await prisma.dealPost.findMany({
    where: {
      isActive: true,
      ...(dealType === "REQUIREMENT" || dealType === "OFFER" ? { dealType } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      dealType: true,
      title: true,
      description: true,
      category: true,
      quantity: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          businessName: true,
          userType: true,
        },
      },
    },
  });

  return NextResponse.json({ deals });
}

export async function POST(req: Request) {
  const session = await getSessionPayload();
  if (!session) {
    return NextResponse.json({ error: "Login karo pehle." }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = CreateDealSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Deal details galat hai." }, { status: 400 });
  }

  const d = parsed.data;

  const deal = await prisma.dealPost.create({
    data: {
      authorId: session.userId,
      dealType: d.dealType,
      title: d.title,
      description: d.description ?? null,
      category: d.category ?? null,
      quantity: d.quantity ?? null,
    },
    select: {
      id: true,
      dealType: true,
      title: true,
      description: true,
      category: true,
      quantity: true,
      createdAt: true,
      author: { select: { id: true, businessName: true, userType: true } },
    },
  });

  return NextResponse.json({ deal });
}
