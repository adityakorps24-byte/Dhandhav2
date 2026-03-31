"use client";

import { useEffect, useMemo, useState } from "react";
import type { StockStatus } from "@prisma/client";

type MeUser = {
  id: string;
  userType: "WHOLESALER" | "RETAILER";
  businessName: string;
};

type MyProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  minOrderQty: number;
  stockStatus: StockStatus;
  isPublic: boolean;
};

const statusOptions: { value: StockStatus; label: string }[] = [
  { value: "MAAL_AVAILABLE", label: "Maal Available" },
  { value: "STOCK_KAM_HAI", label: "Stock kam hai" },
  { value: "STOCK_KHATAM", label: "Stock khatam" },
];

export default function MyMarketPage() {
  const [me, setMe] = useState<MeUser | null>(null);
  const [products, setProducts] = useState<MyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minOrderQty, setMinOrderQty] = useState("1");
  const [stockStatus, setStockStatus] = useState<StockStatus>("MAAL_AVAILABLE");
  const [isPublic, setIsPublic] = useState(true);

  const canManage = useMemo(() => me?.userType === "WHOLESALER", [me]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meRes = await fetch("/api/me");
        const meData = await meRes.json().catch(() => ({}));
        if (cancelled) return;
        setMe(meData.user);

        const pRes = await fetch("/api/my/products");
        const pData = await pRes.json().catch(() => ({}));
        if (cancelled) return;

        if (!pRes.ok) {
          setProducts([]);
          setError(pData.error ?? "Products load nahi huye.");
          return;
        }

        setProducts(pData.products ?? []);
      } catch {
        if (cancelled) return;
        setProducts([]);
        setError("Kuch problem aa gayi.");
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function load() {
    setLoading(true);
    setError(null);

    const meRes = await fetch("/api/me");
    const meData = await meRes.json().catch(() => ({}));
    setMe(meData.user);

    const pRes = await fetch("/api/my/products");
    const pData = await pRes.json().catch(() => ({}));

    if (!pRes.ok) {
      setProducts([]);
      setLoading(false);
      setError(pData.error ?? "Products load nahi huye.");
      return;
    }

    setProducts(pData.products ?? []);
    setLoading(false);
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        category,
        price: Number(price),
        quantity: Number(quantity),
        minOrderQty: Number(minOrderQty),
        stockStatus,
        isPublic,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Product add nahi hua.");
      return;
    }

    setName("");
    setCategory("");
    setPrice("");
    setQuantity("");
    setMinOrderQty("1");
    setStockStatus("MAAL_AVAILABLE");
    setIsPublic(true);

    await load();
  }

  async function patchProduct(id: string, patch: Partial<MyProduct>) {
    setError(null);
    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Update nahi hua.");
      return;
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data.product } : p)),
    );
  }

  return (
    <div className="flex flex-1 bg-blue-50">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="rounded-2xl border border-blue-100 bg-white p-5">
          <h1 className="text-xl font-bold text-blue-800">My Market (Wholesaler)</h1>
          <p className="mt-1 text-sm text-slate-700">
            Apne products add karo, public/private toggle karo, aur stock status set karo.
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!loading && (!me || !canManage) ? (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-700">
              Is page ke liye wholesaler account chahiye. Login/Register karke wholesaler select karo.
            </div>
          ) : null}

          {canManage ? (
            <form onSubmit={addProduct} className="mt-6 grid gap-3 sm:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product naam"
                className="h-12 rounded-2xl border border-blue-100 px-4 outline-none focus:border-blue-300"
                required
              />
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Category"
                className="h-12 rounded-2xl border border-blue-100 px-4 outline-none focus:border-blue-300"
                required
              />
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Price (₹)"
                inputMode="numeric"
                className="h-12 rounded-2xl border border-blue-100 px-4 outline-none focus:border-blue-300"
                required
              />
              <input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Quantity"
                inputMode="numeric"
                className="h-12 rounded-2xl border border-blue-100 px-4 outline-none focus:border-blue-300"
                required
              />
              <input
                value={minOrderQty}
                onChange={(e) => setMinOrderQty(e.target.value)}
                placeholder="Minimum order qty"
                inputMode="numeric"
                className="h-12 rounded-2xl border border-blue-100 px-4 outline-none focus:border-blue-300"
                required
              />
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 outline-none focus:border-blue-300"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Public dikhana hai (inventory toggle)
              </label>

              <button className="h-12 rounded-2xl bg-blue-600 px-4 text-base font-semibold text-white hover:bg-blue-700 sm:col-span-2">
                Product add karo
              </button>
            </form>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-blue-100 bg-white p-4">
              <div className="text-base font-semibold text-slate-900">{p.name}</div>
              <div className="mt-1 text-sm text-slate-600">{p.category}</div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-blue-50 px-3 py-2">
                  <div className="text-xs font-semibold text-blue-700">Price</div>
                  <div className="font-bold text-slate-900">₹{p.price}</div>
                </div>
                <div className="rounded-xl bg-blue-50 px-3 py-2">
                  <div className="text-xs font-semibold text-blue-700">Qty</div>
                  <div className="font-bold text-slate-900">{p.quantity}</div>
                </div>
              </div>

              <div className="mt-3 grid gap-2">
                <select
                  value={p.stockStatus}
                  onChange={(e) =>
                    patchProduct(p.id, { stockStatus: e.target.value as StockStatus })
                  }
                  className="h-12 rounded-2xl border border-blue-100 bg-white px-4 outline-none focus:border-blue-300"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => patchProduct(p.id, { isPublic: !p.isPublic })}
                  className={`h-12 rounded-2xl px-4 text-sm font-semibold ${
                    p.isPublic
                      ? "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {p.isPublic ? "Public (tap to Private)" : "Private (tap to Public)"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
