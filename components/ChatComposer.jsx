"use client";

import { useState } from "react";

export default function ChatComposer({ onSend, disabled, suggestions, accent }) {
  const [value, setValue] = useState("");
  const isAmber = accent === "amber";

  function submit(text) {
    const trimmed = (text ?? value).trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }

  return (
    <div className="border-t border-[var(--border)] bg-[var(--bg-panel)]/80 backdrop-blur px-4 pt-3 pb-4">
      {suggestions?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              disabled={disabled}
              className="shrink-0 text-[13px] px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-soft)] transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex items-end gap-2"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Type your question…"
          disabled={disabled}
          className="flex-1 resize-none max-h-40 bg-[var(--bg-panel-raised)] border border-[var(--border)] rounded-xl px-4 py-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--amber-border)] disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className={[
            "shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
            isAmber
              ? "bg-[var(--amber)] text-[#1a1305] hover:bg-[var(--amber-strong)]"
              : "bg-[var(--emerald)] text-[#04211a] hover:bg-[var(--emerald-strong)]",
          ].join(" ")}
        >
          Send
        </button>
      </form>
    </div>
  );
}
