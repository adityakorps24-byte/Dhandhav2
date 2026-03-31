import { prisma } from "@/lib/prisma";
import { getSessionPayload } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getSessionPayload();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      userType: true,
      businessName: true,
      category: true,
      location: true,
      ratingAvg: true,
      ratingCount: true,
      store: { select: { id: true, name: true } },
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const err = new Error("UNAUTHORIZED");
    // @ts-expect-error attach code
    err.code = "UNAUTHORIZED";
    throw err;
  }
  return user;
}
