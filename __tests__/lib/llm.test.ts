import { describe, it, expect } from "vitest";
import { parseLLMResponse } from "@/lib/llm";

// ── Valid JSON Parsing ───────────────────────────────────────────

describe("parseLLMResponse", () => {
  it("parses a valid JSON array", () => {
    const input = JSON.stringify([
      { task: "Review PR", owner: "Alice", dueDate: "2026-03-01", tags: ["review"] },
      { task: "Deploy app", owner: null, dueDate: null, tags: [] },
    ]);
    const result = parseLLMResponse(input);
    expect(result).toHaveLength(2);
    expect(result[0].task).toBe("Review PR");
    expect(result[1].owner).toBeNull();
  });

  it("parses minimal items (task only)", () => {
    const input = JSON.stringify([{ task: "Do something" }]);
    const result = parseLLMResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0].task).toBe("Do something");
    expect(result[0].owner).toBeNull();
    expect(result[0].tags).toEqual([]);
  });

  // ── Markdown Code Fence Handling ─────────────────────────────

  it("strips markdown code fences (```json)", () => {
    const input = '```json\n[{"task": "Fix bug"}]\n```';
    const result = parseLLMResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0].task).toBe("Fix bug");
  });

  it("strips markdown code fences (``` without language)", () => {
    const input = '```\n[{"task": "Fix bug"}]\n```';
    const result = parseLLMResponse(input);
    expect(result).toHaveLength(1);
  });

  // ── Object-Wrapped Response ──────────────────────────────────

  it('handles object-wrapped response { "items": [...] }', () => {
    const input = JSON.stringify({
      items: [{ task: "Wrapped item", owner: "Bob" }],
    });
    const result = parseLLMResponse(input);
    expect(result).toHaveLength(1);
    expect(result[0].task).toBe("Wrapped item");
  });

  it('handles object-wrapped response { "action_items": [...] }', () => {
    const input = JSON.stringify({
      action_items: [{ task: "Another wrapped" }],
    });
    const result = parseLLMResponse(input);
    expect(result).toHaveLength(1);
  });

  // ── Error Cases ──────────────────────────────────────────────

  it("throws on invalid JSON", () => {
    expect(() => parseLLMResponse("not json at all")).toThrow("Invalid JSON from LLM");
  });

  it("throws on empty array (min 1 item required)", () => {
    expect(() => parseLLMResponse("[]")).toThrow("validation failed");
  });

  it("throws on array with invalid items (missing task)", () => {
    const input = JSON.stringify([{ owner: "Alice" }]);
    expect(() => parseLLMResponse(input)).toThrow("validation failed");
  });

  it("throws on non-object/non-array JSON", () => {
    expect(() => parseLLMResponse('"just a string"')).toThrow("validation failed");
  });

  // ── Whitespace Handling ──────────────────────────────────────

  it("handles leading/trailing whitespace", () => {
    const input = `  \n  [{"task": "Whitespace test"}]  \n  `;
    const result = parseLLMResponse(input);
    expect(result).toHaveLength(1);
  });
});
