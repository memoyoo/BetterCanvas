// @vitest-environment node

import { describe, expect, it, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockCanvasAccountFindUnique = vi.fn();
const mockCanvasAccountFindFirst = vi.fn();
const mockCanvasAccountFindMany = vi.fn();
const mockCanvasAccountDeleteMany = vi.fn();

vi.mock("@/lib/db", () => ({
  getPrismaClient: () => ({
    canvasAccount: {
      findUnique: mockCanvasAccountFindUnique,
      findFirst: mockCanvasAccountFindFirst,
      findMany: mockCanvasAccountFindMany,
      deleteMany: mockCanvasAccountDeleteMany,
    },
  }),
}));

const mockGetCanvasInitialSyncSnapshot = vi.fn();
const mockNormalizeCanvasDomain = vi.fn((d: string) => `https://${d}`);
const mockGetCanvasFriendlyError = vi.fn((e: unknown) =>
  e instanceof Error ? e.message : "Canvas error",
);

vi.mock("@/server/canvas/client", () => ({
  addCanvasConversationMessage: vi.fn(),
  getCanvasConversation: vi.fn(),
  getCanvasFriendlyError: (e: unknown) => mockGetCanvasFriendlyError(e),
  getCanvasInitialSyncSnapshot: (...args: unknown[]) => mockGetCanvasInitialSyncSnapshot(...args),
  normalizeCanvasDomain: (d: string) => mockNormalizeCanvasDomain(d),
}));

vi.mock("@/server/canvas/crypto", () => ({
  decryptCanvasToken: () => "decrypted-token",
  encryptCanvasToken: () => ({
    authTag: Buffer.from("auth-tag"),
    encryptedToken: Buffer.from("encrypted-token"),
    iv: Buffer.from("iv-value"),
  }),
  tokenEncryptionConfigured: true,
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("canvas/service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DATABASE_URL = "postgresql://test";
  });

  describe("disconnectCanvasAccount", () => {
    it("deletes canvas accounts for the given user", async () => {
      mockCanvasAccountDeleteMany.mockResolvedValue({ count: 1 });

      const { disconnectCanvasAccount } = await import("./service");
      const result = await disconnectCanvasAccount("user-1");

      expect(mockCanvasAccountDeleteMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      });
      expect(result.count).toBe(1);
    });
  });

  describe("connectCanvasAccount", () => {
    it("throws when token is empty", async () => {
      const { connectCanvasAccount } = await import("./service");

      await expect(
        connectCanvasAccount({ userId: "user-1", domain: "canvas.school.edu", token: "   " }),
      ).rejects.toThrow("Paste your Canvas access token");
    });

    it("normalizes domain and fetches snapshot", async () => {
      // This will fail in the saveCanvasSnapshot call because the mock prisma is incomplete,
      // but we can verify the API was called correctly by catching the error
      const snapshot = {
        user: { id: 42, name: "Test User", short_name: "Test", sortable_name: "User, Test" },
        courses: [],
        assignments: [],
        plannerItems: [],
        activityItems: [],
        calendarEvents: [],
        conversations: [],
      };
      mockGetCanvasInitialSyncSnapshot.mockResolvedValue(snapshot);

      const { connectCanvasAccount } = await import("./service");

      // The function will throw because our mock getPrismaClient doesn't have $transaction
      // But we verify the domain normalization and API call happened
      await expect(
        connectCanvasAccount({ userId: "user-1", domain: "canvas.school.edu", token: "valid-token" }),
      ).rejects.toThrow();

      expect(mockNormalizeCanvasDomain).toHaveBeenCalledWith("canvas.school.edu");
      expect(mockGetCanvasInitialSyncSnapshot).toHaveBeenCalledWith(
        "https://canvas.school.edu",
        "valid-token",
      );
    });
  });

  describe("syncCanvasAccount", () => {
    it("throws when no canvas account exists", async () => {
      mockCanvasAccountFindUnique.mockResolvedValue(null);

      const { syncCanvasAccount } = await import("./service");

      await expect(
        syncCanvasAccount("user-1"),
      ).rejects.toThrow("Connect a Canvas account before syncing");
    });
  });

  describe("syncAllCanvasAccounts", () => {
    it("returns empty results when no accounts exist", async () => {
      mockCanvasAccountFindMany.mockResolvedValue([]);

      const { syncAllCanvasAccounts } = await import("./service");
      const result = await syncAllCanvasAccounts();

      expect(result.accountCount).toBe(0);
      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(0);
      expect(result.results).toHaveLength(0);
    });
  });

  describe("canvasSyncConfigured", () => {
    it("reports sync as configured when env vars are present", async () => {
      const { canvasSyncConfigured } = await import("./service");
      expect(canvasSyncConfigured).toBe(true);
    });
  });
});
