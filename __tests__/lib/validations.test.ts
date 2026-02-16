import { describe, it, expect } from "vitest";
import {
  TranscriptInputSchema,
  LLMActionItemSchema,
  LLMResponseSchema,
  ActionItemCreateSchema,
  ActionItemUpdateSchema,
} from "@/lib/validations";

// ── TranscriptInputSchema ────────────────────────────────────────

describe("TranscriptInputSchema", () => {
  it("rejects empty string", () => {
    const result = TranscriptInputSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing text field", () => {
    const result = TranscriptInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid transcript", () => {
    const result = TranscriptInputSchema.safeParse({ text: "Hello team, let's discuss..." });
    expect(result.success).toBe(true);
  });

  it("rejects transcript exceeding 50,000 characters", () => {
    const result = TranscriptInputSchema.safeParse({ text: "a".repeat(50001) });
    expect(result.success).toBe(false);
  });

  it("accepts transcript at exactly 50,000 characters", () => {
    const result = TranscriptInputSchema.safeParse({ text: "a".repeat(50000) });
    expect(result.success).toBe(true);
  });
});

// ── LLMActionItemSchema ──────────────────────────────────────────

describe("LLMActionItemSchema", () => {
  it("requires task field", () => {
    const result = LLMActionItemSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty task string", () => {
    const result = LLMActionItemSchema.safeParse({ task: "" });
    expect(result.success).toBe(false);
  });

  it("accepts minimal valid item (task only)", () => {
    const result = LLMActionItemSchema.safeParse({ task: "Do something" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.owner).toBeNull();
      expect(result.data.dueDate).toBeNull();
      expect(result.data.tags).toEqual([]);
    }
  });

  it("accepts fully populated item", () => {
    const result = LLMActionItemSchema.safeParse({
      task: "Review PR",
      owner: "Alice",
      dueDate: "2026-03-01",
      tags: ["urgent", "review"],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.owner).toBe("Alice");
      expect(result.data.dueDate).toBe("2026-03-01");
      expect(result.data.tags).toEqual(["urgent", "review"]);
    }
  });

  it("accepts null owner and dueDate", () => {
    const result = LLMActionItemSchema.safeParse({
      task: "Fix bug",
      owner: null,
      dueDate: null,
      tags: [],
    });
    expect(result.success).toBe(true);
  });
});

// ── LLMResponseSchema ────────────────────────────────────────────

describe("LLMResponseSchema", () => {
  it("requires at least one item", () => {
    const result = LLMResponseSchema.safeParse([]);
    expect(result.success).toBe(false);
  });

  it("accepts array with one valid item", () => {
    const result = LLMResponseSchema.safeParse([{ task: "Deploy app" }]);
    expect(result.success).toBe(true);
  });

  it("rejects non-array input", () => {
    const result = LLMResponseSchema.safeParse({ task: "Not an array" });
    expect(result.success).toBe(false);
  });

  it("accepts multiple valid items", () => {
    const result = LLMResponseSchema.safeParse([
      { task: "Task 1", owner: "Alice" },
      { task: "Task 2", tags: ["follow-up"] },
      { task: "Task 3", dueDate: "2026-04-01" },
    ]);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(3);
    }
  });
});

// ── ActionItemCreateSchema ───────────────────────────────────────

describe("ActionItemCreateSchema", () => {
  it("requires task field", () => {
    const result = ActionItemCreateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts task with optional transcriptId", () => {
    const result = ActionItemCreateSchema.safeParse({
      task: "Manual item",
      transcriptId: "abc-123",
    });
    expect(result.success).toBe(true);
  });

  it("defaults optional fields correctly", () => {
    const result = ActionItemCreateSchema.safeParse({ task: "Just a task" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.owner).toBeNull();
      expect(result.data.dueDate).toBeNull();
      expect(result.data.tags).toEqual([]);
    }
  });
});

// ── ActionItemUpdateSchema ───────────────────────────────────────

describe("ActionItemUpdateSchema", () => {
  it("accepts empty object (no fields to update)", () => {
    const result = ActionItemUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts partial update (done only)", () => {
    const result = ActionItemUpdateSchema.safeParse({ done: true });
    expect(result.success).toBe(true);
  });

  it("accepts partial update (task only)", () => {
    const result = ActionItemUpdateSchema.safeParse({ task: "Updated task" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid done type", () => {
    const result = ActionItemUpdateSchema.safeParse({ done: "yes" });
    expect(result.success).toBe(false);
  });

  it("accepts null owner (clearing owner)", () => {
    const result = ActionItemUpdateSchema.safeParse({ owner: null });
    expect(result.success).toBe(true);
  });
});
