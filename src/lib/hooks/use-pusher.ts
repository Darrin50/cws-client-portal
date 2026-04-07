"use client";

import { useEffect, useRef, useState } from "react";
import Pusher, { Channel } from "pusher-js";

export interface PusherMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  createdAt: string;
  isClient: boolean;
}

export interface PusherStatusUpdate {
  orgId: string;
  status: string;
}

export interface UsePusherOptions {
  orgId: string | null | undefined;
  onNewMessage?: (message: PusherMessage) => void;
  onMessageRead?: (messageId: string) => void;
  onNotification?: (notification: { title: string; body: string }) => void;
  onStatusUpdate?: (update: PusherStatusUpdate) => void;
}

export function usePusher({
  orgId,
  onNewMessage,
  onMessageRead,
  onNotification,
  onStatusUpdate,
}: UsePusherOptions) {
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!orgId) return;

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1";

    if (!key) {
      console.warn("NEXT_PUBLIC_PUSHER_KEY is not set");
      return;
    }

    const pusher = new Pusher(key, {
      cluster,
      authEndpoint: "/api/pusher/auth",
      auth: {
        headers: { "Content-Type": "application/json" },
      },
    });

    pusherRef.current = pusher;

    pusher.connection.bind("connected", () => setConnected(true));
    pusher.connection.bind("disconnected", () => setConnected(false));
    pusher.connection.bind("error", (err: unknown) => {
      console.error("Pusher connection error:", err);
    });

    const channelName = `private-org-${orgId}`;
    const channel = pusher.subscribe(channelName);
    channelRef.current = channel;

    channel.bind("new-message", (data: PusherMessage) => {
      onNewMessage?.(data);
    });

    channel.bind("message-read", (data: { messageId: string }) => {
      onMessageRead?.(data.messageId);
    });

    channel.bind("notification", (data: { title: string; body: string }) => {
      onNotification?.(data);
    });

    channel.bind("status-update", (data: PusherStatusUpdate) => {
      onStatusUpdate?.(data);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
      pusherRef.current = null;
      channelRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  return { connected, channel: channelRef.current };
}
