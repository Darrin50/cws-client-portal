/**
 * Simple in-memory sliding window rate limiter.
 * 60 requests per minute per IP.
 * Uses a Map of timestamp queues — no external dependencies needed.
 */

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60;

const requestLog = new Map<string, number[]>();

export function rateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Get existing timestamps for this IP, pruning expired ones
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }

  timestamps.push(now);
  requestLog.set(ip, timestamps);

  return { success: true, remaining: MAX_REQUESTS - timestamps.length };
}

export function getIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
