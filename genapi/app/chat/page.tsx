import { requireAuth } from "@/lib/auth";
import { ChatClient } from "@/components/chat/chat-client";

export default async function ChatPage() {
  await requireAuth();

  return <ChatClient />;
}
