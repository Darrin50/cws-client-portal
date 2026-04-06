"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Paperclip } from "lucide-react";
import { useState, useRef } from "react";

// TODO: Replace with real data fetch and WebSocket for live updates
const mockMessages = [
  {
    id: "1",
    sender: "Sarah Chen",
    role: "Project Manager",
    avatar: "/api/placeholder/32/32",
    timestamp: "10:30 AM",
    content:
      "Hey! I've reviewed the latest homepage designs. Looking great so far!",
    isClient: false,
  },
  {
    id: "2",
    sender: "You",
    role: "Client",
    avatar: "/api/placeholder/32/32",
    timestamp: "10:45 AM",
    content:
      "Thanks Sarah! Can we adjust the hero section? I'd like the text to be more prominent.",
    isClient: true,
  },
  {
    id: "3",
    sender: "Sarah Chen",
    role: "Project Manager",
    avatar: "/api/placeholder/32/32",
    timestamp: "11:00 AM",
    content:
      "Absolutely! I'll make those adjustments and have new mockups for you by tomorrow.",
    isClient: false,
  },
  {
    id: "4",
    sender: "Mike Johnson",
    role: "Designer",
    avatar: "/api/placeholder/32/32",
    timestamp: "2:15 PM",
    content:
      "Quick update: I've started on the color palette refinements. More options coming soon!",
    isClient: false,
  },
  {
    id: "5",
    sender: "You",
    role: "Client",
    avatar: "/api/placeholder/32/32",
    timestamp: "3:20 PM",
    content:
      "Perfect! I'm excited to see the color options. Looking forward to the updated mockups.",
    isClient: true,
  },
];

function Message({
  message,
}: {
  message: (typeof mockMessages)[0];
}) {
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

export default function MessagesPage() {
  const [messages, setMessages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Send message via server action
      const message = {
        id: String(messages.length + 1),
        sender: "You",
        role: "Client",
        avatar: "/api/placeholder/32/32",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        content: newMessage,
        isClient: true,
      };

      setMessages([...messages, message]);
      setNewMessage("");

      // Auto-scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <p className="text-slate-400 mt-2">
          Communicate with your CWS project team
        </p>
      </div>

      {/* Chat Container */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Messages */}
        <Card className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
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
