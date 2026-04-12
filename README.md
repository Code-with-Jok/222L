# 222L

222L is a single-app Turborepo centered on `apps/landing-page`.

## Workspace Layout

```text
222L/
|-- apps/
|   `-- landing-page/
|-- packages/
|   |-- config/
|   |-- db/
|   |-- types/
|   `-- ui/
|-- docs/
|   |-- architecture/
|   `-- dev/
|-- infra/
`-- prompts/
```

## Packages

- `apps/landing-page`: primary Next.js application running on port `3000`
- `@repo/ui`: shared UI primitives and components
- `@repo/config`: shared runtime helpers plus ESLint/TypeScript config
- `@repo/types`: shared application and domain types
- `@repo/db`: scaffold-only package reserved for future database integration
- `prompts/`: repository prompt assets, including `SystemPrompt.md`

## Commands

Run everything from the repository root:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

Or target the main app directly:

```bash
pnpm --filter landing-page dev
```

## Notes

- The repository no longer uses `@vercel/microfrontends`.
- Historical microfrontend guidance has been deprecated and replaced by the
  architecture notes in `docs/architecture/`.
