// Mock-only: mimics the API rule "5 wrong codes within a minute block for 60 s".

export interface RateLimiter {
  isBlocked(now: number): boolean;
  recordFailure(now: number): void;
}

export function createRateLimiter(maxFailures = 5, windowMs = 60_000, blockMs = 60_000): RateLimiter {
  let failures: number[] = [];
  let blockedUntil = 0;

  return {
    isBlocked: (now) => now < blockedUntil,
    recordFailure(now) {
      failures = failures.filter((t) => now - t < windowMs);
      failures.push(now);
      if (failures.length >= maxFailures) {
        blockedUntil = now + blockMs;
        failures = [];
      }
    },
  };
}
