import { NextResponse } from "next/server";
import { TranscriptInputSchema } from "@/lib/validations";
import { processTranscript } from "@/lib/services/transcript";
import { log } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = TranscriptInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const transcript = await processTranscript(parsed.data.text);

    return NextResponse.json(transcript, { status: 201 });
  } catch (err) {
    log.api.error({ err, path: "/api/transcripts" }, "POST /api/transcripts error");
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
