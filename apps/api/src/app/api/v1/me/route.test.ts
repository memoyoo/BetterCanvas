// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockGetMobileUserFromRequest = vi.fn();
vi.mock("@/server/mobile-auth", () => ({
  getMobileUserFromRequest: (...args: unknown[]) => mockGetMobileUserFromRequest(...args),
}));

const mockDeleteUser = vi.fn();
vi.mock("@/lib/db", () => ({
  getPrismaClient: () => ({
    user: {
      delete: mockDeleteUser,
    },
  }),
}));

const MOCK_USER = { id: "user-1", email: "test@example.com", displayName: "Test User", canvasAccount: null };

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GET /api/v1/me", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no valid bearer token is provided", async () => {
    mockGetMobileUserFromRequest.mockResolvedValue(null);

    const { GET } = await import("./route");
    const request = new Request("http://localhost/api/v1/me");
    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it("returns user profile for authenticated user", async () => {
    mockGetMobileUserFromRequest.mockResolvedValue(MOCK_USER);

    const { GET } = await import("./route");
    const request = new Request("http://localhost/api/v1/me", {
      headers: { Authorization: "Bearer valid-token" },
    });
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.id).toBe("user-1");
    expect(body.email).toBe("test@example.com");
    expect(body.displayName).toBe("Test User");
  });

  it("deletes the authenticated mobile user's account data", async () => {
    mockGetMobileUserFromRequest.mockResolvedValue(MOCK_USER);
    mockDeleteUser.mockResolvedValue(MOCK_USER);

    const { DELETE } = await import("./route");
    const request = new Request("http://localhost/api/v1/me", {
      headers: { Authorization: "Bearer valid-token" },
      method: "DELETE",
    });
    const response = await DELETE(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ success: true });
    expect(mockDeleteUser).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
  });

  it("returns 401 when account deletion is requested without auth", async () => {
    mockGetMobileUserFromRequest.mockResolvedValue(null);

    const { DELETE } = await import("./route");
    const response = await DELETE(
      new Request("http://localhost/api/v1/me", { method: "DELETE" }),
    );

    expect(response.status).toBe(401);
    expect(mockDeleteUser).not.toHaveBeenCalled();
  });
});
