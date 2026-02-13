# MeetTrack — Meeting Action Items Tracker

A lightweight web application that converts meeting transcripts into structured action items using AI. Built as an interview assessment demonstrating full-stack engineering skills.

## 🚀 Live Demo

> _Add Vercel deployment URL here_

## ✨ Features

- **AI-Powered Extraction** — Paste a transcript, get structured action items automatically
- **CRUD Management** — Add, edit, delete, and toggle action items
- **Transcript History** — View last 5 processed transcripts
- **System Health** — Real-time status page for all services
- **Dual LLM Fallback** — Groq primary → OpenRouter secondary for reliability
- **Dark Mode** — Automatic via `prefers-color-scheme`

## 🏗️ Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | Next.js 16 (App Router), React 19, TypeScript |
| Styling    | Tailwind CSS v4 + CSS custom properties       |
| Backend    | Next.js API Routes (REST)                     |
| Database   | Neon PostgreSQL + Prisma ORM                  |
| LLM        | Groq API (primary), OpenRouter (fallback)     |
| Validation | Zod schemas                                   |
| Hosting    | Vercel                                        |

## 📐 Architecture

```
┌──────────────────────────────────────────────┐
│  Frontend (Next.js App Router)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │  Home    │ │ History  │ │  Status  │     │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘     │
│       │             │            │           │
├───────┴─────────────┴────────────┴───────────┤
│  API Routes (REST)                           │
│  /api/transcripts  /api/action-items         │
│  /api/history      /api/health/*             │
├──────────────────────────────────────────────┤
│  Service Layer                               │
│  TranscriptService  ActionItemService        │
│  LLMService (Groq → OpenRouter fallback)     │
├──────────────────────────────────────────────┤
│  Data Layer                                  │
│  Prisma ORM → Neon PostgreSQL                │
└──────────────────────────────────────────────┘
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- A [Groq](https://console.groq.com) API key (free tier works)
- Optionally, an [OpenRouter](https://openrouter.ai) API key for fallback

### Neon Database Setup

1. Go to [neon.tech](https://neon.tech) and sign up (free)
2. Click **"New Project"** → name it `meeting-tracker`
3. Select a region closest to your Vercel deployment
4. Copy the connection string (starts with `postgresql://`)
5. It will look like: `postgresql://user:password@ep-xxx.region.neon.tech/neondb?sslmode=require`

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd meeting-tracker

# Install dependencies
npm install

# Copy environment template and fill in your keys
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Push schema to Neon database
npx prisma db push

# Start dev server
npm run dev
```

### Environment Variables

| Variable             | Required | Description                        |
| -------------------- | -------- | ---------------------------------- |
| `DATABASE_URL`       | ✅       | Neon PostgreSQL connection string  |
| `GROQ_API_KEY`       | ✅       | Groq API key for LLM extraction    |
| `OPENROUTER_API_KEY` | ❌       | OpenRouter key (fallback provider) |

## 📡 API Endpoints

| Method   | Endpoint                | Purpose                         |
| -------- | ----------------------- | ------------------------------- |
| `POST`   | `/api/transcripts`      | Save transcript + extract items |
| `GET`    | `/api/transcripts/:id`  | Get transcript + items          |
| `GET`    | `/api/history`          | Last 5 transcripts              |
| `POST`   | `/api/action-items`     | Create item manually            |
| `PATCH`  | `/api/action-items/:id` | Update item fields              |
| `DELETE` | `/api/action-items/:id` | Delete item                     |
| `GET`    | `/api/health`           | Backend health                  |
| `GET`    | `/api/health/db`        | Database connectivity           |
| `GET`    | `/api/health/llm`       | LLM provider health             |

## 📁 Project Structure

```
├── app/
│   ├── api/           # 9 API route handlers
│   ├── history/       # History page
│   ├── status/        # Status page
│   ├── layout.tsx     # Root layout + nav
│   └── page.tsx       # Home page
├── components/        # 7 React components
├── lib/
│   ├── prisma.ts      # Prisma singleton
│   ├── llm.ts         # LLM service (dual provider)
│   ├── validations.ts # Zod schemas
│   └── services/      # Business logic layer
├── prisma/
│   └── schema.prisma  # Database schema
└── docs (root)
    ├── AI_NOTES.md
    ├── ABOUTME.md
    └── PROMPTS_USED.md
```

## 🚀 Deploy to Vercel

1. Push code to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Vercel auto-detects Next.js and deploys

## 📄 License

MIT
