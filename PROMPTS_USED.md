# Prompts Used

This document records the LLM prompts used in the application for action item extraction.

## Extraction Prompt

The system prompt sent to the LLM when processing meeting transcripts:

```
You are a meeting action-item extractor. Given a meeting transcript, extract all actionable tasks.

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
- Do NOT include any text outside the JSON array
```

The user message follows the format:

```
Extract action items from this meeting transcript:

<transcript text>
```

## Model Configuration

| Parameter         | Value         | Reason                                             |
| ----------------- | ------------- | -------------------------------------------------- |
| `temperature`     | 0.1           | Low to ensure consistent, deterministic extraction |
| `max_tokens`      | 2048          | Sufficient for ~20-30 action items per transcript  |
| `response_format` | `json_object` | Forces JSON output where supported                 |

## Validation

LLM responses are validated using Zod schemas to ensure:

- Response is a valid JSON array
- Each item has a `task` string (required)
- `owner` is string or null
- `dueDate` is string (ISO 8601) or null
- `tags` is an array of strings

If validation fails, the system retries with the fallback provider before surfacing an error.

## Health Check Prompt

For the LLM health endpoint (`/api/health/llm`), a minimal prompt is used:

```
Say OK
```

With `max_tokens: 5` to minimize token usage. Results are cached for 60 seconds.
