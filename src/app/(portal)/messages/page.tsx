"use client";

import { Send, Paperclip } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const mockMessages = [
  {
    id: "1",
    sender: "Sarah Chen",
    role: "Project Manager",
    initials: "SC",
    timestamp: "10:30 AM",
    content:
      "Hey! I've reviewed the latest homepage designs. Looking great so far — the hero section has a really strong visual hierarchy.",
    isClient: false,
  },
  {
    id: "2",
    sender: "You",
    role: "Client",
    initials: "DM",
    timestamp: "10:45 AM",
    content:
      "Thanks Sarah! Can we adjust the hero section? I'd like the headline text to be a bit more prominent.",
    isClient: true,
  },
  {
    id: "3",
    sender: "Sarah Chen",
    role: "Project Manager",
    initials: "SC",
    timestamp: "11:00 AM",
    content:
      "Absolutely! I'll make those adjustments and have new mockups for you by tomorrow morning.",
    isClient: false,
  },
  {
    id: "4",
    sender: "Mike Johnson",
    role: "Designer",
    initials: "MJ",
    timestamp: "2:15 PM",
    content:
      "Quick update: I've started on the color palette refinements. More options coming soon!",
    isClient: false,
  },
  {
    id: "5",
    sender: "You",
    role: "Client",
    initials: "DM",
    timestamp: "3:20 PM",
    content:
      "Perfect! I'm excited to see the color options. Looking forward to the updated mockups.",
    isClient: true,
  },
];

const senderColors: Record<string, string> = {
  SC: "bg-violet-500",
  MJ: "bg-teal-500",
  DM: "bg-blue-600",
};

function MessageBubble({ message }: { message: (typeof mockMessages)[0] }) {
  const bgColor = senderColors[message.initials] ?? "bg-slate-500";

  return (
    <div
      className={`flex gap-3 ${message.isClient ? "flex-row-reverse" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 self-end mb-5`}
      >
        {message.initials}
      </div>
      <div
        className={`flex flex-col max-w-[70%] ${message.isClient ? "items-end" : "items-start"}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <p
            className={`text-xs font-semibold text-slate-700 ${message.isClient ? "order-last" : ""}`}
          >
            {message.sender}
          </p>
          <span className="text-[10px] text-slate-400">{message.role}</span>
        </div>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            message.isClient
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
          }`}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-slate-400 mt-1.5">
          {message.timestamp}
        </span>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const message = {
        id: String(messages.length + 1),
        sender: "You",
        role: "Client",
        initials: "DM",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        content: newMessage.trim(),
        isClient: true,
      };

      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-112px)] -m-6 md:-m-8">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-slate-200 flex-shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 scroll-m-0 border-0 pb-0 tracking-normal">
          Messages
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Communicate with your CWS project team
        </p>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAF9] px-6 py-6 space-y-5">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white border-t border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-end gap-3">
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 mb-0.5">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isSubmitting) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message... (Ctrl+Enter to send)"
              rows={1}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 leading-relaxed"
              style={{ minHeight: "42px" }}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSubmitting}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white hover:bg-blue-700 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
