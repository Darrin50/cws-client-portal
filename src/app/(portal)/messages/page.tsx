"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  sender: string;
  role: string;
  avatar: string;
  timestamp: string;
  fullDate: Date;
  content: string;
  isClient: boolean;
  read: boolean;
}

const seedMessages: Message[] = [
  {
    id: "1",
    sender: "Sarah Chen",
    role: "Project Manager",
    avatar: "/api/placeholder/32/32",
    timestamp: "10:30 AM",
    fullDate: new Date(2026, 3, 4, 10, 30),
    content:
      "Hey! I've reviewed the latest homepage designs. Looking great so far!",
    isClient: false,
    read: true,
  },
  {
    id: "2",
    sender: "You",
    role: "Client",
    avatar: "/api/placeholder/32/32",
    timestamp: "10:45 AM",
    fullDate: new Date(2026, 3, 4, 10, 45),
    content:
      "Thanks Sarah! Can we adjust the hero section? I'd like the text to be more prominent.",
    isClient: true,
    read: true,
  },
  {
    id: "3",
    sender: "Sarah Chen",
    role: "Project Manager",
    avatar: "/api/placeholder/32/32",
    timestamp: "11:00 AM",
    fullDate: new Date(2026, 3, 4, 11, 0),
    content:
      "Absolutely! I'll make those adjustments and have new mockups for you by tomorrow.",
    isClient: false,
    read: true,
  },
  {
    id: "4",
    sender: "Mike Johnson",
    role: "Designer",
    avatar: "/api/placeholder/32/32",
    timestamp: "2:15 PM",
    fullDate: new Date(2026, 3, 5, 14, 15),
    content:
      "Quick update: I've started on the color palette refinements. More options coming soon!",
    isClient: false,
    read: true,
  },
  {
    id: "5",
    sender: "You",
    role: "Client",
    avatar: "/api/placeholder/32/32",
    timestamp: "3:20 PM",
    fullDate: new Date(2026, 3, 5, 15, 20),
    content:
      "Perfect! I'm excited to see the color options. Looking forward to the updated mockups.",
    isClient: true,
    read: true,
  },
  {
    id: "6",
    sender: "Sarah Chen",
    role: "Project Manager",
    avatar: "/api/placeholder/32/32",
    timestamp: "9:05 AM",
    fullDate: new Date(2026, 3, 6, 9, 5),
    content:
      "Good morning! The mockups are ready — I've attached them to your pages section. Let me know what you think!",
    isClient: false,
    read: false,
  },
];

function formatDayLabel(date: Date): string {
  const today = new Date(2026, 3, 6);
  const yesterday = new Date(2026, 3, 5);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function groupByDate(messages: Message[]) {
  const groups: { label: string; messages: Message[] }[] = [];
  let currentDate = "";
  messages.forEach((msg) => {
    const dateKey = msg.fullDate.toDateString();
    if (dateKey !== currentDate) {
      currentDate = dateKey;
      groups.push({ label: formatDayLabel(msg.fullDate), messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  });
  return groups;
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div
      className={`flex gap-3 ${message.isClient ? "flex-row-reverse" : ""}`}
    >
      <Image
        src={message.avatar}
        alt={message.sender}
        width={32}
        height={32}
        className="rounded-full flex-shrink-0 bg-slate-600"
        unoptimized
      />
      <div
        className={`flex flex-col ${message.isClient ? "items-end" : ""} max-w-[75%]`}
      >
        <div
          className={`flex items-baseline gap-2 ${
            message.isClient ? "flex-row-reverse" : ""
          }`}
        >
          <p className="text-sm font-semibold text-white">{message.sender}</p>
          <span className="text-xs text-slate-500">{message.role}</span>
        </div>
        <div
          className={`mt-1 rounded-lg px-4 py-2 ${
            message.isClient
              ? "bg-blue-600 text-white rounded-tr-sm"
              : "bg-slate-700 text-slate-100 rounded-tl-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <div
          className={`flex items-center gap-1.5 mt-1 ${
            message.isClient ? "flex-row-reverse" : ""
          }`}
        >
          <span className="text-xs text-slate-500">{message.timestamp}</span>
          {message.isClient && (
            <span className="text-xs text-slate-500">
              {message.read ? "Read" : "Sent"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(
    seedMessages.filter((m) => !m.read && !m.isClient).length
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  // Initial scroll on mount
  useEffect(() => {
    scrollToBottom("auto");
  }, [scrollToBottom]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mark messages read when viewing
  useEffect(() => {
    setMessages((prev) =>
      prev.map((m) => (!m.isClient ? { ...m, read: true } : m))
    );
    setUnreadCount(0);
  }, []);

  // Poll for new messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: Replace with real fetch — e.g. GET /api/messages?since=lastMessageId
      // For now this is a no-op polling stub
      console.log("[poll] Checking for new messages...");
    }, 30_000);
    return () => clearInterval(interval);
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      // TODO: Call server action to persist message
      const message: Message = {
        id: String(Date.now()),
        sender: "You",
        role: "Client",
        avatar: "/api/placeholder/32/32",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        fullDate: new Date(),
        content: messageText,
        isClient: true,
        read: false,
      };

      setMessages((prev) => [...prev, message]);

      // Simulate typing indicator + auto-reply for demo
      setTimeout(() => setIsTyping(true), 1000);
      setTimeout(() => {
        setIsTyping(false);
        // Mark sent message as read
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, read: true } : m))
        );
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const messageGroups = groupByDate(messages);

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col gap-0">
      {/* Header */}
      <div className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Messages</h1>
            <p className="text-slate-400 mt-1">
              Communicate with your CWS project team
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="bg-blue-600 text-white text-sm font-semibold rounded-full px-3 py-1">
              {unreadCount} unread
            </div>
          )}
        </div>
      </div>

      {/* Chat Container */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        {/* Online indicator */}
        <div className="px-6 py-3 border-b border-slate-700 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <p className="text-sm text-slate-400">CWS Team · Online</p>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messageGroups.map((group) => (
            <div key={group.label}>
              {/* Date Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-xs text-slate-500 font-medium px-2">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <div className="space-y-4">
                {group.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0" />
              <div className="bg-slate-700 rounded-lg rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-slate-700">
          <div className="space-y-3">
            <Textarea
              placeholder="Type a message... (Ctrl+Enter to send)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isSubmitting) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="resize-none min-h-20 max-h-32"
            />
            <div className="flex items-center justify-between">
              <button aria-label="Attach a file" className="text-slate-400 hover:text-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none rounded">
                <Paperclip className="w-5 h-5" aria-hidden="true" />
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 hidden sm:block">
                  Ctrl+Enter to send
                </span>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSubmitting}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
