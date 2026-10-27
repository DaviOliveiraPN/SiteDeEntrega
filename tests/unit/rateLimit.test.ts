import { describe, expect, it } from "vitest";
import {
  checkRateLimit,
  clientIp,
  type IncrementFn,
  LIMITS,
  windowStart,
} from "../../supabase/functions/_shared/rateLimit.ts";

// In-memory stand-in for the SQL counter.
function fakeCounter(): IncrementFn {
  const counts = new Map<string, number>();
  return async (key, start) => {
    const k = `${key}@${start.toISOString()}`;
    const n = (counts.get(k) ?? 0) + 1;
    counts.set(k, n);
    return n;
  };
}

const T0 = Date.UTC(2026, 0, 1, 12, 0, 0);

describe("windowStart", () => {
  it("aligns to the window size", () => {
    expect(windowStart(T0 + 59_999, 60).getTime()).toBe(T0);
    expect(windowStart(T0 + 60_000, 60).getTime()).toBe(T0 + 60_000);
  });
});

describe("checkRateLimit (access)", () => {
  it("allows 5 per minute, blocks the 6th", async () => {
    const inc = fakeCounter();
    for (let i = 0; i < 5; i++) {
      expect((await checkRateLimit("access:1.2.3.4", LIMITS.access, inc, T0 + i)).allowed).toBe(true);
    }
    const blocked = await checkRateLimit("access:1.2.3.4", LIMITS.access, inc, T0 + 10_000);
    expect(blocked).toEqual({ allowed: false, retryAfterSeconds: 50 });
  });

  it("keeps IPs separate", async () => {
    const inc = fakeCounter();
    for (let i = 0; i < 6; i++) await checkRateLimit("access:a", LIMITS.access, inc, T0);
    expect((await checkRateLimit("access:b", LIMITS.access, inc, T0)).allowed).toBe(true);
  });

  it("enforces the hourly limit across minutes", async () => {
    const inc = fakeCounter();
    // 4 attempts per minute stays under the minute limit; the 21st in the hour is blocked.
    let last;
    for (let i = 0; i < 21; i++) {
      last = await checkRateLimit("access:x", LIMITS.access, inc, T0 + Math.floor(i / 4) * 60_000);
    }
    expect(last?.allowed).toBe(false);
  });
});

describe("clientIp", () => {
  it("takes the first x-forwarded-for entry", () => {
    const req = new Request("http://x", { headers: { "x-forwarded-for": "9.9.9.9, 10.0.0.1" } });
    expect(clientIp(req)).toBe("9.9.9.9");
    expect(clientIp(new Request("http://x"))).toBe("unknown");
  });
});
