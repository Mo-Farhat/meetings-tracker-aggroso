# AI Usage Notes

This document provides transparency on how AI tools were used during development.

## Tools Used

### Coding Assistant

- **Tool**: Gemini-based coding assistant (Antigravity)
- **Usage**: Architecture planning, code generation, debugging, documentation
- **Scope**: All aspects of implementation including service layer design, API routes, component structure, and CSS design system

### LLM Integration

- **Groq API** (primary) — Llama 3.3 70B Versatile model for meeting transcript extraction
- **OpenRouter** (fallback) — Llama 3.3 70B Instruct for reliability when primary is unavailable

## AI-Generated Components

- Initial project structure and architecture
- Prisma schema design
- LLM extraction prompt engineering
- Zod validation schemas
- React component implementations
- CSS design system
- API route handlers
- Documentation files

## Human Decisions

- Architecture approach (service layer pattern)
- Technology choices (Next.js, Prisma, Neon, Groq)
- UI/UX design direction
- LLM fallback strategy
- Database schema relationships
- Error handling strategies

## AI Prompt Strategy

Structured JSON prompting with explicit schema requirements ensures reliable LLM output. See `PROMPTS_USED.md` for the specific prompts used for action item extraction.
