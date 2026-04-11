# TUTOR.md — Roadmap Hub Landing Page

> AI Agent Knowledge Base: Design evolution, decisions, and reasoning log.
> Agents MUST read this before making any changes to the codebase.

---

## 1. PROJECT OVERVIEW

| Field        | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| Project      | Roadmap Hub — Learning Paths Landing Page                          |
| Stack        | Next.js 16, React 19, Tailwind CSS v4, Framer Motion, Lucide React |
| Architecture | Monorepo via `@repo/ui` (shared shadcn components)                 |
| Port         | `3001` (dev)                                                       |
| Theme        | Warm Cream Light — frosted glass cards on 3D landscape background  |

---

## 2. DESIGN EVOLUTION LOG

> This section is critical. It records WHY decisions were made, not just what.

### Version 1 — Dark Glassmorphism (REJECTED)

**Problem:** Background image (floating islands) competed with content.

- Headline used `#FF6B35` orange + magenta — no color logic
- Dark scrim `rgba(0,0,0,0.25–0.6)` not strong enough → text unreadable
- Glass cards: `backdrop-filter: blur(20px)` too weak
- WCAG AA: FAILED on headline contrast
- Score: **3.8/10**

**Lessons learned:**

- Dark text-on-dark-scrim is always a losing battle with complex backgrounds
- Magenta accent with orange = random, not intentional brand language
- Glass cards need `blur(28px+)` to read on busy backgrounds

---

### Version 2 — Dark Glassmorphism Refined (PARTIAL FIX)

**Changes:** Unified headline to orange palette, increased blur, better scrim

- Headline: orange `#FF6B35` → gold `#FFB347` (same family, better coherence)
- Scrim: increased to `rgba(0,0,0,0.45)` top
- Cards: `blur(28px) saturate(180%)`, `rgba(255,255,255,0.12)`
- Score: **6.2/10**

**Remaining problems:**

- "Clarity" gold text on warm yellow background → invisible (same hue family)
- Card 1 alignment broken (grid `items-start` bug)
- Hover shadow too subtle on dark background

---

### Version 3 — Warm Cream Light Theme (CURRENT ✅)

**Core insight:** Flip the paradigm — use LIGHT cream overlay instead of dark.
Background becomes a "watercolor wash" not a dark void.

**Key decisions:**

```
1. Headline: #1A1A2E (dark charcoal) on cream scrim → WCAG AA PASS
2. "with Clarity": #FF6B35 orange with text-shadow glow
3. Cards: rgba(255,250,244,0.85) frosted cream, NOT dark glass
4. Scrim: cream rgba(253,246,238,0.55→0.25→0.72) — preserves bg
5. Removed vignette darkening, added warm cream edge fade
```

**Score: 8.2/10**

**Remaining polish (done in v3.1):**

- ✅ Card grid alignment: `items-stretch` + `h-full` on each card
- ✅ Hover shadow: increased orange warmth `rgba(255,107,53,0.22)`
- ✅ "Clarity" text-shadow: `.headline-clarity` utility class
- ✅ Body text: `#5A5A7A` (was `#3D3D5C`, too heavy)
- ✅ Badge letter-spacing: `0.08em` (was `0.2em`, too stretched)
- ✅ START JOURNEY: `border-[1.5px]`, hover `bg-brand-primary/8`

---

## 3. DESIGN SYSTEM ARCHITECTURE

### Token Hierarchy

```
tokens.css          ← Single source of truth (CSS custom properties)
    ↓
tailwind.config.ts  ← Maps tokens to Tailwind utility names
    ↓
globals.css         ← Utility classes using var(--token) only
    ↓
*.tsx components    ← Use Tailwind classes, NO hardcoded values
```

### RULE: Zero Hardcoded Values

```tsx
// ❌ FORBIDDEN in any .tsx file
<div style={{ color: "#FF6B35" }}>
<div className="text-[#FF6B35]">
<div className="bg-[rgba(255,255,255,0.12)]">

// ✅ CORRECT — always via tokens
<div className="text-brand-primary">
<div className="glass-surface">
<div className="text-text-muted">
```

