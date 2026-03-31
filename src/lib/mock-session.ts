import type { MockUser } from "@/lib/mock-data";
import { mockUsers } from "@/lib/mock-data";

const KEY = "dhandha_demo_user_id";

export function getDemoUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(KEY);
  if (!id) return null;
  return mockUsers.find((u) => u.id === id) ?? null;
}

export function setDemoUser(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, id);
}

export function clearDemoUser() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function ensureDefaultDemoUser() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(KEY)) return;
  const fallback = mockUsers.find((u) => u.userType === "RETAILER") ?? mockUsers[0];
  if (fallback) setDemoUser(fallback.id);
}

export function setDemoUserForType(userType: MockUser["userType"]) {
  const u = mockUsers.find((x) => x.userType === userType) ?? mockUsers[0];
  if (u) setDemoUser(u.id);
}
