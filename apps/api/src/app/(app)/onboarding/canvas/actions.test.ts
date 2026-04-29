// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockConnectCanvasAccount = vi.fn();

vi.mock("@/server/canvas/service", () => ({
  connectCanvasAccount: (...args: unknown[]) => mockConnectCanvasAccount(...args),
}));

const mockRequireUser = vi.fn();
vi.mock("@/server/session", () => ({
  requireUser: () => mockRequireUser(),
}));

const redirectCalls: string[] = [];
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectCalls.push(url);
    throw new Error(`REDIRECT:${url}`);
  },
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function makeFormData(entries: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    fd.set(key, value);
  }
  return fd;
}

const MOCK_USER = { id: "user-1", canvasAccount: null };
const INITIAL_STATE = { error: null };

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("onboarding/canvas/actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redirectCalls.length = 0;
    mockRequireUser.mockResolvedValue(MOCK_USER);
  });

  describe("submitCanvasConnection", () => {
    it("connects canvas and redirects to dashboard on success", async () => {
      mockConnectCanvasAccount.mockResolvedValue({});

      const { submitCanvasConnection } = await import("./actions");

      await expect(
        submitCanvasConnection(INITIAL_STATE, makeFormData({ domain: "canvas.school.edu", token: "abc123" })),
      ).rejects.toThrow("REDIRECT");

      expect(mockConnectCanvasAccount).toHaveBeenCalledWith({
        domain: "canvas.school.edu",
        token: "abc123",
        userId: "user-1",
      });
      expect(redirectCalls[redirectCalls.length - 1]).toBe("/dashboard");
    });

    it("returns error state when domain is empty", async () => {
      const { submitCanvasConnection } = await import("./actions");

      const result = await submitCanvasConnection(
        INITIAL_STATE,
        makeFormData({ domain: "", token: "abc123" }),
      );

      expect(result.error).toBeTruthy();
      expect(mockConnectCanvasAccount).not.toHaveBeenCalled();
    });

    it("returns error state when token is empty", async () => {
      const { submitCanvasConnection } = await import("./actions");

      const result = await submitCanvasConnection(
        INITIAL_STATE,
        makeFormData({ domain: "canvas.school.edu", token: "" }),
      );

      expect(result.error).toBeTruthy();
      expect(mockConnectCanvasAccount).not.toHaveBeenCalled();
    });

    it("returns error state when connectCanvasAccount throws", async () => {
      mockConnectCanvasAccount.mockRejectedValue(new Error("Canvas API failed"));

      const { submitCanvasConnection } = await import("./actions");

      const result = await submitCanvasConnection(
        INITIAL_STATE,
        makeFormData({ domain: "canvas.school.edu", token: "abc123" }),
      );

      expect(result.error).toBe("Canvas API failed");
    });
  });
});
