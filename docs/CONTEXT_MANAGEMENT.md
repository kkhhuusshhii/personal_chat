# Context Management Approach

Code: [`lib/context-manager.js`](../lib/context-manager.js), wired up in
[`components/ChatApp.jsx`](../components/ChatApp.jsx) and
[`app/api/summarize/route.js`](../app/api/summarize/route.js).

## The problem

Two things need to both be true for a good long-conversation experience:

1. Token usage (and therefore latency + cost) can't grow unboundedly as a
   conversation gets long.
2. The persona still needs to "remember" what's already been said — a
   mentor who forgets your skill level or repeats advice after 20 messages
   feels broken, not in-character.

A naive approach picks one of these at the other's expense: send the whole
history forever (bad #1), or hard-truncate to the last N messages (bad #2).
This project does a small hybrid of both.

## Per-persona threads

Switching between Hitesh and Piyush does **not** share history between
them — each persona keeps its own independent thread (own messages, own
memory note). This matches the mental model of "two different mentors,"
avoids one persona's advice leaking into the other's system prompt context,
and makes the "switch personas mid-task" flow predictable: you're pausing
one conversation and resuming (or starting) another, not handing the whole
transcript to a different voice.

## The hybrid strategy

1. **Full history stays client-side, always.** Nothing the user has seen
   is ever deleted from the UI. Truncation only affects what gets sent to
   the model on the *next* call.

2. **Verbatim window.** Every API call sends the persona's system prompt
   plus the most recent `MAX_VERBATIM_MESSAGES` (16, ≈ 8 user/assistant
   turns) messages in full. This keeps recent, high-resolution context —
   the stuff most likely to matter for the immediate reply — completely
   intact.

3. **Rolling memory note.** Once a thread grows past
   `SUMMARIZE_TRIGGER` (24 messages), the messages that have just fallen
   out of the verbatim window are sent to a cheap, separate summarization
   call (`/api/summarize`) that condenses them into a short prose note:
   who the learner is / their goals, what's already been explained, and
   any recommendations already made. That note is folded into the *next*
   summarization call too (`previousNote`), so it keeps compounding
   instead of being thrown away — a form of incremental summarization
   rather than re-summarizing the whole history every time.

4. **The memory note rides in the system prompt**, appended after the
   persona's own instructions (see `buildRequestPayload` in
   `context-manager.js`), clearly labeled `CONVERSATION MEMORY` so the
   model treats it as background, not as something to quote back to the
   user.

This means token cost per turn is bounded by roughly
`system prompt + memory note + 16 messages`, regardless of how long the
conversation actually runs, while the model still has a compressed sense of
everything that came before.

## Why not X instead?

- **Just use a model with a huge context window and send everything.**
  Works for a while, but cost and latency both scale with conversation
  length, and very long raw histories tend to dilute instruction
  adherence (the persona rules at the top get "crowded out" by transcript
  bulk). The summary approach keeps the signal dense.
- **Vector-store retrieval (RAG) over the full history.** A reasonable
  next step for very long-lived, multi-session relationships with a
  learner, but it's overkill for a single chat session and adds a real
  infrastructure dependency (embeddings + a vector DB) this project didn't
  need for the assignment's scope. It's a natural extension point — see
  below.
- **Summarize on every single turn.** Simpler code, but doubles the number
  of model calls per message for no benefit once the conversation is
  short. Triggering only past `SUMMARIZE_TRIGGER` avoids that cost on the
  common case (most demo conversations never get that long).

## Extension points

- **Cross-session memory:** persist `messages` + `memoryNote` per persona
  per user (e.g. in a database keyed by a user id/session cookie) instead
  of React state, so a learner's context survives a page refresh or a
  return visit.
- **Retrieval over your own persona research notes:** if you deepen the
  research in `PERSONA_RESEARCH.md`, you could embed those notes and pull
  the top few relevant snippets into the system prompt per question,
  instead of relying only on the static style profile.
- **Token-aware windowing:** the current window is message-count-based for
  simplicity; swapping to a token-count budget (using the model's tokenizer)
  would be a more precise version of the same idea.
