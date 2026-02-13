import { NextResponse } from "next/server";
import { checkLLMHealth } from "@/lib/llm";

// Cache the health check result for 60 seconds to avoid token waste
let cachedResult: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 60_000;

export async function GET() {
  const now = Date.now();

  if (cachedResult && now - cachedResult.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedResult.data);
  }

  try {
    const result = await checkLLMHealth();

    const responseData = {
      ...result,
      timestamp: new Date().toISOString(),
    };

    cachedResult = { data: responseData, timestamp: now };

    const statusCode = result.status === "ok" ? 200 : 503;
    return NextResponse.json(responseData, { status: statusCode });
  } catch (err) {
    console.error("LLM health check failed:", err);
    return NextResponse.json(
      {
        status: "error",
        error: "LLM health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
