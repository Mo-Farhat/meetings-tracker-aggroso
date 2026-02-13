import { NextResponse } from "next/server";
import { ActionItemCreateSchema } from "@/lib/validations";
import { createActionItem } from "@/lib/services/action-item";

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
    console.error("POST /api/action-items error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
