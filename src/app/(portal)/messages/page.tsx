"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip, Wifi, WifiOff } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { usePusher, type PusherMessage } from "@/lib/hooks/use-pusher";

interface Message {
  id: string;
  sender: string;
  role: string;
  avatar: string;
  timestamp: string;
  content: string;
  isClient: boolean;
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex gap-3 ${message.isClient ? "flex-row-reverse" : ""}`}>
      <img
        src={message.avatar}
        alt={message.sender}
        className="w-8 h-8 rounded-full flex-shrink-0"
      />
      <div className={`flex flex-col ${message.isClient ? "items-end" : ""}`}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-white">{message.sender}</p>
          <span className="text-xs text-slate-500">{message.role}</span>
        </div>
        <div
          className={`mt-1 rounded-lg px-4 py-2 max-w-xs ${
            message.isClient
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-100"
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        <span className="text-xs text-slate-500 mt-1">{message.timestamp}</span>
      </div>
    </div>
  );
}

function pusherMessageToMessage(pm: PusherMessage): Message {
  return {
    id: pm.id,
    sender: pm.senderName,
    role: pm.senderRole,
    avatar: "/api/placeholder/32/32",
    timestamp: new Date(pm.createdAt).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    content: pm.content,
    isClient: pm.isClient,
  };
}

export default function MessagesPage() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleNewMessage = useCallback((pm: PusherMessage) => {
    // Avoid duplicates (our own sent message is already added optimistically)
    setMessages((prev) => {
      if (prev.some((m) => m.id === pm.id)) return prev;
      return [...prev, pusherMessageToMessage(pm)];
    });
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, []);

  const { connected } = usePusher({
    orgId: organization?.id,
    onNewMessage: handleNewMessage,
  });

  // Load messages on mount
  useEffect(() => {
    if (!organization?.id) return;

    async function loadMessages() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/messages?org_id=${organization!.id}&limit=50`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.messages)) {
          setMessages(data.data.messages);
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [organization?.id]);

  // Scroll to bottom when messages load
  useEffect(() => {
    if (!isLoading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isLoading]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !organization?.id || !user) return;

    setIsSubmitting(true);
    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic UI update
    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      sender: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "You",
      role: "Client",
      avatar: user.imageUrl || "/api/placeholder/32/32",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      content,
      isClient: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: organization.id, content }),
      });

      if (!res.ok) {
        // Roll back optimistic update on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setNewMessage(content);
        console.error("Failed to send message");
      } else {
        const data = await res.json();
        // Replace temp message with real one from server
        if (data.success && data.data?.id) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...m, id: data.data.id } : m
            )
          );
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(content);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Messages</h1>
          <p className="text-slate-400 mt-2">
            Communicate with your CWS project team
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {connected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-slate-500" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Messages */}
        <Card className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400 text-sm">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400 text-sm">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </Card>

        {/* Message Input */}
        <Card className="p-4">
          <div className="space-y-3">
            <Textarea
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  (e.ctrlKey || e.metaKey) &&
                  !isSubmitting
                ) {
                  handleSendMessage();
                }
              }}
              className="resize-none min-h-20 max-h-32"
            />

            <div className="flex items-center justify-between">
              <button className="text-slate-400 hover:text-slate-200 transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>

              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSubmitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
