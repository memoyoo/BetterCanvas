/**
 * jose compares `Uint8Array` across realms; default Vitest jsdom can break that check.
 * @vitest-environment node
 */
import { afterEach, describe, expect, it, vi } from "vitest";

import { createCanvasOAuthState, verifyCanvasOAuthState } from "./oauth";

describe("canvas oauth state", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("roundtrips signed OAuth state with normalized domain", async () => {
    vi.stubEnv("AUTH_SECRET", "test-secret-at-least-32-chars-long!");
    const token = await createCanvasOAuthState("canvas.school.edu");
    const { domain } = await verifyCanvasOAuthState(token);
    expect(domain).toBe("https://canvas.school.edu");
  });
});
