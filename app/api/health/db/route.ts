import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    return NextResponse.json({
      status: "ok",
      latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("DB health check failed:", err);
    return NextResponse.json(
      {
        status: "error",
        error: "Database connection failed",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
