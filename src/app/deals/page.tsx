"use client";

import { useEffect, useMemo, useState } from "react";

type DealType = "REQUIREMENT" | "OFFER";

type Deal = {
  id: string;
  dealType: DealType;
  title: string;
  description: string | null;
  category: string | null;
  quantity: number | null;
  createdAt: string;
  author: { id: string; businessName: string; userType: "WHOLESALER" | "RETAILER" };
};

function DealTypeChip(props: { type: DealType }) {
  const isOffer = props.type === "OFFER";
  return (
    <div
      className={
        isOffer
          ? "inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700"
          : "inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700"
      }
    >
      {isOffer ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7 4h10l2 6-7 10L5 10l2-6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 10.5 11 12l3.5-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 2 2 7l10 5 10-5-10-5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M2 17l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>{isOffer ? "Offer" : "Requirement"}</span>
    </div>
  );
}

export default function DealsPage() {
  const [dealType, setDealType] = useState<DealType | "">("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newType, setNewType] = useState<DealType>("REQUIREMENT");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");

  const queryUrl = useMemo(() => {
    const sp = new URLSearchParams();
    if (dealType) sp.set("dealType", dealType);
    const s = sp.toString();
    return s ? `/api/deals?${s}` : "/api/deals";
  }, [dealType]);

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch(queryUrl);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setDeals([]);
      setLoading(false);
      setError(data.error ?? "Deals load nahi huye.");
      return;
    }
    setDeals(data.deals ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => {
      setLoading(false);
      setError("Kuch problem aa gayi.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryUrl]);

  async function postDeal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        dealType: newType,
        title,
        description: description || undefined,
        category: category || undefined,
        quantity: quantity ? Number(quantity) : undefined,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Post nahi hua. Login required ho sakta hai.");
      return;
    }

    setTitle("");
    setDescription("");
    setCategory("");
    setQuantity("");

    await load();
  }

  return (
    <div className="dh-page flex flex-1">
      <main className="dh-safe-bottom mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="dh-card rounded-3xl p-5">
          <h1 className="text-xl font-extrabold text-blue-900">Deals Board</h1>
          <p className="mt-1 text-sm text-slate-700">
            Bulk requirement ya offer post karo.
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <select
              value={dealType}
              onChange={(e) => setDealType(e.target.value as DealType | "")}
              className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
            >
              <option value="">All</option>
              <option value="REQUIREMENT">Requirement</option>
              <option value="OFFER">Offer</option>
            </select>

            <a
              href="/network"
              className="dh-btn-secondary h-12 rounded-2xl px-5 flex items-center justify-center text-sm font-extrabold text-blue-700 hover:bg-blue-50"
            >
              Network
            </a>
            <a
              href="/market"
              className="dh-btn-secondary h-12 rounded-2xl px-5 flex items-center justify-center text-sm font-extrabold text-blue-700 hover:bg-blue-50"
            >
              Market
            </a>
          </div>
        </div>

        <div className="dh-card rounded-3xl mt-6 p-5">
          <div className="text-base font-bold text-blue-800">New deal post</div>
          <form onSubmit={postDeal} className="mt-4 grid gap-3 sm:grid-cols-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as DealType)}
              className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
            >
              <option value="REQUIREMENT">Requirement</option>
              <option value="OFFER">Offer</option>
            </select>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (optional)"
              className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
            />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300 sm:col-span-2"
              required
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details (optional)"
              className="min-h-24 rounded-2xl border border-blue-100 bg-white px-4 py-3 font-semibold outline-none focus:border-blue-300 sm:col-span-2"
            />
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity (optional)"
              inputMode="numeric"
              className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
            />
            <button className="dh-btn-primary h-12 rounded-2xl px-4 text-base font-extrabold text-white">
              Post karo
            </button>
          </form>
          <div className="mt-3 text-xs text-slate-600">
            Note: Post karne ke liye login required hai.
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm font-semibold text-slate-700">Loading...</div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {deals.map((d) => (
            <div key={d.id} className="dh-card rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <DealTypeChip type={d.dealType} />
                  <div className="mt-1 text-base font-bold text-slate-900">
                    {d.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    By: {d.author.businessName} • {d.author.userType === "WHOLESALER" ? "Wholesaler" : "Retailer"}
                  </div>
                </div>
                <div className="rounded-xl bg-blue-50 px-3 py-2 text-right">
                  <div className="text-xs font-semibold text-blue-700">Qty</div>
                  <div className="text-sm font-bold text-slate-900">
                    {d.quantity ?? "-"}
                  </div>
                </div>
              </div>

              {d.category ? (
                <div className="mt-3 text-xs font-semibold text-slate-700">
                  Category: {d.category}
                </div>
              ) : null}

              {d.description ? (
                <div className="mt-3 text-sm text-slate-700">{d.description}</div>
              ) : null}

              <a
                href={`/chat/${d.author.id}`}
                className="dh-btn-secondary mt-4 h-12 rounded-2xl px-4 flex items-center justify-center text-sm font-extrabold text-blue-700 hover:bg-blue-50"
              >
                Chat karo
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
