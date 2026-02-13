import { LLMResponseSchema, type LLMActionItem } from "./validations";

// ── Types ────────────────────────────────────────────────────────
interface LLMProvider {
  name: string;
  url: string;
  model: string;
  apiKeyEnv: string;
  buildHeaders: (apiKey: string) => Record<string, string>;
}

// ── Provider Config ──────────────────────────────────────────────
const PROVIDERS: LLMProvider[] = [
  {
    name: "Groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    apiKeyEnv: "GROQ_API_KEY",
    buildHeaders: (key) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    }),
  },
  {
    name: "OpenRouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: "meta-llama/llama-3.3-70b-instruct",
    apiKeyEnv: "OPENROUTER_API_KEY",
    buildHeaders: (key) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    }),
  },
];

// ── Extraction Prompt ────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a meeting action-item extractor. Given a meeting transcript, extract all actionable tasks.

Return ONLY a valid JSON array. Each object must have:
- "task" (string, required): A clear description of the action item
- "owner" (string or null): The person responsible, if mentioned
- "dueDate" (string or null): The due date in ISO 8601 format (YYYY-MM-DD), if mentioned
- "tags" (array of strings): Relevant tags like "urgent", "follow-up", "review", etc.

Rules:
- Extract EVERY actionable item, even implicit ones
- If no owner is mentioned, set owner to null
- If no due date is mentioned, set dueDate to null
- If no tags are relevant, return an empty array for tags
- Do NOT wrap in markdown code blocks
- Do NOT include any text outside the JSON array`;

// ── Core Functions ───────────────────────────────────────────────

/**
 * Extract action items from a transcript using LLM with fallback.
 * Tries each provider in order until one succeeds.
 */
export async function extractActionItems(
  transcript: string
): Promise<{ items: LLMActionItem[]; provider: string }> {
  const errors: string[] = [];

  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.apiKeyEnv];
    if (!apiKey) {
      errors.push(`${provider.name}: API key not configured`);
      continue;
    }

    try {
      const items = await callProvider(provider, apiKey, transcript);
      return { items, provider: provider.name };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push(`${provider.name}: ${message}`);
    }
  }

  throw new Error(
    `All LLM providers failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`
  );
}

/**
 * Check if at least one LLM provider is reachable.
 */
export async function checkLLMHealth(): Promise<{
  status: "ok" | "degraded" | "error";
  provider: string | null;
  latencyMs: number;
}> {
  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.apiKeyEnv];
    if (!apiKey) continue;

    const start = Date.now();
    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: provider.buildHeaders(apiKey),
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: "user", content: "Say OK" }],
          max_tokens: 5,
        }),
      });

      const latencyMs = Date.now() - start;
      if (response.ok) {
        return { status: "ok", provider: provider.name, latencyMs };
      }

      // If primary fails, try next
    } catch {
      // If primary fails, try next
    }
  }

  return { status: "error", provider: null, latencyMs: 0 };
}

// ── Internal Helpers ─────────────────────────────────────────────

async function callProvider(
  provider: LLMProvider,
  apiKey: string,
  transcript: string
): Promise<LLMActionItem[]> {
  const response = await fetch(provider.url, {
    method: "POST",
    headers: provider.buildHeaders(apiKey),
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Extract action items from this meeting transcript:\n\n${transcript}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from LLM");
  }

  return parseLLMResponse(content);
}

function parseLLMResponse(content: string): LLMActionItem[] {
  // Strip markdown code fences if the LLM wraps them
  let cleaned = content.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Invalid JSON from LLM: ${cleaned.slice(0, 200)}`);
  }

  // Handle both { "items": [...] } and [...] formats
  if (
    parsed &&
    typeof parsed === "object" &&
    !Array.isArray(parsed)
  ) {
    const obj = parsed as Record<string, unknown>;
    // Find the first array property
    const arrayValue = Object.values(obj).find(Array.isArray);
    if (arrayValue) {
      parsed = arrayValue;
    }
  }

  const result = LLMResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `LLM response validation failed: ${result.error.issues.map((i) => i.message).join(", ")}`
    );
  }

  return result.data;
}
