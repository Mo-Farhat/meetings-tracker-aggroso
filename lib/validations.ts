import { z } from "zod";

// ── Transcript Input ──────────────────────────────────────────────
export const TranscriptInputSchema = z.object({
  text: z
    .string()
    .min(1, "Transcript cannot be empty")
    .max(50000, "Transcript is too long (max 50,000 characters)"),
});

export type TranscriptInput = z.infer<typeof TranscriptInputSchema>;

// ── LLM Extraction Response ──────────────────────────────────────
export const LLMActionItemSchema = z.object({
  task: z.string().min(1, "Task description is required"),
  owner: z.string().nullable().optional().default(null),
  dueDate: z.string().nullable().optional().default(null),
  tags: z.array(z.string()).nullable().optional().default([]),
});

export const LLMResponseSchema = z.array(LLMActionItemSchema).min(1);

export type LLMActionItem = z.infer<typeof LLMActionItemSchema>;

// ── Action Item Create ───────────────────────────────────────────
export const ActionItemCreateSchema = z.object({
  transcriptId: z.string().optional(),
  task: z.string().min(1, "Task description is required"),
  owner: z.string().nullable().optional().default(null),
  dueDate: z.string().nullable().optional().default(null),
  tags: z.array(z.string()).nullable().optional().default([]),
});

export type ActionItemCreate = z.infer<typeof ActionItemCreateSchema>;

// ── Action Item Update ───────────────────────────────────────────
export const ActionItemUpdateSchema = z.object({
  task: z.string().min(1).optional(),
  owner: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  done: z.boolean().optional(),
  tags: z.array(z.string()).nullable().optional(),
});

export type ActionItemUpdate = z.infer<typeof ActionItemUpdateSchema>;
