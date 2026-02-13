import { NextResponse } from "next/server";
import { getRecentTranscripts } from "@/lib/services/transcript";

export async function GET() {
  try {
    const transcripts = await getRecentTranscripts();
    return NextResponse.json(transcripts);
  } catch (err) {
    console.error("GET /api/history error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
