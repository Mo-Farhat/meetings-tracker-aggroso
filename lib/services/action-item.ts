import { prisma } from "../prisma";
import type { ActionItemCreate, ActionItemUpdate } from "../validations";

// ── Types ────────────────────────────────────────────────────────
export interface ActionItemRecord {
  id: string;
  transcriptId: string | null;
  task: string;
  owner: string | null;
  dueDate: Date | null;
  done: boolean;
  tags: string[];
  createdAt: Date;
}

// ── Service Functions ────────────────────────────────────────────

/**
 * Create a new action item (manual or linked to a transcript).
 */
export async function createActionItem(data: ActionItemCreate): Promise<ActionItemRecord> {
  return prisma.actionItem.create({
    data: {
      task: data.task,
      owner: data.owner ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      tags: data.tags ?? [],
      transcriptId: data.transcriptId ?? null,
    },
  });
}

/**
 * Update an existing action item by ID.
 */
export async function updateActionItem(
  id: string,
  data: ActionItemUpdate
): Promise<ActionItemRecord> {
  return prisma.actionItem.update({
    where: { id },
    data: {
      ...(data.task !== undefined && { task: data.task }),
      ...(data.owner !== undefined && { owner: data.owner }),
      ...(data.dueDate !== undefined && {
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      }),
      ...(data.done !== undefined && { done: data.done }),
      ...(data.tags !== undefined && { tags: data.tags ?? [] }),
    },
  });
}

/**
 * Delete an action item by ID.
 */
export async function deleteActionItem(id: string): Promise<void> {
  await prisma.actionItem.delete({ where: { id } });
}
