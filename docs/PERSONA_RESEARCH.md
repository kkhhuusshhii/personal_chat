# Persona Research — How the personas were built

This doc explains where each persona's style profile came from, what it
deliberately does *not* claim, and how to extend the research if you want
higher fidelity for your own submission.

## Method

Rather than treating this as "scrape a transcript and paste it into a
prompt," the personas were built as **style profiles**: a structured list of
voice traits, teaching philosophy, and formatting habits, derived from
material that is public, repeated across many sources, and safe to
generalize from — not from any single private or ambiguous clip.

Sources reviewed for each person:

- **Channel/creator descriptions and about pages** (YouTube channel bios,
  course landing pages on their own sites) — these are self-authored, so
  they're a reliable source for how each person frames their own teaching
  mission.
- **Public write-ups and interviews** describing their teaching style,
  channel focus, and background (tech press, community blog posts,
  podcasts/interview appearances).
- **Prior open-source attempts at the same idea.** Several developers have
  already published "chat with Hitesh / Piyush" persona bots on GitHub as
  course projects (this exact assignment is a known exercise taught in
  their own GenAI cohort courses). Reading how other builders distilled
  each persona's traits was useful as a cross-check, without copying any of
  their prompt text verbatim.
- **General knowledge of the Indian tech-education YouTube scene** — e.g.
  the norm of mixing Hindi and English ("Hinglish") in spoken tutorials,
  which both creators use, but to different degrees.

## What went into each style profile

For each person, the research was distilled into four buckets that map
directly onto sections of the system prompt (see
[`PROMPT_ENGINEERING.md`](./PROMPT_ENGINEERING.md)):

1. **Voice & language** — vocabulary, code-switching patterns, sentence
   rhythm, characteristic filler/connector words, emoji habits.
2. **Teaching philosophy** — what they actually believe about how people
   should learn (fundamentals-first vs. project-first, tolerance for
   theory vs. bias toward shipping, how they talk about careers/industry).
3. **Formatting habits** — how information tends to be structured
   (long-form vs. punchy, code-heavy vs. explanation-heavy).
4. **Public biographical facts** used only for grounding, never as a
   source of private/personal claims — e.g. "former CTO who now teaches
   full-time" (Hitesh) or "founder of an ed-tech platform, project-based
   YouTube courses" (Piyush).

### Hitesh Choudhary — distilled traits

- Hindi-medium, Hinglish-forward communication; channel built explicitly
  around a relaxed "learning over chai" framing.
- Long-form, thorough teaching style — multi-hour deep dives rather than
  short trend videos; big on making sure fundamentals are solid.
- Vocal about avoiding "tutorial hell" and about consistency over
  intensity.
- Background as a senior industry engineer/CTO before moving to education
  full-time, which shows up as grounded, unhyped career advice.

### Piyush Garg — distilled traits

- English-forward with lighter Hinglish mixed in; faster, punchier
  delivery.
- Explicitly "hands-on, fast-paced, project-based" by his own description —
  writes real code rather than staying conceptual.
- Strong focus on making learners "job-ready" and on real production
  concerns (deployment, Docker, backend architecture), plus current
  interest in applied GenAI/agents.
- Runs an ed-tech platform (Teachyst) and cohort-based courses, which shows
  up as comfort talking about the business/production side of shipping
  software, not just the syntax.

## What this intentionally avoids

- **No invented private opinions, quotes, or biographical claims.** The
  system prompts describe *patterns of speech and teaching philosophy*, not
  specific verbatim lines attributed to either person. Anything the model
  outputs in-persona is a generated stylistic recreation, not a real quote.
- **No scraping or reproducing copyrighted transcript text.** If you want to
  extend this with real transcripts (recommended for a stronger fidelity
  score), summarize patterns you notice into the style-profile buckets
  above rather than pasting large verbatim excerpts into the prompt.
- **An explicit disclosure rule** is baked into both prompts: if a user asks
  "are you really him," the model says it's an AI simulation. This keeps
  the project honest about what it is — a portfolio/demo tool, not a way to
  put words in a real person's mouth.

## Extending this for a stronger submission

If you want to push persona accuracy further:

1. Watch 5–10 videos per channel and, for each, jot down: 3 phrases that
   felt characteristic, 1 teaching-philosophy moment, and how they opened
   / closed the video.
2. Turn those notes into *more* bullet points in the relevant section of
   `lib/personas.js` — the prompt is structured so this is additive, not a
   rewrite.
3. Optionally add a small retrieval step (see `CONTEXT_MANAGEMENT.md`) that
   pulls a few of your own summarized notes into context for topic-specific
   questions (e.g. "what does Hitesh usually say about DSA vs. projects").
