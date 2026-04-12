# Refactor Monorepo Structure

## Summary

This refactor consolidates 222L into a single Next.js application while
promoting shared code into reusable workspace packages.

## Final Structure

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
`-- prompts/
```

## Decisions

- `apps/landing-page` remains the only app in the workspace.
- `/` is the primary route, with `/landing` redirecting back to `/`.
- `packages/config` owns shared runtime helpers and tooling config.
- `packages/db` is scaffold-only and intentionally ORM-agnostic.
- `prompts/SystemPrompt.md` stays in `prompts/` as a repository asset.

## Tooling

- `turbo run build`
- `turbo run dev`
- `turbo run lint`
- `turbo run check-types`

`build` caches `.next/**` and `dist/**`, while `dev` stays persistent and
uncached for the local feedback loop.
