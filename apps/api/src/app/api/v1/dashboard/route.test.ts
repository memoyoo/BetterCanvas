// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockGetMobileUserFromRequest = vi.fn();
vi.mock("@/server/mobile-auth", () => ({
  getMobileUserFromRequest: (...args: unknown[]) => mockGetMobileUserFromRequest(...args),
}));

const mockGetDashboardView = vi.fn();
vi.mock("@/server/canvas/view-models", () => ({
  getDashboardView: (...args: unknown[]) => mockGetDashboardView(...args),
}));

const MOCK_USER = { id: "user-1", email: "test@example.com", canvasAccount: null };

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GET /api/v1/dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no valid bearer token is provided", async () => {
    mockGetMobileUserFromRequest.mockResolvedValue(null);

    const { GET } = await import("./route");
    const request = new Request("http://localhost/api/v1/dashboard");
    const response = await GET(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns dashboard data for authenticated user", async () => {
    const dashboardData = {
      briefing: ["You have 2 assignments due this week."],
      connected: true,
      dueItems: [{ id: "1", title: "Essay", due: "Tomorrow", status: "At risk", course: "ENG 101" }],
      announcements: [],
      atRiskCourses: [],
    };
    mockGetMobileUserFromRequest.mockResolvedValue(MOCK_USER);
    mockGetDashboardView.mockResolvedValue(dashboardData);

    const { GET } = await import("./route");
    const request = new Request("http://localhost/api/v1/dashboard", {
      headers: { Authorization: "Bearer valid-token" },
    });
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.briefing).toHaveLength(1);
    expect(body.connected).toBe(true);
    expect(mockGetDashboardView).toHaveBeenCalledWith("user-1");
  });
});