---

## 4. COLOR SYSTEM (CURRENT)

### Brand Palette

| Token                         | Value     | Usage                       |
| ----------------------------- | --------- | --------------------------- |
| `--color-brand-primary`       | `#FF6B35` | CTA buttons, icons, accents |
| `--color-brand-secondary`     | `#FF8C69` | Coral secondary accent      |
| `--color-brand-primary-hover` | `#E85A27` | Button hover state          |
| `--color-brand-accent`        | `#FFB347` | Gold — tertiary only        |

### Surface System (Cream Light)

| Token                        | Value                    | Usage               |
| ---------------------------- | ------------------------ | ------------------- |
| `--color-surface-base`       | `#FDF6EE`                | Body background     |
| `--color-surface-card`       | `rgba(255,250,244,0.85)` | Frosted cream cards |
| `--color-surface-card-hover` | `rgba(255,250,244,0.95)` | Card hover          |
| `--color-surface-nav`        | `rgba(253,246,238,0.80)` | Nav bar             |
| `--color-surface-badge`      | `rgba(255,107,53,0.10)`  | Badge orange tint   |

### Text Hierarchy

| Token                    | Value     | On What                |
| ------------------------ | --------- | ---------------------- |
| `--color-text-primary`   | `#1A1A2E` | Headlines, titles      |
| `--color-text-secondary` | `#5A5A7A` | Body paragraphs        |
| `--color-text-muted`     | `#6B6B8A` | Captions, nav links    |
| `--color-text-on-brand`  | `#FFFFFF` | Text ON orange buttons |

---

## 5. TYPOGRAPHY SYSTEM

### Font Assignment (STRICT)

```tsx
font-display  → Nunito        → ALL headings (h1, h2, h3, badge labels)
font-body     → Quicksand     → ALL body text, nav links, button labels
```

### Size Scale

```
text-xs  = 0.6875rem (11px) → badges, nav links, button labels
text-sm  = 0.875rem  (14px) → card body text
text-base= 1rem      (16px) → general body
text-lg  = 1.125rem  (18px) → subheadings
text-xl  = 1.25rem   (20px) → section titles
text-6xl = 3.75rem   (60px) → mobile H1
text-9xl = 8rem      (128px)→ desktop H1
```

### Weight Rules

```
font-black  (900) → H1 only
font-bold   (700) → H2, H3, badges, CTA buttons
font-medium (500) → Body, nav links, captions
```

---

## 6. COMPONENT PATTERNS

### Glass Card (`.glass-surface`)

```css
background: rgba(255,250,244,0.85)     /* frosted cream */
backdrop-filter: blur(24px) saturate(160%)
border: 1px solid rgba(255,107,53,0.12) /* warm orange */
box-shadow: warm orange glow shadows
border-radius: var(--radius-xl)         /* 24px */
```

**Always use `h-full` + `flex flex-col` inside grid for equal height.**

### Nav Bar (`.glass-nav`)

```css
background: rgba(253,246,238,0.80)
backdrop-filter: blur(20px) saturate(150%)
border: 1px solid rgba(255,107,53,0.15)
```

### Badge (`.badge`)

```css
background: rgba(255,107,53,0.10)  /* orange tint */
color: #FF6B35
border: 1px solid rgba(255,107,53,0.12)
font-size: 10px
letter-spacing: 0.08em    /* NOT 0.2em — too stretched */
```

### Background Scrim (`.bg-scrim`)

```css
/* Cream wash — NOT dark overlay */
background: linear-gradient(
  to bottom,
  rgba(253, 246, 238, 0.55) 0%,
  /* cream top */ rgba(253, 246, 238, 0.25) 45%,
  /* transparent middle — shows bg */ rgba(253, 246, 238, 0.72) 100%
    /* cream bottom */
);
```

---

## 7. LAYOUT RULES

### Grid Cards

```tsx
// Container — ALWAYS items-stretch
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                gap-8 items-stretch">

// Card — ALWAYS h-full flex flex-col
<motion.div className="glass-surface ... h-full flex flex-col">
  <div className="flex-grow"> ... </div>
  <button className="mt-auto"> Start Journey </button>  {/* pinned bottom */}
</motion.div>
```

