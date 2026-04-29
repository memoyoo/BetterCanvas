// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  decryptCanvasToken,
  encryptCanvasToken,
} from "@/server/canvas/crypto";

const originalKey = process.env.TOKEN_ENC_KEY;
const validKey = Buffer.alloc(32, 7).toString("base64");

describe("canvas token crypto", () => {
  beforeEach(() => {
    process.env.TOKEN_ENC_KEY = validKey;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.TOKEN_ENC_KEY;
      return;
    }

    process.env.TOKEN_ENC_KEY = originalKey;
  });

  it("round-trips an encrypted token", () => {
    const encrypted = encryptCanvasToken("canvas-secret-token");

    expect(
      decryptCanvasToken({
        authTag: encrypted.authTag,
        encryptedToken: encrypted.encryptedToken,
        iv: encrypted.iv,
      }),
    ).toBe("canvas-secret-token");
  });

  it("rejects malformed encryption keys", () => {
    process.env.TOKEN_ENC_KEY = Buffer.alloc(16, 3).toString("base64");

    expect(() => encryptCanvasToken("token")).toThrow(
      "TOKEN_ENC_KEY must decode to exactly 32 bytes for AES-256-GCM.",
    );
  });
});
