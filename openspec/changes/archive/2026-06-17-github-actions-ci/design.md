# Design: GitHub Actions CI

## Context

HorarioDCIApp is an Expo SDK 54 app using pnpm, Jest with `jest-expo`, Expo lint, and TypeScript strict mode. The existing testing foundation already defines the desired verification commands and excludes native, OAuth, EAS, component, integration, and E2E validation from this first automated layer.

## Architecture Decision

Create a single GitHub Actions workflow at `.github/workflows/ci.yml`.

The workflow will:

1. Trigger on `pull_request` and `push` to `main`.
2. Run on `ubuntu-latest`.
3. Use `actions/checkout@v4`.
4. Use `pnpm/action-setup@v4` with `version: 11.1.2`.
5. Use `actions/setup-node@v4` with `node-version: 22` and `cache: pnpm`.
6. Run `pnpm install --frozen-lockfile`.
7. Run `pnpm test`, `pnpm lint`, and `pnpm typecheck` as separate named steps.

## Rationale

Pinning pnpm in the workflow is the smallest safe option because `package.json` does not currently declare `packageManager`. Separate verification steps keep failures readable. Node 22 matches a current LTS baseline and avoids relying on runner defaults.

## Exclusions

The workflow will not configure secrets, `.env`, EAS, native Android/iOS builds, or OAuth redirect validation. Those concerns require credentials or development builds and are intentionally outside this CI slice.

## Documentation

No README update is required for this change. The README already lists the exact verification commands under “Verificación automatizada”; duplicating the same commands for CI would add maintenance noise without improving reviewer understanding.

## Verification

Before apply completes, run `pnpm test`, `pnpm lint`, and `pnpm typecheck` locally. CI behavior is verified structurally by reviewing the workflow triggers, dependency installation, command steps, and absence of secret/native/EAS/OAuth references.
