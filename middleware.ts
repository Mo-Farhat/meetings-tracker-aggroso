import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// ── Security Headers ─────────────────────────────────────────────
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "on",
};

// ── CORS Config ──────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "https://meetings-tracker-aggroso.vercel.app",
  "http://localhost:3000",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {};

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, PATCH, DELETE, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }

  return headers;
}

// ── Rate Limit Category ──────────────────────────────────────────
function getRateLimitConfig(pathname: string) {
  if (pathname === "/api/transcripts" || pathname.startsWith("/api/health/llm")) {
    return RATE_LIMITS.llm;
  }
  if (pathname.startsWith("/api/health")) {
    return RATE_LIMITS.health;
  }
  return RATE_LIMITS.crud;
}

// ── Middleware ────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api");

  // Handle CORS preflight
  if (isApi && request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...getCorsHeaders(origin),
        ...SECURITY_HEADERS,
      },
    });
  }

  // Rate limiting for API routes
  if (isApi) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const config = getRateLimitConfig(pathname);
    const result = checkRateLimit(ip, config.maxRequests, config.windowMs);

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(result.retryAfterMs / 1000)),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            ...SECURITY_HEADERS,
          },
        }
      );
    }
  }

  // Add security + CORS headers to all responses
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  if (isApi) {
    const origin = request.headers.get("origin");
    const corsHeaders = getCorsHeaders(origin);
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
  }

  return response;
}

// Only run on API routes and pages (skip static assets)
export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"],
};
