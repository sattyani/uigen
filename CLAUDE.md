# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

Use comments sparingly. Only comment complex code.

## Project Overview

UIGen is an AI-powered React component generator. Users describe components in a chat interface; Claude generates code using tool calls that manipulate a virtual (in-memory) file system; a live iframe preview renders the result. Works without an API key (returns static mock code instead).

## Commands

```bash
npm run setup       # First-time setup: install deps + generate Prisma client + run migrations
npm run dev         # Start dev server with Turbopack on http://localhost:3000
npm run build       # Production build
npm run lint        # ESLint
npm run test        # Vitest (unit + component tests)
npm run db:reset    # Force-reset SQLite database and re-run migrations
```

Single test file: `npx vitest run src/path/to/__tests__/file.test.ts`

Environment: add `ANTHROPIC_API_KEY=sk-ant-...` to `.env` for real AI generation.

## Architecture

### Data Flow

```
Chat input → POST /api/chat (streaming) → Claude + tools → Virtual FS updated
                                                               ↓
                                               FileSystemContext → PreviewFrame + CodeEditor
```

### Key Layers

**`src/app/api/chat/route.ts`** — Streaming AI endpoint. Calls Claude via Vercel AI SDK with two tools: `str_replace_editor` (create/edit files) and `file_manager` (rename/delete). The system prompt lives in `src/lib/prompts/generation.tsx`. Anthropic prompt caching is applied to the system prompt.

**`src/lib/file-system.ts`** — In-memory virtual file system class (tree structure, no disk writes). Methods: `createFile`, `readFile`, `updateFile`, `deleteFile`, `rename`, `serialize`/`deserializeFromNodes`. Serialized to JSON for database storage (`Project.data` column).

**`src/lib/contexts/file-system-context.tsx`** — React Context wrapping the virtual FS. Also processes AI tool call results and fires the `refreshTrigger` that causes the preview to re-render.

**`src/lib/contexts/chat-context.tsx`** — Wraps Vercel AI SDK's `useChat`. Manages message history and submits to `/api/chat`.

**`src/components/preview/PreviewFrame.tsx`** — Renders the live preview in a sandboxed iframe. On each `refreshTrigger`:
1. Finds entry point (`/App.jsx`, `/App.tsx`, etc.)
2. Uses `src/lib/transform/jsx-transformer.ts` (Babel standalone) to transpile JSX/TS and build an ES module import map (React/React-DOM from esm.sh, local files as blob URLs)
3. Injects the generated HTML into the iframe

**`src/lib/tools/`** — Zod schemas defining the two AI tools (`str-replace.ts`, `file-manager.ts`) consumed by the chat route.

**`src/actions/`** — Next.js server actions for auth (`index.ts`) and project CRUD (`create-project.ts`, `get-project.ts`, `get-projects.ts`).

**`src/lib/auth.ts`** — JWT auth (jose library). Tokens stored in HttpOnly cookies, 7-day expiry. Passwords hashed with bcrypt (10 rounds).

### Database

Schema is defined in `prisma/schema.prisma` — reference it whenever you need to understand the structure of data stored in the database.

Prisma with SQLite (`prisma/dev.db`). Two models:
- `User` — email + bcrypt password
- `Project` — `messages` (JSON chat history) + `data` (serialized virtual FS), optional `userId`

### UI Structure

- `src/app/main-content.tsx` — Root layout using `react-resizable-panels` (chat | editor/preview)
- `src/components/chat/` — Chat UI components
- `src/components/editor/` — Monaco editor + file tree
- `src/components/preview/` — Iframe preview
- `src/components/ui/` — shadcn/Radix UI primitives

### Path Alias

`@/*` maps to `src/*`.

### Testing

Tests live in `__tests__/` directories colocated with source. Uses Vitest + jsdom + @testing-library/react. Component tests use `jsdom` environment; no special setup file required.
