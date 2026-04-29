import "server-only";

import { SignJWT, jwtVerify } from "jose";

import { getAuthSecretKey } from "@/server/auth-secret";
import { normalizeCanvasDomain } from "@/server/canvas/client";

type CanvasOAuthStatePayload = {
  dom: string;
  kind: "canvas_oauth";
};

function getOAuthClientId() {
  return process.env.CANVAS_OAUTH_CLIENT_ID?.trim() ?? "";
}

function getOAuthClientSecret() {
  return process.env.CANVAS_OAUTH_CLIENT_SECRET?.trim() ?? "";
}

function getOAuthRedirectUri() {
  return process.env.CANVAS_OAUTH_REDIRECT_URI?.trim() ?? "";
}

export function isCanvasOAuthConfigured() {
  return Boolean(
    getOAuthClientId() && getOAuthClientSecret() && getOAuthRedirectUri(),
  );
}

export function getCanvasOAuthRedirectUri() {
  return getOAuthRedirectUri() || null;
}

export async function createCanvasOAuthState(domainInput: string) {
  const domain = normalizeCanvasDomain(domainInput);

  return new SignJWT({ dom: domain, kind: "canvas_oauth" } satisfies CanvasOAuthStatePayload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("10m")
    .sign(getAuthSecretKey());
}

export async function verifyCanvasOAuthState(state: string) {
  const { payload } = await jwtVerify(state, getAuthSecretKey());
  const typed = payload as unknown as Partial<CanvasOAuthStatePayload>;

  if (typed.kind !== "canvas_oauth" || typeof typed.dom !== "string" || !typed.dom) {
    throw new Error("Invalid or expired Canvas sign-in session. Please try again.");
  }

  return { domain: typed.dom };
}

export function buildCanvasAuthorizeUrl(domainInput: string, state: string) {
  const domain = normalizeCanvasDomain(domainInput);
  const url = new URL("/login/oauth2/auth", domain);

  url.searchParams.set("client_id", getOAuthClientId());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", getOAuthRedirectUri());
  url.searchParams.set("state", state);

  return url.toString();
}

export async function exchangeCanvasOAuthCode(domainInput: string, code: string) {
  const domain = normalizeCanvasDomain(domainInput);
  const tokenUrl = new URL("/login/oauth2/token", domain).toString();
  const body = new URLSearchParams({
    client_id: getOAuthClientId(),
    client_secret: getOAuthClientSecret(),
    code: code.trim(),
    grant_type: "authorization_code",
    redirect_uri: getOAuthRedirectUri(),
  });

  const response = await fetch(tokenUrl, {
    body,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  const raw = await response.text();
  let json: unknown;

  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!response.ok) {
    throw new Error(
      `Canvas declined the OAuth exchange (${response.status}). Confirm the developer key redirect URI matches CANVAS_OAUTH_REDIRECT_URI.`,
    );
  }

  const accessToken =
    json &&
    typeof json === "object" &&
    "access_token" in json &&
    typeof (json as { access_token: unknown }).access_token === "string"
      ? (json as { access_token: string }).access_token
      : null;

  if (!accessToken) {
    throw new Error("Canvas OAuth did not return an access token.");
  }

  return accessToken;
}
