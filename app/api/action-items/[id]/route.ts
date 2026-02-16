import { NextResponse } from "next/server";
import { ActionItemUpdateSchema } from "@/lib/validations";
import { updateActionItem, deleteActionItem } from "@/lib/services/action-item";
import { log } from "@/lib/logger";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = ActionItemUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const item = await updateActionItem(id, parsed.data);
    return NextResponse.json(item);
  } catch (err) {
    log.api.error({ err, path: "/api/action-items/[id]" }, "PATCH error");

    if (
      err instanceof Error &&
      err.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteActionItem(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    log.api.error({ err, path: "/api/action-items/[id]" }, "DELETE error");

    if (
      err instanceof Error &&
      err.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        { error: "Action item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
