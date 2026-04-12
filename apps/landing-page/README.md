# `apps/landing-page`

Primary Next.js application for the 222L monorepo.

## Local Development

From the repository root:

```bash
pnpm --filter landing-page dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
pnpm --filter landing-page dev
pnpm --filter landing-page build
pnpm --filter landing-page lint
pnpm --filter landing-page check-types
```

## Routing Notes

- `/` is the canonical root route.
- `/landing` and `/landing/:path*` redirect to `/` for compatibility.
