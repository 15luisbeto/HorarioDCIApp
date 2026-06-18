# Tasks: GitHub Actions CI

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 35-60 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add minimal CI workflow | PR 1 | Single workflow-only change; verify with existing commands |

## Phase 1: Workflow Foundation

- [x] 1.1 Create `.github/workflows/ci.yml` with `pull_request` and `push` to `main` triggers.
- [x] 1.2 Configure one `ubuntu-latest` job with checkout, pnpm `11.1.2`, Node `22`, and pnpm cache.

## Phase 2: Verification Steps

- [x] 2.1 Add `pnpm install --frozen-lockfile` before checks.
- [x] 2.2 Add separate steps for `pnpm test`, `pnpm lint`, and `pnpm typecheck`.
- [x] 2.3 Confirm the workflow contains no secrets, `.env`, EAS, native build, or OAuth validation steps.

## Phase 3: Local Verification

- [x] 3.1 Run `pnpm test` and record the result.
- [x] 3.2 Run `pnpm lint` and record the result.
- [x] 3.3 Run `pnpm typecheck` and record the result.

## Phase 4: Documentation Review

- [x] 4.1 Leave `README.md` unchanged unless apply discovers a real documentation gap; current README already lists the CI commands.
