"use client";

export default function PersonaSwitcher({ personas, activeId, onSwitch }) {
  return (
    <div className="flex gap-2 p-1 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)]">
      {personas.map((persona) => {
        const active = persona.id === activeId;
        const isAmber = persona.accent === "amber";
        return (
          <button
            key={persona.id}
            onClick={() => onSwitch(persona.id)}
            aria-pressed={active}
            className={[
              "relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all duration-200 text-left",
              active
                ? isAmber
                  ? "bg-[var(--amber-soft)] ring-1 ring-[var(--amber-border)]"
                  : "bg-[var(--emerald-soft)] ring-1 ring-[var(--emerald-border)]"
                : "hover:bg-white/[0.04]",
            ].join(" ")}
          >
            <span
              className={[
                "relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0",
                isAmber
                  ? "bg-[var(--amber-soft)] text-[var(--amber-strong)] border border-[var(--amber-border)]"
                  : "bg-[var(--emerald-soft)] text-[var(--emerald-strong)] border border-[var(--emerald-border)]",
              ].join(" ")}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {persona.avatarLetter}
              {active && isAmber && (
                <span
                  className="steam-wisp absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-2.5 rounded-full bg-[var(--amber-strong)]/60"
                  aria-hidden
                />
              )}
              {active && !isAmber && (
                <span
                  className="cursor-blink absolute -right-0.5 -bottom-0.5 w-1.5 h-1.5 rounded-sm bg-[var(--emerald-strong)]"
                  aria-hidden
                />
              )}
            </span>
            <span className="flex flex-col leading-tight">
              <span
                className={[
                  "text-sm font-medium",
                  active ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]",
                ].join(" ")}
              >
                {persona.shortName}
              </span>
              <span className="text-[11px] text-[var(--text-faint)] hidden sm:block">
                {persona.title}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
