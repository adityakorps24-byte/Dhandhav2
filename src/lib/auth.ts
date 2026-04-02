import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getRequiredEnv } from "@/lib/env";

const COOKIE_NAME = "dhandha_token";

function getSecretKey() {
  const secret = getRequiredEnv("JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export function getAuthCookieName() {
  return COOKIE_NAME;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function signUserToken(payload: { userId: string }) {
  return new SignJWT({ sub: payload.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretKey());
}

export async function verifyUserToken(token: string) {
  const { payload } = await jwtVerify(token, getSecretKey());
  const userId = payload.sub;
  if (!userId || typeof userId !== "string") throw new Error("Invalid token");
  return { userId };
}
