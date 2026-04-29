import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

function getCorsOrigin() {
  const appUrl = process.env.APP_URL;

  if (appUrl) {
    return appUrl;
  }

  // In development, allow any origin.
  if (process.env.NODE_ENV === "development") {
    return "*";
  }

  return null;
}

export function middleware(request: NextRequest) {
  const origin = getCorsOrigin();

  if (!origin) {
    return NextResponse.json(
      {
        error:
          "CORS origin is not configured. Set APP_URL in production environments.",
      },
      { status: 500 },
    );
  }

  // Handle preflight OPTIONS requests.
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        ...CORS_HEADERS,
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", origin);

  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }

  return response;
}

export const config = {
  matcher: ["/api/v1/:path*", "/api/cron/:path*"],
};
