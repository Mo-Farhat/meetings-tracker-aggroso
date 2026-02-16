import { NextResponse } from "next/server";
import { getRecentTranscripts } from "@/lib/services/transcript";
import { log } from "@/lib/logger";

export async function GET() {
  try {
    const transcripts = await getRecentTranscripts();
    return NextResponse.json(transcripts);
  } catch (err) {
    log.api.error({ err, path: "/api/history" }, "GET /api/history error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
