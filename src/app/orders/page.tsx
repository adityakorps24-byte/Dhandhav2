"use client";

import { useEffect, useMemo, useState } from "react";
import { getDemoUser } from "@/lib/mock-session";
import { listOrders, upsertOrder } from "@/lib/mock-store";

type OrderStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "FULFILLED";

type UserType = "WHOLESALER" | "RETAILER";

type MeUser = {
  id: string;
  userType: UserType;
  businessName: string;
};

type Order = {
  id: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  retailer: { id: string; businessName: string };
  wholesaler: { id: string; businessName: string };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: { id: string; name: string; category: string };
  }[];
};

export default function OrdersPage() {
  const [me, setMe] = useState<MeUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isWholesaler = useMemo(() => me?.userType === "WHOLESALER", [me]);

  async function load() {
    setLoading(true);
    setError(null);

    const u = getDemoUser();
    setMe(u ? { id: u.id, userType: u.userType, businessName: u.businessName } : null);

    if (!u) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const all = listOrders() as unknown as Order[];
    const mine = all.filter((o) =>
      u.userType === "WHOLESALER" ? o.wholesaler.id === u.id : o.retailer.id === u.id,
    );
    setOrders(mine);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch {
        if (cancelled) return;
        setError("Kuch problem aa gayi.");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function setStatus(orderId: string, status: "ACCEPTED" | "REJECTED" | "FULFILLED") {
    setError(null);

    try {
      setOrders((prev) => {
        const next = prev.map((o) =>
          o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o,
        );
        const updated = next.find((o) => o.id === orderId);
        if (updated) upsertOrder(updated as unknown as import("@/lib/mock-data").MockOrder);
        return next;
      });
    } catch {
      setError("Status change nahi hua.");
    }
  }

  return (
    <div className="dh-page flex flex-1">
      <main className="dh-safe-bottom mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="dh-card rounded-3xl p-5">
          <h1 className="text-xl font-extrabold text-blue-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-700">
            {isWholesaler
              ? "Incoming order requests yahan dikhenge."
              : "Aapke bheje huye order requests yahan dikhenge."}
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!me ? (
            <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-slate-700">
              Orders dekhne ke liye login karo.
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <a
                  href="/login"
                  className="dh-btn-primary h-12 rounded-2xl px-5 flex items-center justify-center text-sm font-extrabold text-white"
                >
                  Login karo
                </a>
                <a
                  href="/register"
                  className="dh-btn-secondary h-12 rounded-2xl px-5 flex items-center justify-center text-sm font-extrabold text-blue-700 hover:bg-blue-50"
                >
                  Register
                </a>
              </div>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-6 text-sm font-semibold text-slate-700">Loading...</div>
        ) : null}

        {!loading && me && orders.length === 0 ? (
          <div className="dh-card rounded-3xl mt-6 p-5 text-sm font-semibold text-slate-700">
            Abhi koi order nahi hai.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4">
          {orders.map((o) => {
            const item = o.items[0];
            const counterparty = isWholesaler ? o.retailer : o.wholesaler;

            return (
              <div key={o.id} className="dh-card rounded-3xl p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">
                      Status: {o.status}
                    </div>
                    <div className="mt-1 text-base font-bold text-slate-900">
                      {item?.product.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      Qty: <span className="font-semibold">{item?.quantity}</span> • Unit: ₹{item?.unitPrice}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {isWholesaler ? "Retailer" : "Wholesaler"}: {counterparty.businessName}
                    </div>
                    {o.note ? (
                      <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700">
                        Note: {o.note}
                      </div>
                    ) : null}
                  </div>

                  {isWholesaler ? (
                    <div className="grid gap-2 sm:w-56">
                      <button
                        disabled={o.status !== "PENDING"}
                        onClick={() => setStatus(o.id, "ACCEPTED")}
                        className="dh-btn-primary h-12 rounded-2xl px-4 text-sm font-extrabold text-white disabled:opacity-50"
                      >
                        Accept karo
                      </button>
                      <button
                        disabled={o.status !== "PENDING"}
                        onClick={() => setStatus(o.id, "REJECTED")}
                        className="dh-btn-secondary h-12 rounded-2xl px-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        Reject karo
                      </button>
                      <button
                        disabled={o.status !== "ACCEPTED"}
                        onClick={() => setStatus(o.id, "FULFILLED")}
                        className="dh-btn-secondary h-12 rounded-2xl px-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        Fulfilled mark karo
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 sm:mt-0 sm:w-56">
                      <a
                        href={`/chat/${o.wholesaler.id}`}
                        className="dh-btn-secondary h-12 rounded-2xl px-4 flex items-center justify-center text-sm font-extrabold text-blue-700 hover:bg-blue-50"
                      >
                        Chat karo
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
