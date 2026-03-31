"use client";

import { useEffect, useState } from "react";
import { getDemoUser } from "@/lib/mock-session";
import { addMessage, listMessages, uuid } from "@/lib/mock-store";

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

export function ChatClient(props: { userId: string }) {
  const [me, setMe] = useState<MeUser | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const u = getDemoUser();
    setMe(u ? { id: u.id, businessName: u.businessName } : null);
  }, []);

  useEffect(() => {
    const all = listMessages() as unknown as Msg[];
    const next = all.filter(
      (m) =>
        (m.senderId === props.userId && m.receiverId === me?.id) ||
        (m.senderId === me?.id && m.receiverId === props.userId),
    );
    setMessages(next);
  }, [me?.id, props.userId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (!me) {
        setError("Login required");
        return;
      }
      const next = {
        id: uuid("m"),
        senderId: me.id,
        receiverId: props.userId,
        body,
        createdAt: new Date().toISOString(),
      };
      addMessage(next as unknown as import("@/lib/mock-data").MockMessage);
      setBody("");
      setMessages((prev) => [...prev, next]);
    } catch {
      setError("Message nahi gaya.");
    }
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
