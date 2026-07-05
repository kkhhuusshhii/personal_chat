"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MessageBubble({ message, persona }) {
  const isUser = message.role === "user";
  const isAmber = persona.accent === "amber";

  if (isUser) {
    return (
      <div className="flex justify-end px-4">
        <div className="max-w-[85%] sm:max-w-[70%] bg-[var(--bg-panel-raised)] border border-[var(--border)] rounded-2xl rounded-tr-sm px-4 py-2.5">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 px-4">
      <div
        className={[
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5",
          isAmber
            ? "bg-[var(--amber-soft)] text-[var(--amber-strong)] border border-[var(--amber-border)]"
            : "bg-[var(--emerald-soft)] text-[var(--emerald-strong)] border border-[var(--emerald-border)]",
        ].join(" ")}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {persona.avatarLetter}
      </div>
      <div className="max-w-[85%] sm:max-w-[75%] pt-1">
        <div className="text-[13px] font-medium mb-1 text-[var(--text-muted)]">
          {persona.shortName}
        </div>
        <div className="msg-prose text-[15px] leading-relaxed text-[var(--text-primary)]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content || "\u00A0"}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
