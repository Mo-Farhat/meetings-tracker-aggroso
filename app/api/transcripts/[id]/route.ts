import { NextResponse } from "next/server";
import { getTranscriptById } from "@/lib/services/transcript";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transcript = await getTranscriptById(id);

    if (!transcript) {
      return NextResponse.json(
        { error: "Transcript not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transcript);
  } catch (err) {
    console.error("GET /api/transcripts/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
