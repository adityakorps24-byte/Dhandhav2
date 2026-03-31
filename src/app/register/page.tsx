"use client";

import { useState } from "react";

type UserType = "WHOLESALER" | "RETAILER";

export default function RegisterPage() {
  const [userType, setUserType] = useState<UserType>("RETAILER");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        userType,
        businessName,
        category: category || undefined,
        location: location || undefined,
        email,
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Register nahi ho paya. Dobara try karo.");
      return;
    }

    window.location.href = "/market";
  }

  return (
    <div className="dh-page flex flex-1 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600">
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <div className="dh-card rounded-3xl p-6">
          <h1 className="text-xl font-extrabold text-blue-900">Register</h1>
          <p className="mt-1 text-sm text-slate-700">
            Wholesaler ya Retailer select karke account banao.
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <span className="text-sm font-extrabold text-slate-800">Aap kaun ho?</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUserType("RETAILER")}
                  className={`h-12 rounded-2xl border px-4 text-sm font-semibold ${
                    userType === "RETAILER"
                      ? "border-blue-300 bg-blue-50 text-blue-900 font-extrabold"
                      : "border-blue-100 bg-white text-slate-700 font-bold"
                  }`}
                >
                  Retailer
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("WHOLESALER")}
                  className={`h-12 rounded-2xl border px-4 text-sm font-semibold ${
                    userType === "WHOLESALER"
                      ? "border-blue-300 bg-blue-50 text-blue-900 font-extrabold"
                      : "border-blue-100 bg-white text-slate-700 font-bold"
                  }`}
                >
                  Wholesaler
                </button>
              </div>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-slate-800">Business naam</span>
              <input
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Jaise: Sharma Traders"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-slate-800">Category (optional)</span>
              <input
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Jaise: Kirana, Garments"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-slate-800">Location (optional)</span>
              <input
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Jaise: India"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-slate-800">Email</span>
              <input
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="name@business.com"
                required
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-extrabold text-slate-800">Password</span>
              <input
                className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Kam se kam 6 characters"
                minLength={6}
                required
              />
            </label>

            <button
              disabled={loading}
              className="dh-btn-primary h-12 rounded-2xl px-4 text-base font-extrabold text-white disabled:opacity-60"
            >
              {loading ? "Account ban raha hai..." : "Register"}
            </button>

            <a
              className="text-center text-sm font-extrabold text-blue-700 hover:underline"
              href="/login"
            >
              Already account hai? Login karo
            </a>
          </form>
        </div>
      </main>
    </div>
  );
}
