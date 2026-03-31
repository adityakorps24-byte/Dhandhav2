import { mockUsers } from "@/lib/mock-data";
import { ChatClient } from "@/app/chat/ChatClient";

export function generateStaticParams() {
  return mockUsers.map((u) => ({ userId: u.id }));
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const p = await params;
  return <ChatClient userId={p.userId} />;
}
