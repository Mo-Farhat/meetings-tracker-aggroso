import { NextResponse } from "next/server";
import { ActionItemCreateSchema } from "@/lib/validations";
import { createActionItem } from "@/lib/services/action-item";
import { log } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ActionItemCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const item = await createActionItem(parsed.data);
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    log.api.error({ err, path: "/api/action-items" }, "POST /api/action-items error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
