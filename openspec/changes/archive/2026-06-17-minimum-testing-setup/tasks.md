# Tasks: Minimum Testing Setup

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500-1,200, mostly `pnpm-lock.yaml` |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 tooling/lockfile → PR 2 schedule tests/docs, or approved size-exception for generated lockfile |
| Delivery strategy | ask-on-risk |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add Expo/Jest tooling, scripts, config, and lockfile | PR 1 | Verify `pnpm test` starts with empty/targeted suite if available; base depends on chosen chain strategy. |
| 2 | Add `lib/schedules.ts` deterministic tests and README guidance | PR 2 | Depends on PR 1; verify `pnpm test`, `pnpm lint`, `pnpm typecheck`. |

## Phase 1: Tooling Foundation

- [x] 1.1 Install SDK-compatible `jest`, `jest-expo`, and `@types/jest` with pnpm; update `package.json` and `pnpm-lock.yaml` only.
- [x] 1.2 Add `test`, `test:watch`, and `typecheck` scripts to `package.json` using `jest`, `jest --watch`, and `tsc --noEmit`.
- [x] 1.3 Create `jest.config.js` with `preset: 'jest-expo'` and `moduleNameMapper` for `^@/(.*)$` to `<rootDir>/$1`.

## Phase 2: Schedule Domain Tests

- [x] 2.1 Inspect exported helpers in `lib/schedules.ts` and choose only deterministic pure behavior for this first suite.
- [x] 2.2 Create `lib/schedules.test.ts` covering `normalizeSearchValue`, `formatTeachers`, and `formatCourseLabel` with minimal fixtures.
- [x] 2.3 Add fixture-based tests for `buildScheduleOptionFromCourses` and `formatFavoriteExportText` without snapshots or broad production dataset counts.
- [x] 2.4 Keep component, RNTL, native, OAuth, SQLite, PDF/share, Google Calendar, integration, and E2E tests out of the suite.

## Phase 3: Documentation

- [x] 3.1 Update `README.md` with `pnpm test`, `pnpm lint`, and `pnpm typecheck` verification guidance.
- [x] 3.2 Document that OAuth/native redirect validation still requires an Expo development build, not Expo Go or Jest.

## Phase 4: Verification

- [x] 4.1 Run `pnpm test` and confirm Jest executes `lib/schedules.test.ts` without native device access.
- [x] 4.2 Run `pnpm lint` for lintable changes.
- [x] 4.3 Run `pnpm typecheck` and, if needed, `pnpm exec tsc --noEmit` to prove the script matches standards.
