# AGENTS.md — AI Agent Rules & Workflow

> Every AI agent (Claude, Cursor, Copilot, GPT) MUST read this file
> before writing, editing, or reviewing any code in this repository.

@TUTOR.md

---

## MANDATORY PRE-FLIGHT (run before ANY task)

```
STEP 1: Read TUTOR.md          → Understand design history & current state
STEP 2: Read tokens.css        → Know ALL current design values
STEP 3: Read globals.css       → Know ALL utility class patterns
STEP 4: Identify the task type → Feature / Bug Fix / Refactor / Style
STEP 5: Plan changes           → List files to modify BEFORE coding
STEP 6: Execute minimal changes → Touch ONLY what's needed
STEP 7: Update TUTOR.md        → Log what changed and WHY
```

---

## TASK TYPE RULES

### 🎨 STYLE TASK (color, spacing, typography change)

```
ONLY touch:
  - tokens.css          (change the token value)
  - globals.css         (only if utility pattern changes)

DO NOT touch:
  - Any .tsx component file
  - tailwind.config.ts (unless adding new token mapping)
```

### 🐛 BUG FIX TASK (layout, alignment, rendering issue)

```
ONLY touch the specific component with the bug.
Add a comment at the top: /* BUGFIX: [description] */
DO NOT refactor unrelated code in the same file.
DO NOT change token values to fix a component bug.
```

### ✨ FEATURE TASK (new section, new component)

```
Follow the checklist in TUTOR.md Section 12.
Create tokens FIRST, then utility classes, then component.
Always write the component using existing token classes.
```

### ♻️ REFACTOR TASK (code structure, naming, cleanup)

```
ZERO visual changes allowed — pixel-perfect preservation.
Only rename, reorganize, extract — never change values.
Run visual diff check after refactor.
```

---

## CODE STYLE RULES

### TypeScript / TSX

```tsx
// Component structure order:
// 1. Imports (external → internal → assets)
// 2. Types/interfaces
// 3. Constants (data arrays like roadmapCards)
// 4. Component function
// 5. JSX return

// File header comment required on modified files:
/*
 * ComponentName.tsx
 * Changed: [what was changed]
 * Reason: [why it was changed]
 */
```

### CSS Rules

```css
/* Token reference — ALWAYS use var() */
color: var(--color-brand-primary);     /* ✅ */
color: #FF6B35;                        /* ❌ FORBIDDEN */

/* Utility class naming convention */
.{category}-{modifier} {              /* e.g. .glass-surface, .btn-primary */

/* Comment every utility class group */
/* === GLASS SURFACES === */
.glass-surface { ... }
.glass-nav { ... }
```

### Tailwind Class Ordering (in JSX)

```
1. Layout      → relative, flex, grid, block
2. Size        → w-, h-, min-, max-
3. Position    → top-, left-, z-
4. Spacing     → p-, m-, gap-
5. Typography  → font-, text-, tracking-, leading-
6. Colors      → text-, bg-, border-
7. Appearance  → rounded-, shadow-, backdrop-
8. Animation   → transition-, animate-, duration-
9. Interactive → hover:, group-, active:
10. Responsive → sm:, md:, lg:, xl:
```

---

## COMPONENT CONTRACTS

### Header.tsx

- Must always be `position: fixed`, `z-nav`
- Logo: always `bg-brand-primary` orange square
- CTA "Join Now": always `btn-primary` class
- "Sign In": always `btn-ghost` class
- Nav links: `font-body font-medium uppercase tracking-wide`

### HeroBackground.tsx

- Image: always `object-cover scale-105`
- Scrim overlay: always `.bg-scrim` (cream gradient — never dark)
- Vignette: always `.bg-vignette` (warm cream edge)
- Z-index: always `z-background`

### HeroSection.tsx

- H1: always `font-display font-black` + responsive text scale
- "Achieve Your Dreams": always `text-text-primary` (dark charcoal)
- "with Clarity": always `text-brand-primary` + `.headline-clarity`
- Cards grid: always `items-stretch`
- Each card: always `h-full flex flex-col`
- CTA button: always `mt-auto` (pinned to card bottom)

---

## DESIGN SYSTEM CONTRACTS

### When to add a new token

```
✅ ADD a token when: a value is used in 2+ places
✅ ADD a token when: a value represents a design decision
❌ DO NOT add a token for: one-off values used once
❌ DO NOT add a token for: Tailwind defaults (gap-8, p-4, etc.)
```

### When to add a new utility class in globals.css

```
✅ ADD when: 3+ properties must always appear together
✅ ADD when: the class represents a named UI pattern
❌ DO NOT ADD when: it's just a single CSS property
❌ DO NOT ADD when: Tailwind already has a class for it
```

---

## FORBIDDEN ACTIONS

```
🚫 Never hardcode colors, spacing, or shadows in .tsx files
🚫 Never use arbitrary Tailwind: text-[#FF6B35], px-[17px]
🚫 Never change the background image (roadmap-hero.webp)
🚫 Never remove framer-motion animations without explicit instruction
🚫 Never change ALL card floatDuration to the same value
🚫 Never use bg-background (shadcn conflict with cream system)
🚫 Never touch AGENTS.md or CLAUDE.md without explicit user approval
🚫 Never skip updating TUTOR.md after design system changes
```
