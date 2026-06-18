# Proposal: GitHub Actions CI

## Summary

Add a minimal GitHub Actions CI workflow for HorarioDCIApp that runs the same automated verification commands teammates already run locally: `pnpm test`, `pnpm lint`, and `pnpm typecheck`.

## Motivation

The project now has a Jest/jest-expo testing foundation, Expo linting, and TypeScript strict verification. Pull requests need an automated guardrail so review starts from a known baseline without depending on local-only checks.

## Scope

### In Scope

- Create `.github/workflows/ci.yml`.
- Trigger CI on `pull_request` and `push` to `main`.
- Use Node 22 LTS and pnpm `11.1.2`.
- Install dependencies with `pnpm install --frozen-lockfile`.
- Run `pnpm test`, `pnpm lint`, and `pnpm typecheck`.
- Use pnpm lockfile-based dependency caching.

### Out of Scope

- Native Android/iOS builds.
- EAS validation or EAS credentials.
- OAuth redirect validation.
- Secrets, `.env` files, or private credentials.
- Package metadata changes such as adding `packageManager` to `package.json`.

## Approach

Use one workflow-only slice. The workflow will check out the repository, install pnpm explicitly through `pnpm/action-setup`, configure Node through `actions/setup-node` with pnpm cache, install from the committed lockfile, then run the three existing scripts in separate steps for readable CI failures.

## Rollback Plan

If the workflow blocks valid PRs because of GitHub runner behavior, revert `.github/workflows/ci.yml`. No app runtime behavior, data, OAuth configuration, secrets, or native build setup will be changed.

## Risks

- `package.json` does not declare `packageManager`; pinning pnpm in the workflow avoids ambiguity for this slice but duplicates the version outside package metadata.
- CI runs without local `.env`; current Expo config fallbacks make this acceptable, but future config must keep lint/typecheck secret-free.
