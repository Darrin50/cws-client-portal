import PusherServer from "pusher";
import PusherClient from "pusher-js";

// Server instance
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
  useTLS: true,
});

// Client config export
export const pusherClientConfig = {
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
};

// Initialize client instance
export function getPusherClient() {
  return new PusherClient(
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "",
    {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "mt1",
      authEndpoint: "/api/pusher/auth",
      auth: {
        headers: {
          "Content-Type": "application/json",
        },
      },
    }
  );
}

// Helper to trigger events
export async function triggerEvent(
  channel: string,
  event: string,
  data: any
) {
  try {
    await pusherServer.trigger(channel, event, data);
  } catch (error) {
    console.error("Error triggering Pusher event:", error);
  }
}

// Helper to trigger presence changes
export async function triggerPresence(
  channel: string,
  userId: string,
  userInfo: any
) {
  try {
    // Presence channels in Pusher are managed automatically
    // This is a helper if manual triggering is needed
  } catch (error) {
    console.error("Error with presence:", error);
  }
}
