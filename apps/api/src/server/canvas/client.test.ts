// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  CanvasApiError,
  getCanvasFriendlyError,
  normalizeCanvasDomain,
} from "@/server/canvas/client";

describe("normalizeCanvasDomain", () => {
  it("adds https when the protocol is omitted", () => {
    expect(normalizeCanvasDomain("canvas.school.edu")).toBe(
      "https://canvas.school.edu",
    );
  });

  it("normalizes protocol, host casing, and strips extra path segments", () => {
    expect(normalizeCanvasDomain("https://Canvas.School.EDU/login")).toBe(
      "https://canvas.school.edu",
    );
  });

  it("rejects empty values", () => {
    expect(() => normalizeCanvasDomain("   ")).toThrow(
      "Enter your Canvas domain to continue.",
    );
  });
});

describe("getCanvasFriendlyError", () => {
  it("maps auth failures to a user-facing token message", () => {
    expect(getCanvasFriendlyError(new CanvasApiError(401, "Unauthorized"))).toBe(
      "Canvas rejected that access token. Double-check the token and make sure it has API access.",
    );
  });
});
