"use client";

import { useEffect, useRef, useState } from "react";
import PersonaSwitcher from "@/components/PersonaSwitcher";
import MessageBubble from "@/components/MessageBubble";
import ChatComposer from "@/components/ChatComposer";
import { getPersona, DEFAULT_PERSONA_ID } from "@/lib/personas";
import { splitHistory, shouldResummarize } from "@/lib/context-manager";

function makeInitialThread(persona) {
  return {
    messages: [
      {
        id: `greeting-${persona.id}`,
        role: "assistant",
        content: persona.greeting,
      },
    ],
    memoryNote: null,
    lastSummarizedAt: 0,
  };
}

export default function ChatApp({ personas }) {
  const [activeId, setActiveId] = useState(DEFAULT_PERSONA_ID);
  const [threads, setThreads] = useState(() => {
    const initial = {};
    for (const p of personas) initial[p.id] = makeInitialThread(p);
    return initial;
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef(null);

  const persona = getPersona(activeId);
  const thread = threads[activeId];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages, isStreaming]);

  function updateThread(id, updater) {
    setThreads((prev) => ({ ...prev, [id]: updater(prev[id]) }));
  }

  async function handleSend(text) {
    const userMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();

    const currentThread = threads[activeId];
    const historyForRequest = [...currentThread.messages, userMessage];

    updateThread(activeId, (t) => ({
      ...t,
      messages: [
        ...t.messages,
        userMessage,
        { id: assistantId, role: "assistant", content: "" },
      ],
    }));

    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: activeId,
          messages: historyForRequest.map(({ role, content }) => ({ role, content })),
          memoryNote: currentThread.memoryNote,
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        const chunk = full;
        updateThread(activeId, (t) => ({
          ...t,
          messages: t.messages.map((m) =>
            m.id === assistantId ? { ...m, content: chunk } : m
          ),
        }));
      }

      // Context management: fold older turns into a rolling summary once
      // the thread grows past the verbatim window.
      updateThread(activeId, (t) => {
        if (!shouldResummarize(t.messages.length, t.lastSummarizedAt)) return t;
        const { toSummarize } = splitHistory(t.messages);
        if (toSummarize.length === 0) return t;

        fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: toSummarize.map(({ role, content }) => ({ role, content })),
            previousNote: t.memoryNote,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.note) {
              updateThread(activeId, (t2) => ({
                ...t2,
                memoryNote: data.note,
                lastSummarizedAt: t2.messages.length,
              }));
            }
          })
          .catch(() => {});

        return t;
      });
    } catch (err) {
      updateThread(activeId, (t) => ({
        ...t,
        messages: t.messages.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "Hmm, kuch gadbad ho gayi (something went wrong reaching the model). Check that GEMINI_API_KEY is set and try again.",
              }
            : m
        ),
      }));
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-dvh max-w-3xl mx-auto w-full">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)]">
        <div>
          <h1
            className="text-lg leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Chai ya Code?
          </h1>
          <p className="text-xs text-[var(--text-faint)]">
            An AI simulation — not the real person
          </p>
        </div>
        <PersonaSwitcher
          personas={personas}
          activeId={activeId}
          onSwitch={(id) => setActiveId(id)}
        />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-5 flex flex-col gap-5">
        {thread.messages.map((m) => (
          <MessageBubble key={m.id} message={m} persona={persona} />
        ))}
        {isStreaming && thread.messages[thread.messages.length - 1]?.content === "" && (
          <TypingIndicator persona={persona} />
        )}
      </div>

      <ChatComposer
        onSend={handleSend}
        disabled={isStreaming}
        suggestions={thread.messages.length <= 1 ? persona.suggestions : []}
        accent={persona.accent}
      />
    </div>
  );
}

function TypingIndicator({ persona }) {
  const isAmber = persona.accent === "amber";
  return (
    <div className="flex gap-3 px-4">
      <div
        className={[
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold",
          isAmber
            ? "bg-[var(--amber-soft)] text-[var(--amber-strong)] border border-[var(--amber-border)]"
            : "bg-[var(--emerald-soft)] text-[var(--emerald-strong)] border border-[var(--emerald-border)]",
        ].join(" ")}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {persona.avatarLetter}
      </div>
      <div className="flex items-center gap-1 pt-3.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--text-faint)] animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
