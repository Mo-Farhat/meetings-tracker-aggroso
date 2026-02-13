```md
# PRD — Meeting Action Items Tracker (Mini Workspace)

## 1. Overview

A lightweight web application that allows users to paste a meeting transcript and automatically extract actionable tasks using an LLM. Users can then edit, manage, and track these action items. The system also maintains a short history of recently processed transcripts and provides a status page for system health checks.

The goal is to demonstrate practical full-stack engineering skills including UI/UX, backend logic, database usage, LLM integration, hosting, and documentation discipline.

---

## 2. Objectives

- Convert unstructured meeting transcripts into structured action items.
- Provide simple task management functionality.
- Maintain minimal transcript history.
- Demonstrate reliable hosting and deployment.
- Showcase secure API usage and environment variable management.
- Provide clear developer documentation and transparency of AI usage.

---

## 3. Target Users

- Recruiters / Reviewers evaluating engineering skills.
- Professionals wanting quick action item extraction from meetings.
- Developers assessing LLM integration workflows.

---

## 4. Scope

### In Scope

- Transcript input and LLM extraction
- CRUD operations for action items
- Mark tasks as complete
- Transcript history (last 5)
- System status/health page
- Basic input validation
- Deployment and hosting
- Documentation files

### Out of Scope

- User authentication
- Multi-user collaboration
- Notifications
- Advanced analytics
- File uploads (text only)
- Role-based permissions

---

## 5. Functional Requirements

### 5.1 Transcript Processing

- User pastes text transcript.
- System sends transcript to LLM API.
- LLM returns structured JSON containing:
  - Task
  - Owner (optional)
  - Due date (optional)
  - Tags (optional)
- System validates JSON.
- Transcript saved in DB.
- Old transcripts pruned to keep only last 5.

### 5.2 Action Item Management

- Add action item manually.
- Edit task fields.
- Delete action item.
- Toggle done/undone.
- Filter by status (Open / Completed).

### 5.3 Transcript History

- Display last 5 transcripts.
- Show date + preview snippet.
- Clicking transcript loads its associated tasks.

### 5.4 Status Page

- Backend health check.
- Database connectivity check.
- LLM API connectivity check.
- Results cached for short duration to reduce token usage.

### 5.5 Input Validation

- Prevent empty transcript submissions.
- Handle malformed LLM JSON gracefully.
- Display friendly error messages.

---

## 6. Non-Functional Requirements

| Requirement     | Description                               |
| --------------- | ----------------------------------------- |
| Performance     | LLM extraction under ~5 seconds           |
| Availability    | App remains live post-submission          |
| Security        | API keys stored in environment variables  |
| Scalability     | DB supports moderate growth               |
| Reliability     | Graceful fallback if LLM fails            |
| Maintainability | Clear project structure and documentation |

---

## 7. Technical Architecture

### Frontend

- **Next.js (App Router)**
- React + TypeScript
- Minimal UI styling (Tailwind or CSS modules)

### Backend

- **Next.js API Routes**
- REST-style endpoints

### Database

- **Neon PostgreSQL**
- ORM: Prisma

### LLM Provider

- Primary: **Groq API**
- Fallback: **OpenRouter**
- Structured JSON prompting

### Hosting

- **Vercel** for frontend + backend
- **Neon** for database

---

## 8. Data Models

### Transcript
```

id: string
text: string
createdAt: datetime

```

### ActionItem
```

id: string
transcriptId: string
task: string
owner: string | null
dueDate: datetime | null
done: boolean
tags: string[] | null
createdAt: datetime

```

---

## 9. API Endpoints

| Method | Endpoint | Purpose |
|-------|--------|--------|
| POST | /api/transcripts | Save transcript + extract items |
| GET | /api/history | Fetch last 5 transcripts |
| GET | /api/transcripts/:id | Retrieve transcript + items |
| POST | /api/action-items | Create item |
| PATCH | /api/action-items/:id | Update item |
| DELETE | /api/action-items/:id | Delete item |
| GET | /api/health | Backend check |
| GET | /api/health/db | Database check |
| GET | /api/health/llm | LLM check |

---

## 10. User Flow

1. User lands on Home Page.
2. Pastes transcript.
3. Clicks “Extract Action Items”.
4. LLM processes and returns tasks.
5. User edits / adds / deletes tasks.
6. User marks items done.
7. User visits History page if needed.
8. Reviewer visits Status page to verify system health.

---

## 11. UI Pages

### Home Page
- Transcript textarea
- Extract button
- Editable action item list
- Filters (Open / Done)

### History Page
- List of recent transcripts
- Snippet preview
- Click to open tasks

### Status Page
- Backend status
- DB status
- LLM status

---

## 12. Documentation Deliverables

| File | Purpose |
|------|--------|
| README.md | Setup instructions and features |
| AI_NOTES.md | AI usage transparency |
| ABOUTME.md | Developer profile/resume |
| PROMPTS_USED.md | Prompt history |

---

## 13. Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| LLM JSON failure | Zod validation + retry fallback |
| Rate limits | Secondary provider fallback |
| Hosting downtime | Vercel reliability + monitoring |
| Token overuse | Cache health checks |
| Deadline pressure | Scope strictly limited |

---

## 14. Success Criteria
- Live shareable HTTPS link.
- Working transcript → action item extraction.
- CRUD functionality verified.
- Last 5 transcript history working.
- Status page operational.
- Documentation complete.
- Secure environment variable usage.
- App remains live during review.

---

## 15. Future Enhancements (Optional)
- Authentication
- Multi-workspace support
- File upload transcripts
- Export tasks to CSV
- Email reminders
- Tag analytics

---

**End of PRD**
```
