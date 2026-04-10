/**
 * Impersonation cookie utilities (Node.js runtime — API routes + server components).
 * Cookie format: base64url(JSON.stringify(payload)).HMAC-SHA256-hex
 * TTL: 2 hours
 */
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'cws_admin_impersonate';
const TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export interface ImpersonationPayload {
  adminUserId: string;
  targetOrgId: string;
  startedAt: string;
}

function getSecret(): string {
  const s = process.env.IMPERSONATION_SECRET;
  if (!s) throw new Error('IMPERSONATION_SECRET env var not set');
  return s;
}

export function createImpersonationCookie(adminUserId: string, targetOrgId: string): string {
  const payload: ImpersonationPayload = {
    adminUserId,
    targetOrgId,
    startedAt: new Date().toISOString(),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHmac('sha256', getSecret()).update(payloadB64).digest('hex');
  return `${payloadB64}.${sig}`;
}

export function verifyImpersonationCookie(value: string): ImpersonationPayload | null {
  try {
    const secret = process.env.IMPERSONATION_SECRET;
    if (!secret) return null;

    const lastDot = value.lastIndexOf('.');
    if (lastDot === -1) return null;

    const payloadB64 = value.slice(0, lastDot);
    const sigHex = value.slice(lastDot + 1);

    // Constant-time signature comparison
    const expectedSig = createHmac('sha256', secret).update(payloadB64).digest('hex');
    const expectedBuf = Buffer.from(expectedSig, 'hex');
    const actualBuf = Buffer.from(sigHex, 'hex');
    if (expectedBuf.length !== actualBuf.length) return null;
    if (!timingSafeEqual(expectedBuf, actualBuf)) return null;

    // Decode payload
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as ImpersonationPayload;

    // TTL check
    if (Date.now() - new Date(payload.startedAt).getTime() > TTL_MS) return null;

    return payload;
  } catch {
    return null;
  }
}

/** For use in API route handlers (request has cookies). */
export function getImpersonationPayloadFromRequest(
  cookies: { get(name: string): { value: string } | undefined }
): ImpersonationPayload | null {
  const value = cookies.get(COOKIE_NAME)?.value;
  if (!value) return null;
  return verifyImpersonationCookie(value);
}

export { COOKIE_NAME };
