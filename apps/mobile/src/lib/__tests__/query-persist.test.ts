import { describe, expect, it, beforeEach, vi } from "vitest";

// Mock AsyncStorage
const store: Record<string, string> = {};

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => store[key] ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn(async (key: string) => {
      delete store[key];
    }),
  },
}));

import {
  persistQueryCache,
  restoreQueryCache,
  clearQueryCache,
} from "../query-persist";

describe("query-persist", () => {
  beforeEach(() => {
    // Clear the mock store
    for (const key of Object.keys(store)) {
      delete store[key];
    }
  });

  it("persist → restore round-trip returns the same data", async () => {
    const data = {
      mutations: [],
      queries: [
        {
          queryHash: '["dashboard"]',
          queryKey: ["dashboard"],
          state: { data: { gpa: 3.8 } },
        },
      ],
    };

    await persistQueryCache(data);
    const restored = await restoreQueryCache();

    expect(restored).toEqual(data);
  });

  it("returns null when no cache exists", async () => {
    const result = await restoreQueryCache();
    expect(result).toBeNull();
  });

  it("returns null for expired cache (>24h)", async () => {
    // Manually write an expired cache entry
    const expired = {
      buster: "v1",
      clientState: { mutations: [], queries: [] },
      timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
      version: 1,
    };
    store["bettercanvas.query-cache"] = JSON.stringify(expired);

    const result = await restoreQueryCache();
    expect(result).toBeNull();
  });

  it("returns null for mismatched cache buster", async () => {
    const mismatch = {
      buster: "v0-old",
      clientState: { mutations: [], queries: [] },
      timestamp: Date.now(),
      version: 1,
    };
    store["bettercanvas.query-cache"] = JSON.stringify(mismatch);

    const result = await restoreQueryCache();
    expect(result).toBeNull();
  });

  it("clearQueryCache removes stored data", async () => {
    await persistQueryCache({ mutations: [], queries: [] });
    expect(store["bettercanvas.query-cache"]).toBeDefined();

    await clearQueryCache();
    expect(store["bettercanvas.query-cache"]).toBeUndefined();
  });
});
