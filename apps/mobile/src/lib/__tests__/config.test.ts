import { describe, expect, it, beforeEach } from "vitest";

/**
 * Mock process.env for each test. We use `vi.stubEnv` via manual assignment
 * since config.ts reads `process.env.EXPO_PUBLIC_API_URL` directly.
 */

// We need to test the module fresh each time, so we use dynamic imports.
// `getApiBaseUrl` reads process.env at call time, and checks `__DEV__`.

describe("getApiBaseUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    // @ts-expect-error -- __DEV__ is a React Native global
    globalThis.__DEV__ = true;
  });

  it("returns configured EXPO_PUBLIC_API_URL when set", async () => {
    process.env.EXPO_PUBLIC_API_URL = "https://api.bettercanvas.app";

    // Dynamic import to get fresh module
    const { getApiBaseUrl } = await import("../config");
    expect(getApiBaseUrl()).toBe("https://api.bettercanvas.app");
  });

  it("strips trailing slashes from configured URL", async () => {
    process.env.EXPO_PUBLIC_API_URL = "https://api.bettercanvas.app///";

    const { getApiBaseUrl } = await import("../config");
    expect(getApiBaseUrl()).toBe("https://api.bettercanvas.app");
  });

  it("returns localhost fallback in dev mode when no URL is set", async () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    // @ts-expect-error -- __DEV__ is a React Native global
    globalThis.__DEV__ = true;

    const { getApiBaseUrl } = await import("../config");
    expect(getApiBaseUrl()).toBe("http://localhost:3000");
  });

  it("throws in production when no URL is set", async () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    // @ts-expect-error -- __DEV__ is a React Native global
    globalThis.__DEV__ = false;

    const { getApiBaseUrl } = await import("../config");
    expect(() => getApiBaseUrl()).toThrow("EXPO_PUBLIC_API_URL is required");
  });
});
