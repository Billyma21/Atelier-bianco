/** Rate limiting léger en mémoire (par instance serveur). Pour la prod multi-région, préférer Vercel KV / Upstash. */

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const row = buckets.get(key);

  if (!row || now > row.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (row.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((row.resetAt - now) / 1000),
    };
  }

  row.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function clientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}
