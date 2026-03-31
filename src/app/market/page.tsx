"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { mockProducts } from "@/lib/mock-data";

type ApiProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  minOrderQty: number;
  stockStatus: "MAAL_AVAILABLE" | "STOCK_KAM_HAI" | "STOCK_KHATAM";
  owner: { id: string; businessName: string };
};

export default function MarketPage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const allProducts: ApiProduct[] = useMemo(() => {
    return mockProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      quantity: p.quantity,
      minOrderQty: p.minOrderQty,
      stockStatus: p.stockStatus,
      owner: { id: p.ownerId, businessName: p.ownerBusinessName },
    }));
  }, []);

  const products = useMemo(() => {
    const qn = q.trim().toLowerCase();
    const cn = category.trim().toLowerCase();

    const min = minPrice.trim() ? Number.parseInt(minPrice.trim(), 10) : undefined;
    const max = maxPrice.trim() ? Number.parseInt(maxPrice.trim(), 10) : undefined;

    return allProducts.filter((p) => {
      if (cn && p.category.toLowerCase() !== cn) return false;
      if (Number.isFinite(min) && typeof min === "number" && p.price < min) return false;
      if (Number.isFinite(max) && typeof max === "number" && p.price > max) return false;

      if (!qn) return true;
      const hay = `${p.name} ${p.category} ${p.owner.businessName}`.toLowerCase();
      return hay.includes(qn);
    });
  }, [allProducts, category, maxPrice, minPrice, q]);

  const loading = false;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProducts) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allProducts]);

  return (
    <div className="dh-page flex flex-1">
      <main className="dh-safe-bottom mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="dh-card rounded-3xl p-5">
          <h1 className="text-xl font-extrabold text-blue-900">Market</h1>
          <p className="mt-1 text-sm text-slate-700">
            Products browse karo. Search + category filter use karo.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
              }}
              placeholder="Search karo: product / category / seller..."
              className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300 sm:col-span-2"
            />

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
            >
              <option value="">Sab categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="grid grid-cols-2 gap-3 sm:col-span-2">
              <input
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                }}
                placeholder="Min price (₹)"
                inputMode="numeric"
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
              />
              <input
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                }}
                placeholder="Max price (₹)"
                inputMode="numeric"
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
              }}
              className="dh-btn-secondary h-12 rounded-2xl px-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50"
            >
              Clear price
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <a
              href="/market/my"
              className="dh-btn-secondary rounded-2xl px-5 py-4 text-center text-sm font-extrabold text-blue-700 hover:bg-blue-50"
            >
              Wholesaler ho? Apna store/products manage karo
            </a>
            <a
              href="/network"
              className="dh-btn-secondary rounded-2xl px-5 py-4 text-center text-sm font-extrabold text-blue-700 hover:bg-blue-50"
            >
              Business network dekho
            </a>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm font-semibold text-slate-700">Loading...</div>
        ) : null}

        {!loading && products.length === 0 ? (
          <div className="dh-card rounded-3xl mt-6 p-5 text-sm font-semibold text-slate-700">
            Abhi koi product nahi mila. Search ya filter change karke dekho.
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              category={p.category}
              price={p.price}
              quantity={p.quantity}
              minOrderQty={p.minOrderQty}
              stockStatus={p.stockStatus}
              sellerName={p.owner.businessName}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
