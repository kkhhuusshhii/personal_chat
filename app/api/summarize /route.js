import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const SUMMARY_INSTRUCTIONS = `Summarize the following conversation between a
learner and a coding mentor into a short, dense memory note (max ~120 words).
Capture: who the user is / their stated goals or skill level, topics already
explained, decisions or recommendations already given, and anything the
mentor should not repeat or contradict. Plain prose, no headers, no
preamble — output only the note itself.`;

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { messages, previousNote } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError("`messages` must be a non-empty array", 400);
  }

  if (!process.env.GEMINI_API_KEY) {
    return jsonError("Server is missing GEMINI_API_KEY.", 500);
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const transcript = messages
    .map((m) => `${m.role === "user" ? "Learner" : "Mentor"}: ${m.content}`)
    .join("\n");

  const prompt = previousNote
    ? `Existing memory note:\n${previousNote}\n\nNew messages to fold in:\n${transcript}\n\n${SUMMARY_INSTRUCTIONS}`
    : `${transcript}\n\n${SUMMARY_INSTRUCTIONS}`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        maxOutputTokens: 220,
      },
    });

    const note = (response.text || "").trim();

    return new Response(JSON.stringify({ note }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Summarize route error:", err);
    return jsonError("Failed to summarize conversation.", 500);
  }
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
