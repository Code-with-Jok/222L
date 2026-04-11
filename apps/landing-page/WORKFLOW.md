# WORKFLOW.md — Feature Implementation Guides

> Step-by-step playbooks for common tasks in Roadmap Hub.
> Use these as prompts for AI agents or as personal checklists.

---

## PLAYBOOK 1: ADD A NEW SECTION

**Use when:** Adding a testimonials section, pricing, features grid, etc.

```
PROMPT TEMPLATE:
"You are a senior Next.js developer working on Roadmap Hub landing page.
Read TUTOR.md, AGENTS.md, tokens.css, and globals.css first.

Task: Add a new [SECTION NAME] section after HeroSection.

Requirements:
- Create file: apps/landing-page/components/[SectionName].tsx
- Use ONLY existing token classes — no hardcoded values
- Follow the card pattern from HeroSection.tsx if cards are needed
  (items-stretch grid + h-full cards + mt-auto CTA)
- Typography: font-display for headings, font-body for body text
- Colors: reference tokens.css — do NOT invent new colors
- Animations: use framer-motion with tokens from tokens.css
  (duration-base, ease-spring, etc.)
- Add the component to page.tsx in correct order

After completing:
- Add an entry to TUTOR.md Section 2 (Design Evolution Log)
- List any new tokens added to tokens.css"
```

---

## PLAYBOOK 2: CHANGE A COLOR / REBRAND

**Use when:** Updating brand color, adding dark mode, seasonal theme.

```
PROMPT TEMPLATE:
"You are a design systems engineer on Roadmap Hub.
Read TUTOR.md and tokens.css before starting.

Task: Change [TOKEN NAME] from [OLD VALUE] to [NEW VALUE].

Rules:
1. Change ONLY in tokens.css — do NOT touch any .tsx file
2. Check globals.css for any utility classes that hardcode
   the old value — fix them to use the updated token
3. Verify WCAG AA contrast is maintained for text tokens:
   - Text on cream (#FDF6EE): minimum contrast 4.5:1
   - Text on card surface (rgba 255,250,244,0.85): minimum 4.5:1

After completing:
- Update TUTOR.md Section 4 (Color System) table
- Note the reason for the change in TUTOR.md Evolution Log"
```

---

## PLAYBOOK 3: FIX A LAYOUT BUG

**Use when:** Alignment issues, overflow, responsive breakpoints.

```
PROMPT TEMPLATE:
"You are a senior frontend developer debugging Roadmap Hub.
Read TUTOR.md Section 10 (Known Issues) first — the bug may be documented.

Bug description: [DESCRIBE THE VISUAL BUG]
Affected component: [FILE NAME]
Breakpoint where bug appears: [mobile/tablet/desktop/all]

Rules:
1. Fix ONLY the specific bug — do NOT refactor surrounding code
2. Add comment above the fix: /* BUGFIX: [description] */
3. If the fix requires a new CSS value, add it as a token first
4. After fixing, add to TUTOR.md Section 10 if it's a new known issue

Provide:
- Root cause explanation
- Minimal code change (diff style preferred)
- How to verify the fix"
```

---

## PLAYBOOK 4: ADD A NEW CARD TYPE

**Use when:** New category cards, feature cards, pricing cards.

```
PROMPT TEMPLATE:
"You are implementing a new card variant for Roadmap Hub.
Read HeroSection.tsx and tokens.css for the existing card pattern.

New card requirements:
- Name: [CARD TYPE NAME]
- Content: [title, subtitle, icon, badge, CTA text]
- Accent color: [must use existing token — e.g. brand-primary, brand-secondary]
- Hover behavior: [describe or say 'same as existing cards']

Rules:
1. The card MUST use .glass-surface class — no custom card CSS
2. The card MUST have h-full + flex flex-col for grid alignment
3. CTA button MUST have mt-auto for bottom alignment
4. Badge MUST use .badge utility class
5. Icon container: use existing inline style pattern from HeroSection.tsx
6. Float animation: use a UNIQUE floatDuration (not the same as other cards)

Output: A reusable React component named [CardType]Card.tsx"
```

---

## PLAYBOOK 5: RESPONSIVE FIX

**Use when:** Component looks broken on mobile or specific viewport.

```
PROMPT TEMPLATE:
"Fix the responsive behavior of [COMPONENT] in Roadmap Hub.
Read TUTOR.md for the responsive strategy before starting.

Problem: [DESCRIBE WHAT BREAKS ON WHICH BREAKPOINT]

Responsive breakpoint system (Tailwind v4, mobile-first):
- base (0px+)    → mobile portrait
- sm  (640px+)   → mobile landscape / small tablet
- md  (768px+)   → tablet
- lg  (1024px+)  → desktop
- xl  (1280px+)  → large desktop

Rules:
1. ALWAYS write base styles first, then add sm:, md:, lg: overrides
2. NEVER write desktop-first (never use max-w-[X] to override mobile)
3. Typography responsive pattern (must follow this exactly):
   text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl
4. Padding responsive pattern:
   px-4 sm:px-6 md:px-8 lg:px-10
5. Grid responsive pattern:
   grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

---

## PLAYBOOK 6: PERFORMANCE OPTIMIZATION

**Use when:** Lighthouse score improvement, bundle size, CLS issues.

```
PROMPT TEMPLATE:
"Optimize performance of Roadmap Hub landing page.
Read package.json for current dependencies before starting.

Current known optimizations:
- Next.js Image component used in HeroBackground.tsx
- Fonts loaded via next/font (Nunito, Quicksand)
- Framer Motion used for animations (bundle impact: ~30KB)

Task: [SPECIFIC OPTIMIZATION GOAL]

Constraints:
- DO NOT remove framer-motion — it's used throughout
- DO NOT change the background image format (keep .webp)
- DO NOT remove any visual effects without user approval
- Prefer dynamic imports for below-fold sections
- Target: LCP < 2.5s, CLS < 0.1, FID < 100ms"
```

```