### Z-Index Stack

```
--z-background: -10   → Background image
--z-overlay:    10    → Scrim + vignette
--z-content:    20    → All page content
--z-nav:        50    → Navigation bar (always on top)
```

---

## 8. ANIMATION SYSTEM

### Duration Tokens

```
--duration-fast:   200ms  → Hover color transitions
--duration-base:   400ms  → Transform animations
--duration-slow:   800ms  → Card shimmer sweep
--duration-float:  6s     → Floating card animation
```

### Easing Tokens

```
--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)  → Entrances, scale
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)   → General transitions
```

### Card Float Animation

Each card has a different `floatDuration` (5s, 6s, 7s) to avoid sync.
**Never** make all cards float at the same speed.

---

## 9. FILE RESPONSIBILITY MAP

| File                 | Responsibility              | Change Frequency                     |
| -------------------- | --------------------------- | ------------------------------------ |
| `tokens.css`         | All design values           | Low — only for design system changes |
| `tailwind.config.ts` | Maps tokens → Tailwind      | Low — only add new token mappings    |
| `globals.css`        | Utility class definitions   | Medium — for new utility patterns    |
| `layout.tsx`         | Font loading, metadata      | Very Low                             |
| `page.tsx`           | Component assembly          | Very Low                             |
| `Header.tsx`         | Nav bar UI                  | Low                                  |
| `HeroBackground.tsx` | Background image + overlays | Low                                  |
| `HeroSection.tsx`    | Hero + cards UI             | High — most feature work here        |

---

## 10. KNOWN ISSUES & WORKAROUNDS

### Issue: `hover:bg-brand-primary/8` Tailwind opacity

Tailwind v4 may not support `/8` opacity modifier on custom color tokens.
**Workaround:** Use inline style or add explicit color in globals.css:

```css
.btn-journey:hover {
  background: rgba(255, 107, 53, 0.08);
}
```

### Issue: `z-nav` Tailwind class

Tailwind v4 custom z-index via CSS vars may not work as class directly.
**Workaround:** Use `style={{ zIndex: 'var(--z-nav)' }}` or `z-[50]`.

### Issue: `@repo/ui` shadcn.css overrides

`shadcn.css` is imported BEFORE `tokens.css`. Some shadcn HSL vars
(`--background`, `--foreground`) may conflict with our cream surface system.
**Rule:** Never use Tailwind's `bg-background` — use `bg-surface-base` instead.

---

## 11. DO / DON'T QUICK REFERENCE

### ✅ DO

- Always read `tokens.css` before touching any color
- Use `font-display` for ALL headings
- Use `font-body` for ALL body text and buttons
- Add `h-full` to every card in a grid
- Add `items-stretch` to every card grid container
- Test hover states — shadows must be visible on cream background
- Keep `framer-motion` animation structure intact when refactoring

### ❌ DON'T

- Hardcode any hex color or rgba in `.tsx` files
- Use arbitrary Tailwind values like `text-[#FF6B35]` or `px-[17px]`
- Mix `font-display` and `font-body` on the same text element
- Remove the `bg-scrim` overlay — it's critical for text contrast
- Change `floatDuration` to the same value for all cards
- Use `bg-background` (shadcn token) — conflicts with cream system
- Touch `AGENTS.md` or `CLAUDE.md` without explicit user instruction

---

## 12. ADDING NEW FEATURES — CHECKLIST

When adding a new section or component:

```
□ 1. Does it need new colors? → Add to tokens.css FIRST
□ 2. Does it need new Tailwind classes? → Add to tailwind.config.ts
□ 3. Does it need new utility patterns? → Add to globals.css
□ 4. Is it a card/grid? → Add items-stretch + h-full
□ 5. Does it have text? → Assign font-display OR font-body explicitly
□ 6. Does it animate? → Use duration/easing tokens from tokens.css
□ 7. Does it have a z-index? → Use the z-index scale tokens
□ 8. After changes → Update this TUTOR.md Design Evolution Log
```
