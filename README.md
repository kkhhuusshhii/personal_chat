# Chai ya Code? — AI Chat with Hitesh Choudhary / Piyush Garg Personas

A Next.js chat app that simulates conversations with the teaching personas
of **Hitesh Choudhary** (Chai aur Code) and **Piyush Garg**, powered by the
Google Gemini API (free tier). Pick a mentor, ask a coding/career question,
switch personas any time — each keeps its own conversation thread and
memory.

This is an **AI simulation built from publicly available style patterns**,
not the real people, and the app says so if asked. See
[`docs/PERSONA_RESEARCH.md`](./docs/PERSONA_RESEARCH.md) for details and
sourcing.

## What's in this repo

```
persona-chat/
├── app/
│   ├── api/chat/route.js        # Streaming chat endpoint (Gemini API)
│   ├── api/summarize/route.js   # Rolling-summary endpoint for long chats
│   ├── layout.js, page.js, globals.css
├── components/
│   ├── ChatApp.jsx              # Orchestrator: threads, streaming, state
│   ├── PersonaSwitcher.jsx      # Tab UI to switch Hitesh ⇄ Piyush
│   ├── MessageBubble.jsx        # Markdown-rendered chat bubble
│   └── ChatComposer.jsx         # Input box + suggestion chips
├── lib/
│   ├── personas.js              # Both personas' system prompts + metadata
│   └── context-manager.js       # Sliding-window + summary context logic
├── docs/
│   ├── PERSONA_RESEARCH.md      # How persona data was collected
│   ├── PROMPT_ENGINEERING.md    # Prompt design strategy
│   ├── CONTEXT_MANAGEMENT.md    # Long-conversation context strategy
│   └── SAMPLE_CONVERSATIONS.md  # Example exchanges (see note inside)
└── .env.example
```

## Tech stack

- **Next.js (App Router)** — single deployable app, frontend + API routes.
- **Google Gemini API** (`@google/genai`) — `gemini-2.5-flash` by default
  (covered by Gemini's free tier), streamed token-by-token to the UI.
- **Tailwind CSS v4** — styling.
- **react-markdown + remark-gfm** — renders formatted answers/code blocks.
- Self-hosted fonts via `@fontsource` (no external font CDN calls at
  runtime).

## Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- A Gemini API key (free) — create one at
  [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
  No credit card needed; Gemini's free tier covers the default model used
  here (`gemini-2.5-flash`), within Google's published rate limits.

## Run it locally

```bash
# 1. Install dependencies
npm install

# 2. Add your API key
cp .env.example .env.local
# then edit .env.local and paste your key:
# GEMINI_API_KEY=your-gemini-key-here

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pick a persona and
start chatting.

To build and run a production server locally:

```bash
npm run build
npm run start
```

## Configuration

All config is via environment variables (see `.env.example`):

| Variable            | Required | Default            | Notes                                   |
|---------------------|----------|--------------------|------------------------------------------|
| `GEMINI_API_KEY`    | Yes      | —                  | Server-side only, never exposed to the client |
| `GEMINI_MODEL`      | No       | `gemini-2.5-flash` | Any current Gemini model ID works; check Google's free-tier limits per model |

### About the free tier

Gemini's free tier (via [Google AI Studio](https://aistudio.google.com/app/apikey))
does not require a credit card and currently covers Flash-family models
like `gemini-2.5-flash`, with per-minute and per-day request limits that
Google adjusts periodically — check the
[Gemini API rate limits page](https://ai.google.dev/gemini-api/docs/rate-limits)
for current numbers before relying on it for anything beyond development/
demo use. If you hit a `429` (rate limited) response, wait a few seconds
and retry, or lower how quickly you're sending messages.

## Deploying (Vercel is the easiest path)

1. Push this repo to your own GitHub account (see below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. In the project's **Environment Variables** settings, add
   `GEMINI_API_KEY` (and optionally `GEMINI_MODEL`).
4. Deploy. Vercel auto-detects Next.js — no extra config needed.

Any other Node-compatible host (Render, Railway, Fly.io, a plain VM) works
the same way: set the env vars, run `npm run build && npm run start`.

## Publishing to your own GitHub repo

This project was generated for you locally, so it isn't pushed anywhere
yet. To publish it:

```bash
cd persona-chat
git init
git add .
git commit -m "Initial commit: dual-persona AI chat"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

(Create the empty repo on GitHub first, or use `gh repo create` if you have
the GitHub CLI installed.)

## How persona switching works

Each persona has its own independent conversation thread (own messages, own
rolling memory note — see `docs/CONTEXT_MANAGEMENT.md`). Switching tabs
pauses one thread and resumes the other; nothing is lost, and the two
personas never see each other's conversation.

## Extending it

- **Add a third persona:** add an entry to `PERSONAS` in `lib/personas.js`
  following the existing shape — the UI and API routes are already
  persona-agnostic.
- **Swap the LLM provider:** the only provider-specific code lives in
  `app/api/chat/route.js` and `app/api/summarize/route.js`; swap the
  `@google/genai` calls for another SDK (e.g. `@anthropic-ai/sdk` for
  Claude) and the rest of the app is unaffected.
- **Persist conversations across page reloads:** replace the in-memory
  `useState` thread store in `components/ChatApp.jsx` with a fetch
  to/from a database, keyed by persona + session/user id.

## Notes on scope and honesty

- This project **simulates a public teaching style**, not the real
  individuals — the system prompts are built from publicly documented
  patterns (channel descriptions, course pages, interviews), not private
  information, and the model is instructed to say so if directly asked
  whether it's the real person. See `docs/PERSONA_RESEARCH.md`.
- `docs/SAMPLE_CONVERSATIONS.md` ships with hand-written illustrative
  examples. **Replace them with real transcripts from your own deployed
  instance before submitting** — that's both more convincing and an easy
  way to sanity-check your persona tuning.
