# Shadcn UI Setup for the Current 222L Monorepo

This repository now uses a single Next.js app plus shared workspace packages.

## Current Structure

```text
apps/
  landing-page/
packages/
  config/
  db/
  types/
  ui/
```

## What Lives Where

- `apps/landing-page`: consumes shared UI and global styles
- `packages/ui`: shared shadcn primitives and reusable components
- `packages/config`: shared ESLint and TypeScript configuration

## Current Integration Pattern

`apps/landing-page/app/globals.css` imports the shared shadcn stylesheet:

```css
@import "@repo/ui/shadcn.css";
@source "../../../packages/ui/src/**/*.tsx";
```

That keeps the UI package as the source of truth while allowing the app to
generate the required Tailwind classes.

## Commands

Run checks from the repository root:

```bash
pnpm --filter @repo/ui check-types
pnpm --filter landing-page check-types
pnpm lint
```

## Notes

- The previous `apps/web + apps/landing-page` setup is no longer active.
- Any older instructions mentioning `apps/web` should be treated as historical.
