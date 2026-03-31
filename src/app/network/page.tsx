"use client";

import { useEffect, useMemo, useState } from "react";
import { mockUsers } from "@/lib/mock-data";
import { getDemoUser } from "@/lib/mock-session";
import { listConnections, upsertConnection, uuid, type DemoConnection } from "@/lib/mock-store";

type UserType = "WHOLESALER" | "RETAILER";

type DirectoryUser = {
  id: string;
  userType: UserType;
  businessName: string;
  category: string | null;
  location: string | null;
  ratingAvg: number;
  ratingCount: number;
};

type MeUser = {
  id: string;
  userType: UserType;
  businessName: string;
};

type Connection = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  wholesaler: { id: string; businessName: string };
  retailer: { id: string; businessName: string };
};

export default function NetworkPage() {
  const [me, setMe] = useState<MeUser | null>(null);
  const [q, setQ] = useState("");
  const [userType, setUserType] = useState<UserType | "">("");
  const [users, setUsers] = useState<DirectoryUser[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    setLoading(true);
    setError(null);

    const u = getDemoUser();
    setMe(u ? { id: u.id, userType: u.userType, businessName: u.businessName } : null);

    const qn = q.trim().toLowerCase();
    const type = userType;
    const filtered = mockUsers
      .filter((x) => {
        if (type && x.userType !== type) return false;
        if (!qn) return true;
        const hay = `${x.businessName} ${x.category ?? ""} ${x.location ?? ""}`.toLowerCase();
        return hay.includes(qn);
      })
      .map((x) => ({
        id: x.id,
        userType: x.userType,
        businessName: x.businessName,
        category: x.category ?? null,
        location: x.location ?? null,
        ratingAvg: x.ratingAvg,
        ratingCount: x.ratingCount,
      }));
    setUsers(filtered);

    if (u) {
      const raw = listConnections();
      const mapped: Connection[] = raw.map((c) => {
        const wh = mockUsers.find((x) => x.id === c.wholesalerId);
        const rt = mockUsers.find((x) => x.id === c.retailerId);
        return {
          id: c.id,
          status: c.status,
          wholesaler: { id: c.wholesalerId, businessName: wh?.businessName ?? "Unknown" },
          retailer: { id: c.retailerId, businessName: rt?.businessName ?? "Unknown" },
        };
      });
      setConnections(mapped);
    } else {
      setConnections([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAll().catch(() => {
      setLoading(false);
      setError("Kuch problem aa gayi.");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, userType]);

  const connectionMap = useMemo(() => {
    const m = new Map<string, Connection>();
    for (const c of connections) {
      const otherId = me?.id === c.wholesaler.id ? c.retailer.id : c.wholesaler.id;
      if (otherId) m.set(otherId, c);
    }
    return m;
  }, [connections, me?.id]);

  const pendingForWholesaler = useMemo(() => {
    if (!me || me.userType !== "WHOLESALER") return [];
    return connections.filter((c) => c.status === "PENDING");
  }, [connections, me]);

  async function sendConnectRequest(wholesalerId: string) {
    setError(null);

    try {
      const u = getDemoUser();
      if (!u) {
        setError("Connect request bhejne ke liye login karo.");
        return;
      }
      const conn: DemoConnection = {
        id: uuid("c"),
        status: "PENDING",
        wholesalerId,
        retailerId: u.id,
      };
      upsertConnection(conn);
      await loadAll();
    } catch {
      setError("Connect request nahi gaya.");
    }
  }

  async function respond(connectionId: string, action: "ACCEPT" | "REJECT") {
    setError(null);

    try {
      const nextStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
      const existing = listConnections().find((x) => x.id === connectionId);
      if (!existing) {
        setError("Action fail ho gaya.");
        return;
      }
      upsertConnection({ ...existing, status: nextStatus });
      await loadAll();
    } catch {
      setError("Action fail ho gaya.");
    }
  }

  return (
    <div className="dh-page flex flex-1">
      <main className="dh-safe-bottom mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <div className="dh-card rounded-3xl p-5">
          <h1 className="text-xl font-extrabold text-blue-900">Network</h1>
          <p className="mt-1 text-sm text-slate-700">
            Wholesalers aur retailers ko discover karo. Connect request bhejo, aur chat karo.
          </p>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!me ? (
            <div className="mt-4 rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm font-semibold text-slate-700">
              Connect/messaging use karne ke liye login karo.
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <a
                  href="/login"
                  className="dh-btn-primary rounded-2xl px-5 py-4 text-center text-sm font-extrabold text-white"
                >
                  Login karo
                </a>
                <a
                  href="/register"
                  className="dh-btn-secondary rounded-2xl px-5 py-4 text-center text-sm font-extrabold text-blue-700 hover:bg-blue-50"
                >
                  Register
                </a>
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search karo: business / category / location"
              className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300 sm:col-span-2"
            />
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value as UserType | "")}
              className="h-12 rounded-2xl border border-blue-100 bg-white px-4 font-semibold outline-none focus:border-blue-300"
            >
              <option value="">All</option>
              <option value="WHOLESALER">Wholesaler</option>
              <option value="RETAILER">Retailer</option>
            </select>
          </div>
        </div>

        {me?.userType === "WHOLESALER" && pendingForWholesaler.length > 0 ? (
          <div className="dh-card rounded-3xl mt-6 p-5">
            <div className="text-base font-bold text-blue-800">Pending requests</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {pendingForWholesaler.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl border border-blue-100 bg-blue-50 p-4"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {c.retailer.businessName}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => respond(c.id, "ACCEPT")}
                      className="dh-btn-primary h-12 rounded-2xl px-4 text-sm font-extrabold text-white"
                    >
                      Accept karo
                    </button>
                    <button
                      onClick={() => respond(c.id, "REJECT")}
                      className="dh-btn-secondary h-12 rounded-2xl px-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50"
                    >
                      Reject karo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 text-sm font-semibold text-slate-700">Loading...</div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => {
            const c = connectionMap.get(u.id);
            const isMe = me?.id === u.id;

            return (
              <div key={u.id} className="dh-card rounded-3xl p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-base font-semibold text-slate-900">
                      {u.businessName}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${
                          u.userType === "WHOLESALER"
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-blue-50 text-blue-700 ring-blue-200"
                        }`}
                      >
                        {u.userType === "WHOLESALER" ? "Wholesaler" : "Retailer"}
                      </span>
                      {u.category ? <span>{u.category}</span> : null}
                      {u.location ? <span>{u.location}</span> : null}
                    </div>
                  </div>
                  <div className="rounded-xl bg-blue-50 px-3 py-2 text-right">
                    <div className="text-xs font-semibold text-blue-700">Rating</div>
                    <div className="text-sm font-bold text-slate-900">
                      {u.ratingCount ? u.ratingAvg.toFixed(1) : "New"}
                    </div>
                  </div>
                </div>

                {isMe ? (
                  <div className="mt-4 text-sm font-semibold text-blue-700">
                    Ye aap ho
                  </div>
                ) : null}

                {me && !isMe ? (
                  <div className="mt-4 grid gap-2">
                    {c ? (
                      c.status === "ACCEPTED" ? (
                        <a
                          href={`/chat/${u.id}`}
                          className="dh-btn-primary h-12 rounded-2xl px-4 flex items-center justify-center text-sm font-extrabold text-white"
                        >
                          Message karo
                        </a>
                      ) : (
                        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700">
                          Status: {c.status}
                        </div>
                      )
                    ) : me.userType === "RETAILER" && u.userType === "WHOLESALER" ? (
                      <button
                        onClick={() => sendConnectRequest(u.id)}
                        className="dh-btn-primary h-12 rounded-2xl px-4 text-sm font-extrabold text-white"
                      >
                        Connect request bhejo
                      </button>
                    ) : (
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-slate-700">
                        Connect option retailer → wholesaler ke liye.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
