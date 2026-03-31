import { prisma } from "@/lib/prisma";

export async function ensureWholesalerStore(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, userType: true, businessName: true, store: { select: { id: true } } },
  });

  if (!user) return null;
  if (user.userType !== "WHOLESALER") return null;
  if (user.store?.id) return user.store;

  return prisma.store.create({
    data: {
      ownerId: user.id,
      name: user.businessName,
    },
    select: { id: true, name: true },
  });
}
