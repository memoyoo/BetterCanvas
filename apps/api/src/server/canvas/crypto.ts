import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

const AES_ALGORITHM = "aes-256-gcm";
const IV_BYTE_LENGTH = 12;
const KEY_BYTE_LENGTH = 32;

type EncryptedCanvasToken = {
  encryptedToken: Buffer | Uint8Array;
  iv: Buffer | Uint8Array;
  authTag: Buffer | Uint8Array;
};

function getTokenEncryptionKey() {
  const encodedKey = process.env.TOKEN_ENC_KEY;

  if (!encodedKey) {
    throw new Error(
      "TOKEN_ENC_KEY is not configured. Add a 32-byte base64 key before connecting Canvas.",
    );
  }

  const key = Buffer.from(encodedKey, "base64");

  if (key.length !== KEY_BYTE_LENGTH) {
    throw new Error(
      "TOKEN_ENC_KEY must decode to exactly 32 bytes for AES-256-GCM.",
    );
  }

  return key;
}

function toBuffer(value: Buffer | Uint8Array) {
  return Buffer.isBuffer(value) ? value : Buffer.from(value);
}

export const tokenEncryptionConfigured = Boolean(process.env.TOKEN_ENC_KEY);

export function encryptCanvasToken(token: string): EncryptedCanvasToken {
  const iv = randomBytes(IV_BYTE_LENGTH);
  const cipher = createCipheriv(AES_ALGORITHM, getTokenEncryptionKey(), iv);
  const encryptedToken = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  return {
    encryptedToken,
    iv,
    authTag: cipher.getAuthTag(),
  };
}

export function decryptCanvasToken(input: EncryptedCanvasToken) {
  const decipher = createDecipheriv(
    AES_ALGORITHM,
    getTokenEncryptionKey(),
    toBuffer(input.iv),
  );

  decipher.setAuthTag(toBuffer(input.authTag));

  return Buffer.concat([
    decipher.update(toBuffer(input.encryptedToken)),
    decipher.final(),
  ]).toString("utf8");
}
