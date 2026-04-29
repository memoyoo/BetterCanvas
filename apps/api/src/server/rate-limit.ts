import "server-only";

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * Not shared across workers, so this is a per-instance guard.
 * For production at scale, swap with a Redis-backed limiter.
 */

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX_REQUESTS = 10;

type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

function pruneOldEntries(entry: RateLimitEntry, windowMs: number) {
  const cutoff = Date.now() - windowMs;
  entry.timestamps = entry.timestamps.filter(
    (timestamp) => timestamp > cutoff,
  );
}

type RateLimitOptions = {
  /** Maximum requests allowed per window. Default: 10. */
  maxRequests?: number;
  /** Time window in milliseconds. Default: 60 000 (1 minute). */
  windowMs?: number;
};

export function checkRateLimit(
  key: string,
  options?: RateLimitOptions,
): { allowed: boolean; remaining: number; retryAfterMs: number | null } {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS;

  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  pruneOldEntries(entry, windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = oldestInWindow
      ? oldestInWindow + windowMs - Date.now()
      : windowMs;

    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.timestamps.push(Date.now());

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    retryAfterMs: null,
  };
}

export function getRateLimitKey(request: Request, prefix: string) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  return `${prefix}:${ip}`;
}

/**
 * Run cleanup every 5 minutes to prevent unbounded memory growth.
 */
if (typeof globalThis !== "undefined") {
  const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

  setInterval(() => {
    const cutoff = Date.now() - DEFAULT_WINDOW_MS * 2;

    for (const [key, entry] of store.entries()) {
      const newest = entry.timestamps[entry.timestamps.length - 1];

      if (!newest || newest < cutoff) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS).unref?.();
}
