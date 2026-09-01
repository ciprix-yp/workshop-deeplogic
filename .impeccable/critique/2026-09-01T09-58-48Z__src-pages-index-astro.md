---
target: landing page PRIMUL PAS (audit content designer)
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
timestamp: 2026-09-01T09-58-48Z
slug: src-pages-index-astro
---
Method: dual-agent (A: ace3848ded0fa8f79 · B: adaa15a0887ec7086)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Scarcity bar's honest "30 disponibile din 30" undercuts the status signal it exists to send; 11-field form has no progress indicator |
| 2 | Match System / Real World | 4 | Plain Romanian throughout, no key issue found |
| 3 | User Control and Freedom | 3 | Dialog closes three ways, but the 11-question form is one unstaged scroll with no way to see what's left |
| 4 | Consistency and Standards | 3 | Token system is rigorous; the "signature" section's resting weight doesn't match its narrative importance |
| 5 | Error Prevention | 3 | Strong Zod validation + Turnstile; no autosave if the long form is interrupted |
| 6 | Recognition Rather Than Recall | 3 | All labels visible; six consecutive required radio-groups give no "how many answered" signal |
| 7 | Flexibility and Efficiency | n/a | Persuade-mode single-session landing page — no repeat-use workflow to accelerate |
| 8 | Aesthetic and Minimalist Design | 2 | Fixed black bar + per-second countdown + per-CTA badge run continuously atop an otherwise quiet system |
| 9 | Error Recovery | 4 | Specific, in-voice, non-blocking error copy — no key issue found |
| 10 | Help and Documentation | n/a | FAQ substitutes for docs by deliberate design |
| **Total** | | **24/32** | **75% — Good** |

## Design Specificity Verdict

**Mostly authored for this product, with one self-undermining addition.**

The copy architecture is genuinely bespoke for a skeptical Romanian SMB audience saturated with AI hype: §03's "Ce NU vei ști la final," §12's flat admission there are no testimonials, the whole "granița" (boundary) pattern of naming what the workshop *won't* give you. No generic consultancy template does this — it costs conversion in the short term, on purpose. The hand-authored scroll storyboard (`docs/design/storyboard.json` + `MotionEngine.astro`) is real infrastructure: per-scene camera language, mobile-specific amplitude tables, a documented WCAG 2.3.1 flash-fix, reduced-motion fallbacks per scene. The facilitator photo is a real candid shot, checked at build time so a broken image never ships.

Where it breaks: the fixed black scarcity bar + countdown + live CTA badge is a category-interchangeable urgency pattern — the exact "countdown, contor de locuri live" mechanic `CLAUDE.md` banned outright, reversed on 2026-08-31. Bolted onto an otherwise honesty-first page, it reads as generic e-commerce urgency, not Deep Logic. See P0.

**Deterministic scan** (`detect.mjs --json`, 0 exit code — no blocking findings): one advisory-only hit, em-dash overuse in prose, traced to a deliberate, contrast-verified Romanian writing style (not AI filler) — a false positive.

