import { describe, expect, it, vi, beforeEach } from "vitest";

import { ApiError, onUnauthorized } from "../api";

describe("ApiError", () => {
  it("sets status and message correctly", () => {
    const error = new ApiError(404, "Not Found");
    expect(error.status).toBe(404);
    expect(error.message).toBe("Not Found");
    expect(error.name).toBe("ApiError");
  });

  it("is an instance of Error", () => {
    const error = new ApiError(500, "Server Error");
    expect(error).toBeInstanceOf(Error);
  });
});

describe("onUnauthorized", () => {
  beforeEach(() => {
    // Reset the handler
    onUnauthorized(null);
  });

  it("accepts a handler function", () => {
    const handler = vi.fn();
    // Should not throw
    expect(() => onUnauthorized(handler)).not.toThrow();
  });

  it("accepts null to clear the handler", () => {
    expect(() => onUnauthorized(null)).not.toThrow();
  });
});
