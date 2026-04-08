import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 60;

// ── In-memory fallback (local dev / no Upstash env vars) ─────────────────────
const requestLog = new Map<string, number[]>();

function rateLimitInMemory(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= MAX_REQUESTS) {
    return { success: false, remaining: 0 };
  }
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return { success: true, remaining: MAX_REQUESTS - timestamps.length };
}

// ── Upstash Redis (production — persists across serverless instances) ─────────
let upstashLimiter: Ratelimit | null = null;

function getUpstashLimiter(): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  if (!upstashLimiter) {
    upstashLimiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, '60 s'),
      prefix: 'cws_rl',
      analytics: false,
    });
  }
  return upstashLimiter;
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function rateLimit(ip: string): Promise<{ success: boolean; remaining: number }> {
  const limiter = getUpstashLimiter();
  if (limiter) {
    const result = await limiter.limit(ip);
    return { success: result.success, remaining: result.remaining };
  }
  return rateLimitInMemory(ip);
}

export function getIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return (forwarded.split(',')[0] ?? forwarded).trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}
