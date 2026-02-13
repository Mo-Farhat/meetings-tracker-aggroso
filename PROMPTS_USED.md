# Prompts Used

This document records the prompts used during development of the Meeting Action Items Tracker.

---

## Phase 1: Planning & Architecture (PRD Generation)

Prompts used with an AI assistant to evaluate tech stack options and generate the PRD.

**Prompt 1 — Tech Stack Exploration:**

> Next.js for the frontend for sure, but DB is interesting because I want to host it appropriately without stressing too much so preferably serverless. I could also potentially use a VPS from DigitalOcean If so then I would be able to use Express and Next.js, and SQLite or a simple PostgreSQL would be fine, no But then what about the shareable link it wouldn't be https that's not ideal

**Prompt 2 — Architecture Decision:**

> Vercel + Neon seems more appropriate I think, as it's serverless and doesn't require separate backend hosting.

**Outcome:** Settled on Next.js (App Router) + Vercel for hosting, Neon PostgreSQL for serverless database, and Prisma as the ORM. This avoids managing a separate VPS while still getting a shareable HTTPS link via Vercel's deployment.

---

## Phase 2: Development (Coding Assistant)

Prompts used with an AI coding assistant (Antigravity) to build the application.

1. "generate a prd.md file for this project nextjs for the frontend, neondb for the database, prisma as the orm, and zod for validations"
2. "Index the PRD file and understand the PRD don't implement yet, we should think scalability, reliability, and keep the architecture and system design understandable (plan mode)."
3. "On the frontend remove any emojis and replace it with icons instead."
4. "Add a status page to the application that shows the status of the database and the LLM provider"
5. "Add a health check endpoint to the application that shows the status of the database and the LLM provider"

---

## Phase 3: In-App LLM Prompts

The system prompt used at runtime for extracting action items from meeting transcripts:

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

### Model Configuration

| Parameter         | Value         | Reason                                             |
| ----------------- | ------------- | -------------------------------------------------- |
| `temperature`     | 0.1           | Low to ensure consistent, deterministic extraction |
| `max_tokens`      | 2048          | Sufficient for ~20-30 action items per transcript  |
| `response_format` | `json_object` | Forces JSON output where supported                 |

### Health Check Prompt

For the LLM health endpoint (`/api/health/llm`), a minimal prompt is used:

```
Say OK
```

With `max_tokens: 5` to minimize token usage. Results are cached for 60 seconds.
