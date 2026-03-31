"use client";

import { useState } from "react";
import { setDemoUserForType } from "@/lib/mock-session";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      void email;
      void password;
      setDemoUserForType("RETAILER");
      window.location.href = "/market";
    } catch {
      setLoading(false);
      setError("Login nahi ho paya. Dobara try karo.");
    }
  }

  return (
    <div className="dh-page flex flex-1 bg-gradient-to-br from-blue-950 via-blue-800 to-blue-600">
      <main className="mx-auto w-full max-w-md px-4 py-10">
        <div className="dh-card rounded-3xl p-6">
          <h1 className="text-xl font-extrabold text-blue-900">Login</h1>
          <p className="mt-1 text-sm text-slate-700">
            Apna email aur password daalo.
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
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
                placeholder="******"
                required
              />
            </label>

            <button
              disabled={loading}
              className="dh-btn-primary h-12 rounded-2xl px-4 text-base font-extrabold text-white disabled:opacity-60"
            >
              {loading ? "Login ho raha hai..." : "Login"}
            </button>

            <a
              className="text-center text-sm font-extrabold text-blue-700 hover:underline"
              href="/register"
            >
              Naya account? Register karo
            </a>
          </form>
        </div>
      </main>
    </div>
  );
}
