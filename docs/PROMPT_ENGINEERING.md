# Prompt Engineering Strategy

## Design goal

One reusable prompt *shape* for both personas, with persona-specific content
poured into the same slots. This keeps the two personas comparable (fair to
evaluate side by side) and makes the prompts easy to maintain — see
`lib/personas.js`, where each persona is a plain object with the same
shape: `name`, `title`, `greeting`, `suggestions`, `systemPrompt`.

## Anatomy of a persona system prompt

Each `systemPrompt` (see `lib/personas.js`) is built from five sections, in
this order:

1. **Framing / role statement.** States plainly that the model is
   simulating a named public teaching persona for an educational demo, not
   the real person. This is first on purpose — it sets the honesty
   boundary before any style instructions, so "stay in character" never
   overrides "don't claim to be a real human."

2. **Voice and language.** Concrete, checkable instructions about
   vocabulary, code-switching, sentence rhythm, and formatting tics —
   phrased as *patterns* ("let Hindi connector words show up the way they
   naturally do in speech") rather than a list of words to sprinkle in,
   which tends to produce a caricature instead of a voice.

3. **Teaching philosophy.** This is the section that actually drives
   *conversation quality*, not just tone. Both personas have genuinely
   different opinions baked in here (fundamentals-first vs.
   project-first, long-form vs. punchy, career framing) so that the two
   bots give substantively different advice to the same question, not just
   the same advice in a different accent.

4. **Formatting rules.** How to use headings, lists, and code blocks — kept
   deliberately light ("use structure only when it earns its place") so
   responses don't collapse into generic AI-assistant bullet lists, which
   would undercut persona feel.

5. **Shared disclosure rule** (`SHARED_DISCLOSURE_RULE`, factored out once
   and reused by both personas). If asked directly whether it's the real
   person, the model breaks character just enough to be honest, then
   returns to the persona. Factoring this out avoids the personas drifting
   out of sync on a safety-relevant behavior.

## Why this structure over alternatives

- **Few-shot examples were deliberately left out of the system prompt.**
  Hard-coded example Q&As tend to get echoed back near-verbatim on similar
  questions, which reads as canned rather than as a consistent voice. The
  style-profile approach (describing traits, not scripting lines) produces
  more varied, still-consistent output across topics the profile didn't
  explicitly anticipate.
- **One long system prompt, not a prompt-chain.** For a chat product,
  latency and simplicity both favor a single system prompt over a
  multi-call pipeline (e.g. "generate content, then rewrite in persona
  voice"). The style-profile prompt gets persona-consistent output in one
  model call.
- **Persona differences are structural, not just lexical.** It would be
  easy to get "two accents on the same assistant" by only varying
  vocabulary. Giving each persona an explicit, different *teaching
  philosophy* section means the two personas can legitimately disagree
  (e.g. "learn DSA early" vs. "build the project first, backfill theory
  later") which is a big part of what makes the demo feel like two real
  people instead of one model with a costume on.

## Prompt-level guardrails

- The disclosure rule (above) prevents the bot from claiming to *be* the
  real person if asked directly.
- Both prompts explicitly instruct the model not to invent private facts
  (family, personal opinions about named individuals, unverifiable
  biography) and to redirect that kind of question back to safe,
  in-character territory — protecting against the persona being used to
  fabricate things a real person never said.
- Because the underlying model already applies its own general safety
  behavior, no separate moderation layer was added — the persona
  instructions sit on top of, not instead of, the model's normal judgment.

## Tuning tips if you fork this

- If a persona starts feeling like a caricature (e.g. over-using Hindi
  words or emoji), tighten the "sparingly" language in the voice section —
  it's an easy dial.
- If responses feel too generic/AI-assistant-like, that usually means the
  *teaching philosophy* section needs more specific, opinionated content,
  not more voice/vocabulary instructions. Voice makes it sound different;
  philosophy makes it actually be different.
- Keep the disclosure rule wherever you extend the prompts — it's small,
  cheap, and it's the main honesty safeguard in the whole system.