**Live-DOM detector pass** (real headless-Playwright injection of the actual `detect.js` into the running page — no human-visible browser tab was available in this environment, stated plainly rather than faked): 23 findings, of which most resolved to false positives on inspection (documented, contrast-verified tokens; the detector's own overlay UI mistaking itself for a page defect). **One held up as a genuine, independently-confirmed WCAG AA violation** — see the new P1 below, not caught by Assessment A's read-through.

## Overall Impression

The scroll page underneath is not what's making this feel like "a landing page a child could make." Read the source and the copy, and this is a disciplined, deliberately-argued piece of work — a real design system, a real motion architecture, real editorial restraint. The gap between that and what actually loads on a phone comes from three places: **the section built to be the emotional peak of the page is the visually flattest thing on it at rest** (P1), **the newest addition (the scarcity bar) fights the page's entire credibility strategy on day one** (P0), and **a live, independently-verified accessibility bug sits on the exact numbering elements meant to give the page its rhythm** (P1). None of these are "banal" in the sense of a lazy template — they're specific, fixable seams where ambition outran verification.

## What's Working

1. **The honesty architecture is real, not decorative.** §03 and §12 are dedicated components, cross-checked by `tests/copy-invariants.test.ts` — a page that costs itself short-term conversion on purpose is the strongest evidence this was authored for this specific, skeptical audience.
2. **The facilitator photo.** A real candid shot, existence-checked at build time so a broken image never ships. Does more for credibility than any stock "expert" photo, and it's exactly the kind of asset a generic page skips.
3. **The scroll storyboard's engineering discipline**, independent of whether every scene lands: per-element reveal fractions, mobile-specific amplitude tables, a documented flash/strobe accessibility fix, a reduced-motion rationale per scene. Someone thought about degrade paths, not just the happy path.

## Priority Issues

**[P0] The scarcity bar's honest number is the opposite of scarce — and it isn't even really live.**
- **What**: `BaraScarcity.astro` shows "30 locuri disponibile din 30 · 15z 1h până la începere," confirmed live at both breakpoints, duplicated as "(30 din 30)" on every CTA. It's launch day — nobody has registered — so the bar's honest state is 100% availability, the literal opposite of urgency. Compounding it: the count is a one-time `fetch()` on page load, not a live subscription — `setInterval` only re-ticks the countdown clock, never re-fetches `ramase`. A visitor who registers, then refreshes, sees the same stale number.
- **Why it matters**: This is fixed, permanent, and per-second-ticking at the very top of every viewport — the first thing every visitor sees and the last thing before the CTA. "Nobody has claimed a seat" directly contradicts the credibility strategy the rest of the page is built on (§03, §12's refusal to fake confidence). `CLAUDE.md` banned this exact mechanic before the 2026-08-31 reversal; the reversal doesn't appear to have been stress-tested against what day one actually looks like.
- **Fix**: Don't render the fraction until it says something — keep the static fallback ("Maximum 30 de locuri") until real occupancy crosses a meaningful threshold, or drop "din 30" and the CTA badge and let the bar communicate only once the number is doing rhetorical work. Separately, make the count an actual live read (or at minimum refetch on interval/focus), not a load-time snapshot.
- **Suggested command**: `/impeccable clarify`

**[P1] The page's self-declared "signature moment" is the plainest block on the page at rest.**
- **What**: `storyboard.json` calls §08 the `signatureMoment` and states the whole design budget is spent there. At rest, it's five thin rows separated by 1px dividers, same type scale as the FAQ, no card, no elevation — objectively less visually distinguished than the ordinary numbered cards in §06, which at least have borders.
- **Why it matters**: All of the section's "specialness" lives in a one-time scroll-triggered fly-in. Anyone with reduced motion on, anyone who screenshots it and sends it on WhatsApp (the channel the storyboard itself says 40%+ of traffic arrives through), or anyone who scrolls past the narrow trigger window sees the plainest list on the page exactly where the page claims its emotional peak lives.
- **Fix**: Give §08's resting state real, permanent visual weight independent of animation — a bounding container, background treatment, or elevation that reads as "assembled object" even in a static screenshot.
- **Suggested command**: `/impeccable bolder`

**[P1] A live, detector-confirmed WCAG AA failure sits on every section's numbering — and it's a violation of the project's own documented rule.**
- **What**: Independently measured on the real rendered page (not source inference): the "01"–"05" numerals in §06/§08's article blocks (`p.numar`, `color: var(--accent-decor)`) render at 17–20px, weight 500 — contrast **4.06:1**, confirmed by both the detector and hand-recomputed WCAG relative-luminance math. `tokens.css` itself documents this exact number with the rule attached: `--accent-decor: #468984; /* 4.06:1 — DOAR ≥24px sau elemente non-text */`. These numerals qualify for neither the WCAG large-text exception nor the token's own stated safe-use condition.
- **Why it matters**: This project runs a dedicated `npm run contrast` script specifically to prevent exactly this class of regression — a documented rule was written for this token and then violated by a component that never checked against it. It's the one finding in this whole critique that isn't a matter of taste; it's a measurable accessibility bug the project's own tooling should have caught.
- **Fix**: Either bump these numerals past 24px (the size the token already assumes) or switch them to a token that passes AA at body size.
- **Suggested command**: `/impeccable audit`

**[P2] The registration form doesn't match its own "takes a few minutes" promise.**
- **What**: The dialog promises "câteva minute" and "nu trebuie să ai răspunsurile perfecte." The actual form requires six consecutive required radio-groups (3–6 options each) plus five other fields, all on one continuous, unpaginated scroll, zero progress indicator — despite the schema already grouping questions into two logical fieldsets that just aren't surfaced.
- **Why it matters**: Closer to a qualification survey than "a few minutes," with no signal of how much remains, on the exact mid-range-Android/WhatsApp-in-app-browser audience the storyboard names as the majority — real abandonment risk.
- **Fix**: A lightweight progress indicator ("3 din 11" or a bar) pinned at the top of the scrollable dialog, using the fieldset grouping that already exists.
- **Suggested command**: `/impeccable clarify`

**[P2] The mobile CTA button breaks once the live seat badge populates.**
- **What**: On the "mare" CTA at mobile width, the label and the "(30 din 30)" badge wrap independently and interleave — the badge, in a different font/weight/opacity, ends up floating beside the wrapped second line rather than reading as part of the button. Desktop is unaffected.
- **Why it matters**: This is the mobile-only primary conversion button, on the exact viewport this page is built mobile-first for. A cramped, multi-line CTA undermines the "one clear CTA" discipline `CLAUDE.md` mandates.
- **Fix**: Force the badge onto its own centered line at narrow widths, or drop the badge on the "mare" mobile CTA and let the fixed bar carry that number alone.
- **Suggested command**: `/impeccable polish`

**[P3] The hero's actual punchline renders faded and blurred on first paint.**
- **What**: The "ruptura" scene animates the H1's second line ("Dar în compania ta, de unde începi?") from opacity 0.4–0.5, blurred, up to full clarity across the first ~9% of scroll. Scroll position 0 IS the `from` state, so every visitor's literal first read is a sharp setup line followed by a soft, secondary-looking payoff line — the storyboard's own notes call that second line the actual message.
- **Why it matters**: It only resolves once the user scrolls roughly a tenth of the page — the inverse of the intended emphasis, on first paint, for every single visitor.
- **Fix**: Set the pre-scroll resting state closer to legible (opacity ≥0.7, no blur) so the punchline reads at first paint; let scroll add polish, not carry the entire reveal.
- **Suggested command**: `/impeccable polish`

## Persona Red Flags

**Jordan (First-Timer)**: Copy is genuinely good for Jordan — plain language, "you don't need to be technical" repeated three times. But Jordan hits six back-to-back multiple-choice questions with no "how many are left" signal, having been told this "takes a few minutes." A first-timer still answering radio buttons on question 5 is exactly the profile likely to abandon, second-guessing whether something's wrong.

**Riley (Stress Tester)**: Registers, watches the scarcity number NOT decrement (confirmed: it's a load-time snapshot, not a live subscription), refreshes, sees a stale "30 din 30" that doesn't account for their own registration. Also flags: the mobile bar already needs `text-overflow: ellipsis` to fit ("15z 1h până …") — the full status is permanently truncated below ~390px.

**Casey (Distracted Mobile User)**: The audience this page is explicitly built for. Hits the broken CTA badge wrap at the moment of thumb-tap, and the 11-field form with no progress indicator — if Casey gets interrupted at question 4 of 6, nothing shows how much is left, and resuming means re-scanning the whole form visually.

## Minor Observations

- `storyboard.json`'s own `meta.project` field still reads the pre-pivot product name ("Prima Mutare spre un Asistent Digital") — doesn't reach users, but it's a real signal the storyboard document wasn't touched during the copy rebrand.
- `CtaSticky.astro`'s static "30 de locuri" will drift out of sync with the live count shown in the bar and CTA badges once registrations start — three seat-count displays on one viewport, only two of which update.
- 16 distinct rendered font-sizes measured on both breakpoints (uncontaminated pass) — on the high side for a tightly-scoped hierarchy; several adjacent sizes sit within 1–3px of each other (19.2 / 20.3 / 24.6), reading as more steps than clearly-differentiated ones.
- The linear RGB interpolation driving the scarcity bar's white→red text color is verified at both endpoints but not at intermediate occupancy ratios — contrast isn't strictly linear in RGB space, so a mid-range value (e.g. 50% full) hasn't been directly confirmed ≥4.5:1, only inferred.

## Questions to Consider

- The scarcity bar's entire premise depends on a number moving toward zero — but the design has to survive day one, when the honest number is 30/30. Is showing 100% availability, in permanent black, above the fold, actually *less* trustworthy right now than the calm static line it replaced?
- The whole design budget went into the "harta" moment — but strip away the scroll animation and it's the plainest block on the page. If someone screenshots that section and sends it on WhatsApp, what do they actually see?
- The dialog promises registration "takes a few minutes." Timed against six consecutive required radio-decisions with no visible progress, is that claim still defensible — and if not, what's the cheapest thing to cut or restage first?
