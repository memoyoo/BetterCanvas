// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";

const syncAllCanvasAccounts = vi.fn();

vi.mock("@/server/canvas/service", () => ({
  canvasSyncConfigured: true,
  getCanvasSyncSetupIssues: () => ["TOKEN_ENC_KEY"],
  syncAllCanvasAccounts,
}));

describe("POST /api/cron/canvas-sync", () => {
  const originalSecret = process.env.CRON_SECRET;

  afterEach(() => {
    syncAllCanvasAccounts.mockReset();

    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET;
      return;
    }

    process.env.CRON_SECRET = originalSecret;
  });

  it("rejects requests with the wrong bearer token", async () => {
    process.env.CRON_SECRET = "expected-secret";
    const { POST } = await import("@/app/api/cron/canvas-sync/route");
    const response = await POST(
      new Request("http://localhost/api/cron/canvas-sync", {
        headers: {
          authorization: "Bearer wrong-secret",
        },
        method: "POST",
      }),
    );

    expect(response.status).toBe(401);
  });

  it("runs sync for authorized requests", async () => {
    process.env.CRON_SECRET = "expected-secret";
    syncAllCanvasAccounts.mockResolvedValueOnce({
      accountCount: 2,
      failureCount: 0,
      results: [],
      successCount: 2,
    });

    const { POST } = await import("@/app/api/cron/canvas-sync/route");
    const response = await POST(
      new Request("http://localhost/api/cron/canvas-sync", {
        headers: {
          authorization: "Bearer expected-secret",
        },
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.accountCount).toBe(2);
    expect(syncAllCanvasAccounts).toHaveBeenCalledTimes(1);
  });
});
