/**
 * Context management.
 *
 * Strategy (see /docs/CONTEXT_MANAGEMENT.md for the full write-up):
 *
 * 1. Every message the user has sent/received in the current persona thread
 *    is kept in the client for display — nothing is ever deleted from what
 *    the user sees.
 * 2. Before each API call we decide what actually gets sent to the model:
 *      - The persona's system prompt (always).
 *      - A rolling "memory note" (optional) — a short summary of anything
 *        older than the recent window, so long conversations don't silently
 *        forget earlier context.
 *      - The most recent MAX_VERBATIM_MESSAGES messages, sent in full.
 * 3. When the conversation grows past the window, the oldest messages that
 *    just fell out of the window get folded into the memory note via one
 *    extra summarization call, instead of being dropped outright.
 *
 * This keeps token usage bounded on long chats while still letting the
 * persona "remember" who the user is, what they've already been told, and
 * what's already been covered — instead of repeating itself or contradicting
 * earlier advice.
 */

export const MAX_VERBATIM_MESSAGES = 16; // ~8 user/assistant turns kept in full
export const SUMMARIZE_TRIGGER = 24; // start summarizing once history exceeds this

/**
 * Split a full message history into what should be summarized (older) and
 * what should be sent verbatim (recent).
 */
export function splitHistory(messages) {
  if (messages.length <= MAX_VERBATIM_MESSAGES) {
    return { toSummarize: [], verbatim: messages };
  }
  const splitIndex = messages.length - MAX_VERBATIM_MESSAGES;
  return {
    toSummarize: messages.slice(0, splitIndex),
    verbatim: messages.slice(splitIndex),
  };
}

/**
 * Build the final `contents` array (Gemini's shape: { role, parts }) plus the
 * combined system instruction, for a given persona turn.
 *
 * Gemini uses "user" / "model" as role names (not "assistant"), so the
 * mapping below translates our internal message shape into that format.
 */
export function buildRequestPayload({ persona, messages, memoryNote }) {
  const { verbatim } = splitHistory(messages);

  const system = memoryNote
    ? `${persona.systemPrompt}\n\nCONVERSATION MEMORY (earlier context, summarized so you stay consistent):\n${memoryNote}`
    : persona.systemPrompt;

  return {
    system,
    contents: verbatim.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  };
}

/**
 * Whether it's time to (re)generate the rolling summary given the current
 * message count and how long ago we last summarized.
 */
export function shouldResummarize(messageCount, lastSummarizedAt) {
  if (messageCount < SUMMARIZE_TRIGGER) return false;
  return messageCount - lastSummarizedAt >= MAX_VERBATIM_MESSAGES;
}
