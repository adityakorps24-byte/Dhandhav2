import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const userType = searchParams.get("userType")?.trim();

  const users = await prisma.user.findMany({
    where: {
      ...(userType === "WHOLESALER" || userType === "RETAILER" ? { userType } : {}),
      ...(q
        ? {
            OR: [
              { businessName: { contains: q } },
              { category: { contains: q } },
              { location: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      userType: true,
      businessName: true,
      category: true,
      location: true,
      ratingAvg: true,
      ratingCount: true,
    },
  });

  return NextResponse.json({ users });
}
