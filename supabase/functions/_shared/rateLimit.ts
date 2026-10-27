// Fixed-window rate limiting. Counters live in the `rate_limits` table because each
// Edge Function invocation may run in a different isolate (no shared memory).
//
// The atomic "insert or increment, return new count" happens in SQL (a Postgres function,
// added with the schema migration). This module only holds the window logic, so it can be
// unit-tested with a fake counter.

export type Limit = { name: string; max: number; windowSeconds: number };

// Increments the counter for (key, windowStart) and returns the new count.
export type IncrementFn = (key: string, windowStart: Date) => Promise<number>;

export const LIMITS = {
  access: [
    { name: "min", max: 5, windowSeconds: 60 },
    { name: "hour", max: 20, windowSeconds: 60 * 60 },
  ],
  sendInvite: [{ name: "hour", max: 20, windowSeconds: 60 * 60 }],
  uploadUrl: [{ name: "min", max: 300, windowSeconds: 60 }],
} satisfies Record<string, Limit[]>;

export function windowStart(now: number, windowSeconds: number): Date {
  const size = windowSeconds * 1000;
  return new Date(Math.floor(now / size) * size);
}

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

// Every attempt counts (including the blocked ones), so hammering doesn't reset anything.
export async function checkRateLimit(
  key: string,
  limits: Limit[],
  increment: IncrementFn,
  now = Date.now(),
): Promise<RateLimitResult> {
  let retryAfterSeconds = 0;
  for (const limit of limits) {
    const start = windowStart(now, limit.windowSeconds);
    const count = await increment(`${key}:${limit.name}`, start);
    if (count > limit.max) {
      const end = start.getTime() + limit.windowSeconds * 1000;
      retryAfterSeconds = Math.max(retryAfterSeconds, Math.ceil((end - now) / 1000));
    }
  }
  return retryAfterSeconds > 0 ? { allowed: false, retryAfterSeconds } : { allowed: true };
}

// First address in x-forwarded-for is the client; the rest are proxies.
export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}
