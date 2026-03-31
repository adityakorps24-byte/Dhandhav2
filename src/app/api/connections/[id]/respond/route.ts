import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

const RespondSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
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
      { error: "Sirf wholesaler accept/reject kar sakta hai." },
      { status: 403 },
    );
  }

  const { id } = await ctx.params;

  const json = await req.json().catch(() => null);
  const parsed = RespondSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Action galat hai." }, { status: 400 });
  }

  const existing = await prisma.connection.findUnique({
    where: { id },
    select: { id: true, wholesalerId: true, status: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Request nahi mila." }, { status: 404 });
  }

  if (existing.wholesalerId !== me.id) {
    return NextResponse.json({ error: "Access nahi hai." }, { status: 403 });
  }

  const status = parsed.data.action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

  const connection = await prisma.connection.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      status: true,
      wholesaler: { select: { id: true, businessName: true } },
      retailer: { select: { id: true, businessName: true } },
    },
  });

  return NextResponse.json({ connection });
}
