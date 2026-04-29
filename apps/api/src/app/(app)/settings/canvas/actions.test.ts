// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockSyncCanvasAccount = vi.fn();
const mockDisconnectCanvasAccount = vi.fn();

vi.mock("@/server/canvas/service", () => ({
  syncCanvasAccount: (...args: unknown[]) => mockSyncCanvasAccount(...args),
  disconnectCanvasAccount: (...args: unknown[]) => mockDisconnectCanvasAccount(...args),
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

const MOCK_USER = { id: "user-1", canvasAccount: null };
const INITIAL_STATE = { error: null };

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("settings/canvas/actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redirectCalls.length = 0;
    mockRequireUser.mockResolvedValue(MOCK_USER);
  });

  describe("resyncCanvasConnection", () => {
    it("syncs canvas and redirects with status=synced", async () => {
      mockSyncCanvasAccount.mockResolvedValue({});

      const { resyncCanvasConnection } = await import("./actions");

      await expect(
        resyncCanvasConnection(INITIAL_STATE),
      ).rejects.toThrow("REDIRECT");

      expect(mockSyncCanvasAccount).toHaveBeenCalledWith("user-1");
      expect(redirectCalls[redirectCalls.length - 1]).toContain("status=synced");
    });

    it("returns error state when sync fails", async () => {
      mockSyncCanvasAccount.mockRejectedValue(new Error("Sync timeout"));

      const { resyncCanvasConnection } = await import("./actions");

      const result = await resyncCanvasConnection(INITIAL_STATE);

      expect(result.error).toBe("Sync timeout");
    });
  });

  describe("disconnectCanvasConnection", () => {
    it("disconnects canvas and redirects with status=disconnected", async () => {
      mockDisconnectCanvasAccount.mockResolvedValue({});

      const { disconnectCanvasConnection } = await import("./actions");

      await expect(
        disconnectCanvasConnection(INITIAL_STATE),
      ).rejects.toThrow("REDIRECT");

      expect(mockDisconnectCanvasAccount).toHaveBeenCalledWith("user-1");
      expect(redirectCalls[redirectCalls.length - 1]).toContain("status=disconnected");
    });

    it("returns error state when disconnect fails", async () => {
      mockDisconnectCanvasAccount.mockRejectedValue(new Error("DB error"));

      const { disconnectCanvasConnection } = await import("./actions");

      const result = await disconnectCanvasConnection(INITIAL_STATE);

      expect(result.error).toBe("DB error");
    });
  });
});
