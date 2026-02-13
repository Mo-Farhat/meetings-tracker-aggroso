import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";
import { extractActionItems } from "../llm";
import type { LLMActionItem } from "../validations";

const MAX_HISTORY = 5;

// ── Types ────────────────────────────────────────────────────────
export interface TranscriptWithItems {
  id: string;
  text: string;
  createdAt: Date;
  actionItems: {
    id: string;
    task: string;
    owner: string | null;
    dueDate: Date | null;
    done: boolean;
    tags: string[];
    createdAt: Date;
  }[];
}

export interface TranscriptSummary {
  id: string;
  snippet: string;
  createdAt: Date;
  itemCount: number;
}

// ── Service Functions ────────────────────────────────────────────

/**
 * Process a transcript: send to LLM, save transcript + items, prune old entries.
 */
export async function processTranscript(text: string): Promise<TranscriptWithItems> {
  // 1. Extract action items via LLM
  const { items } = await extractActionItems(text);

  // 2. Save transcript + items in a transaction
  const transcript = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const created = await tx.transcript.create({
      data: {
        text,
        actionItems: {
          create: items.map((item: LLMActionItem) => ({
            task: item.task,
            owner: item.owner ?? null,
            dueDate: item.dueDate ? new Date(item.dueDate) : null,
            tags: item.tags ?? [],
          })),
        },
      },
      include: { actionItems: true },
    });

    // 3. Prune old transcripts beyond MAX_HISTORY
    const allTranscripts = await tx.transcript.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (allTranscripts.length > MAX_HISTORY) {
      const idsToDelete = allTranscripts.slice(MAX_HISTORY).map((t) => t.id);
      await tx.transcript.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    }

    return created;
  });

  return transcript;
}

/**
 * Get a transcript by ID with all its action items.
 */
export async function getTranscriptById(id: string): Promise<TranscriptWithItems | null> {
  return prisma.transcript.findUnique({
    where: { id },
    include: {
      actionItems: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

/**
 * Get the last N transcripts with snippet previews.
 */
export async function getRecentTranscripts(): Promise<TranscriptSummary[]> {
  const transcripts = await prisma.transcript.findMany({
    orderBy: { createdAt: "desc" },
    take: MAX_HISTORY,
    include: {
      _count: { select: { actionItems: true } },
    },
  });

  return transcripts.map((t) => ({
    id: t.id,
    snippet: t.text.slice(0, 150) + (t.text.length > 150 ? "…" : ""),
    createdAt: t.createdAt,
    itemCount: t._count.actionItems,
  }));
}
