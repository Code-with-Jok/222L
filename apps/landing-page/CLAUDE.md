# CLAUDE.md — Project Rules for Claude & All AI Agents

## Quick Start

@AGENTS.md
@TUTOR.md

---

## This Project At A Glance

**Roadmap Hub** — Learning paths landing page
Stack: Next.js 16 · React 19 · Tailwind v4 · Framer Motion · TypeScript
Theme: Warm Cream Light — frosted glass on 3D landscape background

---

## Critical Rules (TL;DR)

```
1. Read TUTOR.md FIRST — always
2. Zero hardcoded values in .tsx — always use token classes
3. Cards in grids → items-stretch + h-full + mt-auto button
4. font-display = headings only / font-body = everything else
5. bg-scrim is cream NOT dark — never make it dark again
6. Update TUTOR.md after every design system change
```

---

## File Map

```
apps/landing-page/
├── app/
│   ├── globals.css          ← Utility classes (use tokens only)
│   ├── tokens.css           ← SOURCE OF TRUTH for all design values
│   ├── layout.tsx           ← Font loading (Nunito + Quicksand)
│   └── page.tsx             ← Component assembly
├── components/
│   ├── Header.tsx           ← Fixed nav bar
│   ├── HeroBackground.tsx   ← Background image + cream scrim
│   └── HeroSection.tsx      ← Hero headline + curations cards
├── public/
│   └── roadmap-hero.webp    ← Background image (DO NOT CHANGE)
├── tailwind.config.ts       ← Token → Tailwind class mappings
├── TUTOR.md                 ← Design evolution & knowledge base
├── AGENTS.md                ← Agent rules & workflow (this context)
├── WORKFLOW.md              ← Playbooks for common tasks
└── SKILLS.md                ← Reusable agent skill prompts
```

---

## Next.js Version Note

This uses **Next.js 16** with potential breaking changes from older versions.
Before using any Next.js API, check `node_modules/next/dist/docs/` first.
