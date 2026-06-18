## Exploration: GitHub Actions CI

### Current State
The project is an Expo Router app using TypeScript strict mode and pnpm. `package.json` exposes the exact local checks requested for CI: `pnpm test` (`jest` with `jest-expo`), `pnpm lint` (`expo lint`), and `pnpm typecheck` (`tsc --noEmit`). A `pnpm-lock.yaml` lockfile and `pnpm-workspace.yaml` exist, but `package.json` does not declare a `packageManager` field. No `.github/workflows/*` files currently exist. `.env` exists locally and is ignored; `.env.example` documents only `EXPO_PUBLIC_*` values. Expo config reads these variables with empty-string fallbacks, and prior verification output shows Expo lint loads `.env`, so CI must not depend on real secrets.

### Affected Areas
- `.github/workflows/ci.yml` — new workflow should run automated checks on pull requests and pushes to `main`.
- `package.json` — source of existing scripts; optional future place for `packageManager` pinning, but not required for the first CI slice if the workflow pins pnpm directly.
- `pnpm-lock.yaml` / `pnpm-workspace.yaml` — lockfile and hoisted node linker should be used by `pnpm install --frozen-lockfile`.
- `.env.example` / `.gitignore` — confirms CI must not commit or require `.env`; `.env` is ignored.
- `app.config.ts` — Expo config reads public env values with safe fallbacks, so lint/typecheck can run without secrets.
- `README.md` — already documents local verification commands; optional docs update can mention CI once the workflow exists.
- `openspec/specs/automated-testing-foundation/spec.md` — states CI SHOULD run the same commands and MUST NOT require secrets or native credentials.

### Approaches
1. **Minimal CI workflow with pinned pnpm action** — Add one workflow using `actions/checkout`, `pnpm/action-setup@v4` with an explicit pnpm version, `actions/setup-node@v4` with `cache: pnpm`, `pnpm install --frozen-lockfile`, then `pnpm test`, `pnpm lint`, and `pnpm typecheck`.
   - Pros: Smallest safe slice; no app code changes; cache is supported; avoids relying on absent `packageManager` metadata; no secrets/native/EAS setup.
   - Cons: pnpm version is duplicated in workflow instead of package metadata; future pnpm upgrades require workflow maintenance.
   - Effort: Low

2. **Add `packageManager` and use Corepack** — Add `packageManager` to `package.json`, enable Corepack in CI, use setup-node pnpm cache, then run the checks.
   - Pros: Better long-term package-manager reproducibility; developers and CI resolve the same pnpm version through project metadata.
   - Cons: Changes package metadata in addition to CI; slightly larger first slice; requires choosing and maintaining a pinned pnpm version deliberately.
   - Effort: Low-Medium

3. **Expanded CI including native/EAS validation** — Add CI jobs for EAS/native builds or OAuth-oriented validation.
   - Pros: Would catch native release/build issues earlier.
   - Cons: Violates the requested first slice and project constraint; requires credentials/secrets, Expo/EAS auth, longer runtime, and cannot validate OAuth redirects without development-build context.
   - Effort: High

### Recommendation
Use Approach 1 for the first CI slice: create `.github/workflows/ci.yml` triggered by `pull_request` and `push` to `main`, run on `ubuntu-latest`, use Node 22 LTS, install pnpm explicitly via `pnpm/action-setup@v4` (pin to the locally observed pnpm `11.1.2` or another team-approved version), enable `actions/setup-node@v4` with `cache: pnpm`, install with `pnpm install --frozen-lockfile`, then run `pnpm test`, `pnpm lint`, and `pnpm typecheck`. Do not add `.env`, secrets, native Android/iOS builds, or EAS commands to this workflow. A later cleanup can add `packageManager` to `package.json` if the team wants Corepack-based reproducibility.

### Risks
- `expo lint` may log `env: load .env` locally, but CI should run without `.env`; current `app.config.ts` fallbacks make that acceptable for lint/typecheck unless future config starts requiring env values.
- `package.json` lacks `packageManager`; pin pnpm in the workflow now or intentionally add package metadata in a separate small change.
- GitHub-hosted runners may use a different Node version if not pinned; use Node 22 LTS rather than relying on runner defaults.
- CI must not include EAS/native builds or OAuth validation because those require credentials/development builds and are explicitly out of scope.

### Ready for Proposal
Yes — propose a minimal workflow-only CI change. Tell the user the first implementation should add `.github/workflows/ci.yml` for PRs and pushes to `main`, using pnpm cache and frozen lockfile installation, running only `pnpm test`, `pnpm lint`, and `pnpm typecheck`; docs updates are optional because README already lists the same checks.
