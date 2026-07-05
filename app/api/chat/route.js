import { GoogleGenAI } from "@google/genai";
import { getPersona } from "@/lib/personas";
import { buildRequestPayload } from "@/lib/context-manager";

export const runtime = "nodejs";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const { personaId, messages, memoryNote } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return jsonError("`messages` must be a non-empty array", 400);
  }

  if (!process.env.GEMINI_API_KEY) {
    return jsonError(
      "Server is missing GEMINI_API_KEY. Add it to your .env.local file (see README).",
      500
    );
  }

  const persona = getPersona(personaId);
  const { system, contents } = buildRequestPayload({
    persona,
    messages,
    memoryNote,
  });

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await ai.models.generateContentStream({
          model: MODEL,
          contents,
          config: {
            systemInstruction: system,
            maxOutputTokens: 1024,
          },
        });

        for await (const chunk of result) {
          const text = chunk.text;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        console.error("Chat route error:", err);
        controller.enqueue(
          encoder.encode(
            "\n\n[Something went wrong talking to the model. Please try again.]"
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
