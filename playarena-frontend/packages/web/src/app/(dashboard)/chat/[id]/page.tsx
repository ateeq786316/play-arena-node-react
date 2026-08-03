"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { api } from "@playarena/shared/api";
import { formatRelativeTime } from "@playarena/shared/utils";

interface ChatMsg {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: { id: string; name: string | null };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    api.get<{ messages: ChatMsg[] }>(`/api/chat/${id}/messages`)
      .then((res) => setMessages(res.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const s = io(`${API_BASE}/chat`, {
      auth: { token: document.cookie.replace(/(?:(?:^|.*;\s*)accessToken\s*=\s*([^;]*).*$)|^.*$/, "$1") },
    });
    s.on("connect", () => s.emit("joinGround", id));
    s.on("newMessage", (msg: ChatMsg) => setMessages((prev) => [...prev, msg]));
    s.on("typing", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTyping((prev) =>
        isTyping ? (prev.includes(userId) ? prev : [...prev, userId]) : prev.filter((u) => u !== userId),
      );
    });
    socketRef.current = s;
    return () => { s.disconnect(); socketRef.current = null; };
  }, [id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = useCallback(() => {
    const socket = socketRef.current;
    if (!input.trim() || !socket) return;
    socket.emit("sendMessage", { groundId: id, content: input.trim() });
    setInput("");
  }, [input, id]);

  const handleTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("typing", { groundId: id, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing", { groundId: id, isTyping: false });
    }, 1500);
  }, [id]);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col max-w-3xl mx-auto">
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <Link href="/chat" className="text-sm text-muted-foreground hover:underline">←</Link>
        <h1 className="text-lg font-semibold">Chat Room</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 py-4">
        {loading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 w-2/3 bg-muted animate-pulse rounded-xl" />)}</div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              <div className="rounded-xl bg-primary/10 px-4 py-2 max-w-[80%] self-start">
                <p className="text-xs text-muted-foreground font-medium">{msg.sender?.name || "User"}</p>
                <p className="text-sm mt-0.5">{msg.content}</p>
                <p className="text-[10px] text-muted-foreground text-right mt-1">{formatRelativeTime(msg.createdAt)}</p>
              </div>
            </div>
          ))
        )}
        {typing.length > 0 && <p className="text-xs text-muted-foreground italic px-2">Someone is typing...</p>}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 border-t border-border pt-3">
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); handleTyping(); }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm"
        />
        <button onClick={sendMessage} disabled={!input.trim()} className="rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          Send
        </button>
      </div>
    </div>
  );
}
