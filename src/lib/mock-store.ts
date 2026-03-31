import {
  mockDeals,
  mockMessages,
  mockOrders,
  mockProducts,
  mockUsers,
  type MockDeal,
  type MockMessage,
  type MockOrder,
  type MockProduct,
} from "@/lib/mock-data";

const PRODUCTS_KEY = "dhandha_demo_products";
const DEALS_KEY = "dhandha_demo_deals";
const MESSAGES_KEY = "dhandha_demo_messages";
const ORDERS_KEY = "dhandha_demo_orders";
const CONNECTIONS_KEY = "dhandha_demo_connections";

type ConnectionStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export type DemoConnection = {
  id: string;
  status: ConnectionStatus;
  wholesalerId: string;
  retailerId: string;
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function ensureDemoDataSeeded() {
  if (typeof window === "undefined") return;

  if (!window.localStorage.getItem(PRODUCTS_KEY)) writeJson(PRODUCTS_KEY, mockProducts);
  if (!window.localStorage.getItem(DEALS_KEY)) writeJson(DEALS_KEY, mockDeals);
  if (!window.localStorage.getItem(MESSAGES_KEY)) writeJson(MESSAGES_KEY, mockMessages);
  if (!window.localStorage.getItem(ORDERS_KEY)) writeJson(ORDERS_KEY, mockOrders);
  if (!window.localStorage.getItem(CONNECTIONS_KEY)) writeJson(CONNECTIONS_KEY, [] as DemoConnection[]);
}

export function listProducts(): MockProduct[] {
  ensureDemoDataSeeded();
  return readJson<MockProduct[]>(PRODUCTS_KEY, mockProducts);
}

export function upsertProduct(p: MockProduct) {
  const all = listProducts();
  const next = all.some((x) => x.id === p.id) ? all.map((x) => (x.id === p.id ? p : x)) : [p, ...all];
  writeJson(PRODUCTS_KEY, next);
}

export function listDeals(): MockDeal[] {
  ensureDemoDataSeeded();
  return readJson<MockDeal[]>(DEALS_KEY, mockDeals);
}

export function addDeal(d: MockDeal) {
  const all = listDeals();
  writeJson(DEALS_KEY, [d, ...all]);
}

export function listMessages(): MockMessage[] {
  ensureDemoDataSeeded();
  return readJson<MockMessage[]>(MESSAGES_KEY, mockMessages);
}

export function addMessage(m: MockMessage) {
  const all = listMessages();
  writeJson(MESSAGES_KEY, [...all, m]);
}

export function listOrders(): MockOrder[] {
  ensureDemoDataSeeded();
  return readJson<MockOrder[]>(ORDERS_KEY, mockOrders);
}

export function upsertOrder(o: MockOrder) {
  const all = listOrders();
  const next = all.some((x) => x.id === o.id) ? all.map((x) => (x.id === o.id ? o : x)) : [o, ...all];
  writeJson(ORDERS_KEY, next);
}

export function listConnections(): DemoConnection[] {
  ensureDemoDataSeeded();
  return readJson<DemoConnection[]>(CONNECTIONS_KEY, []);
}

export function upsertConnection(c: DemoConnection) {
  const all = listConnections();
  const next = all.some((x) => x.id === c.id) ? all.map((x) => (x.id === c.id ? c : x)) : [c, ...all];
  writeJson(CONNECTIONS_KEY, next);
}

export function findUserBusinessName(id: string): string {
  return mockUsers.find((u) => u.id === id)?.businessName ?? "Unknown";
}

export function uuid(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}
