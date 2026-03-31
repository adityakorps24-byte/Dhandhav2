"use client";

import type { StockStatus } from "@prisma/client";
import { useState } from "react";

const statusLabel: Record<StockStatus, string> = {
  MAAL_AVAILABLE: "Maal Available",
  STOCK_KAM_HAI: "Stock kam hai",
  STOCK_KHATAM: "Stock khatam",
};

const statusChipClass: Record<StockStatus, string> = {
  MAAL_AVAILABLE: "bg-emerald-50 text-emerald-700",
  STOCK_KAM_HAI: "bg-yellow-50 text-yellow-800",
  STOCK_KHATAM: "bg-red-50 text-red-700",
};

export function ProductCard(props: {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  minOrderQty: number;
  stockStatus: StockStatus;
  sellerName: string;
}) {
  const { id, name, category, price, quantity, minOrderQty, stockStatus, sellerName } =
    props;

  const [open, setOpen] = useState(false);
  const [orderQty, setOrderQty] = useState(String(minOrderQty));
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        productId: id,
        quantity: Number(orderQty),
        note: note || undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Order request nahi gaya.");
      return;
    }

    setLoading(false);
    setOpen(false);
    setNote("");
  }

  return (
    <div className="dh-card rounded-3xl p-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-200 via-sky-100 to-white">
        <div className="absolute left-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-extrabold text-blue-800">
          {category}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-blue-700 px-3 py-1 text-xs font-extrabold text-white">
          ₹{price}
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-extrabold text-slate-900">{name}</div>
          <div className="mt-1 text-sm font-semibold text-slate-600">Seller: {sellerName}</div>
        </div>
        <div className="text-right">
          <div className="text-xs font-bold text-slate-600">Min order</div>
          <div className="mt-1 text-sm font-extrabold text-blue-800">{minOrderQty} pcs</div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div
          className={`rounded-full px-3 py-1 text-xs font-extrabold ${statusChipClass[stockStatus]}`}
        >
          {statusLabel[stockStatus]}
        </div>
        <div className="text-xs font-bold text-slate-600">Stock: {quantity}</div>
      </div>

      <button
        onClick={() => {
          setOrderQty(String(minOrderQty));
          setError(null);
          setOpen(true);
        }}
        className="dh-btn-primary mt-4 w-full rounded-2xl px-4 py-3 text-sm font-extrabold text-white"
      >
        Order request bhejo
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="dh-card w-full max-w-md rounded-3xl p-5">
            <div className="text-lg font-extrabold text-blue-900">Order request</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">
              Qty aur note daalke request bhejo.
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-slate-800">Quantity (pcs)</span>
                <input
                  value={orderQty}
                  onChange={(e) => setOrderQty(e.target.value)}
                  inputMode="numeric"
                  className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
                  placeholder={`Min ${minOrderQty}`}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-extrabold text-slate-800">Note (optional)</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="min-h-24 rounded-2xl border border-blue-100 bg-white px-4 py-3 font-semibold outline-none focus:border-blue-300"
                  placeholder="Delivery timing / payment / preference..."
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="dh-btn-secondary h-12 rounded-2xl px-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  onClick={submit}
                  className="dh-btn-primary h-12 rounded-2xl px-4 text-sm font-extrabold text-white disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
