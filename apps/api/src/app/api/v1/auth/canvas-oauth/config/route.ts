import { NextResponse } from "next/server";

import { canvasOAuthConfigResponseSchema } from "@bettercanvas/shared";

import {
  getCanvasOAuthRedirectUri,
  isCanvasOAuthConfigured,
} from "@/server/canvas/oauth";

export async function GET() {
  const enabled = isCanvasOAuthConfigured();
  const redirectUri = enabled ? getCanvasOAuthRedirectUri() : null;

  const body = canvasOAuthConfigResponseSchema.parse({
    enabled,
    redirectUri,
  });

  return NextResponse.json(body);
}
