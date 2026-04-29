// @vitest-environment node

import { describe, expect, it, beforeEach, vi } from "vitest";

import { checkRateLimit } from "@/server/rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit("test-key-1", {
      maxRequests: 3,
      windowMs: 10_000,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfterMs).toBeNull();
  });

  it("blocks requests over the limit", () => {
    const key = "test-key-2";
    const options = { maxRequests: 2, windowMs: 10_000 };

    checkRateLimit(key, options);
    checkRateLimit(key, options);
    const result = checkRateLimit(key, options);

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets after the window expires", () => {
    const key = "test-key-3";
    const options = { maxRequests: 1, windowMs: 5_000 };

    checkRateLimit(key, options);
    const blocked = checkRateLimit(key, options);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(5_001);

    const allowed = checkRateLimit(key, options);
    expect(allowed.allowed).toBe(true);
  });

  it("uses separate limits for different keys", () => {
    const options = { maxRequests: 1, windowMs: 10_000 };

    checkRateLimit("key-a", options);
    const resultA = checkRateLimit("key-a", options);
    const resultB = checkRateLimit("key-b", options);

    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });
});
