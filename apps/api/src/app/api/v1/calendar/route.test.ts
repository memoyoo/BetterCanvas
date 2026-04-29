// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockGetMobileUserFromRequest = vi.fn();
vi.mock("@/server/mobile-auth", () => ({
  getMobileUserFromRequest: (...args: unknown[]) => mockGetMobileUserFromRequest(...args),
}));

const mockGetCalendarView = vi.fn();
vi.mock("@/server/canvas/view-models", () => ({
  getCalendarView: (...args: unknown[]) => mockGetCalendarView(...args),
}));

const MOCK_USER = { id: "user-1", canvasAccount: null };

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GET /api/v1/calendar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without auth", async () => {
    mockGetMobileUserFromRequest.mockResolvedValue(null);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/v1/calendar"));

    expect(response.status).toBe(401);
  });

  it("returns calendar data for authenticated user", async () => {
    const calendarData = {
      connected: true,
      days: [{ key: "2026-05-01", day: "Thu", count: 2, focus: "Essay due" }],
      upcomingItems: [],
      selectedDayItems: [],
      selectedDayLabel: "Thursday, May 1",
    };
    mockGetMobileUserFromRequest.mockResolvedValue(MOCK_USER);
    mockGetCalendarView.mockResolvedValue(calendarData);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/v1/calendar", {
      headers: { Authorization: "Bearer valid-token" },
    }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.connected).toBe(true);
    expect(body.days).toHaveLength(1);
    expect(mockGetCalendarView).toHaveBeenCalledWith("user-1");
  });
});
