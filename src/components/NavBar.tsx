"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type MeUser = {
  id: string;
  userType: "WHOLESALER" | "RETAILER";
  businessName: string;
};

export function NavBar() {
  const [me, setMe] = useState<MeUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setMe(d.user);
      })
      .catch(() => {
        if (!cancelled) setMe(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-blue-100 bg-white/80 backdrop-blur">
      <div className="bg-gradient-to-r from-blue-950 via-blue-800 to-blue-600">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
            Dhandha
          </Link>

          {me ? (
            <div className="hidden items-center gap-2 sm:flex">
              <div
                className={`rounded-2xl px-3 py-2 text-xs font-extrabold text-white shadow-sm ring-1 ring-white/15 ${
                  me.userType === "WHOLESALER" ? "bg-emerald-600" : "bg-blue-600"
                }`}
              >
                {me.userType === "WHOLESALER" ? "Wholesaler" : "Retailer"}
              </div>
              <div className="max-w-[180px] truncate text-xs font-semibold text-white/90">
                {me.businessName}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mx-auto w-full max-w-5xl px-4 pb-3">
          <nav className="flex items-center gap-2 overflow-x-auto">
            <Link
              href="/market"
              className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
            >
              Market
            </Link>
            <Link
              href="/orders"
              className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
            >
              Orders
            </Link>
            <Link
              href="/network"
              className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
            >
              Network
            </Link>
            <Link
              href="/deals"
              className="shrink-0 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/20"
            >
              Deals
            </Link>

            <div className="ml-auto shrink-0">
              {me ? (
                <button
                  onClick={logout}
                  className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-blue-700 hover:bg-blue-50"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-blue-700 hover:bg-blue-50"
                >
                  Login karo
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
