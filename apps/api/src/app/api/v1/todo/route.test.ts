// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockGetMobileUserFromRequest = vi.fn();
vi.mock("@/server/mobile-auth", () => ({
  getMobileUserFromRequest: (...args: unknown[]) => mockGetMobileUserFromRequest(...args),
}));

const mockGetTodoView = vi.fn();
vi.mock("@/server/canvas/view-models", () => ({
  getTodoView: (...args: unknown[]) => mockGetTodoView(...args),
}));

const MOCK_USER = { id: "user-1", canvasAccount: null };

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("GET /api/v1/todo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without auth", async () => {
    mockGetMobileUserFromRequest.mockResolvedValue(null);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/v1/todo"));

    expect(response.status).toBe(401);
  });

  it("returns todo items for authenticated user", async () => {
    const todoData = {
      connected: true,
      items: [{ id: "1", title: "Read ch.5", detail: "Tomorrow", priority: "High", status: "At risk", source: "Assignment", isPersonalTask: false, notes: null, dueDateValue: "2026-05-01" }],
      completedTasks: [],
    };
    mockGetMobileUserFromRequest.mockResolvedValue(MOCK_USER);
    mockGetTodoView.mockResolvedValue(todoData);

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost/api/v1/todo", {
      headers: { Authorization: "Bearer valid-token" },
    }));

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.items).toHaveLength(1);
    expect(body.connected).toBe(true);
    expect(mockGetTodoView).toHaveBeenCalledWith("user-1");
  });
});
