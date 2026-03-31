"use client";

import { useEffect, useMemo, useState } from "react";

type Msg = {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  createdAt: string;
};

type MeUser = {
  id: string;
  businessName: string;
};

export default function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const [me, setMe] = useState<MeUser | null>(null);
  const [withUserId, setWithUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    params.then((p) => {
      if (!cancelled) setWithUserId(p.userId);
    });

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
  }, [params]);

  const threadUrl = useMemo(() => {
    if (!withUserId) return null;
    return `/api/messages?withUserId=${encodeURIComponent(withUserId)}`;
  }, [withUserId]);

  async function load() {
    if (!threadUrl) return;
    setError(null);
    const res = await fetch(threadUrl);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessages([]);
      setError(data.error ?? "Messages load nahi huye.");
      return;
    }
    setMessages(data.messages ?? []);
  }

  useEffect(() => {
    load().catch(() => setError("Kuch problem aa gayi."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadUrl]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!withUserId) return;

    setError(null);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ toUserId: withUserId, body }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Message nahi gaya.");
      return;
    }

    setBody("");
    setMessages((prev) => [...prev, data.message]);
  }

  return (
    <div className="flex flex-1 bg-blue-50">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6">
        <div className="rounded-2xl border border-blue-100 bg-white p-5">
          <div className="text-xl font-bold text-blue-800">Chat</div>
          <div className="mt-1 text-sm text-slate-700">
            {me ? `Logged in: ${me.businessName}` : "Login required"}
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 grid gap-2">
            {messages.map((m) => {
              const mine = me?.id === m.senderId;
              return (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    mine
                      ? "ml-auto bg-blue-600 text-white"
                      : "mr-auto border border-blue-100 bg-blue-50 text-slate-800"
                  }`}
                >
                  {m.body}
                </div>
              );
            })}
          </div>

          <form onSubmit={send} className="mt-6 grid gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Message type karo..."
              className="min-h-24 rounded-2xl border border-blue-100 px-4 py-3 outline-none focus:border-blue-300"
              required
            />
            <button className="h-12 rounded-2xl bg-blue-600 px-4 text-base font-semibold text-white hover:bg-blue-700">
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
