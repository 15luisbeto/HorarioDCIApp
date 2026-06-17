# Tasks: Team Architecture Workflow

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180-260 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR: docs + OpenSpec task tracking |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Create final team architecture/workflow document | PR 1 | Single docs-focused PR; no runtime code, backend, remote sync, tests, or data schema code. |

## Phase 1: Document Foundation

- [x] 1.1 Create `docs/` if missing and add `docs/team-architecture-workflow.md` with purpose, scope, and non-goals from `openspec/changes/team-architecture-workflow/proposal.md`.
- [x] 1.2 Add project map for `app/`, `components/`, `hooks/`, `lib/`, `providers/`, `data/`, `app.config.ts`, and `eas.json` from `design.md`.
- [x] 1.3 Add ownership matrix covering mobile UX, schedule logic, local persistence, Google Calendar/OAuth, institutional data, and release/EAS.

## Phase 2: Governance and Architecture Content

- [x] 2.1 Document Git/GitHub workflow: short-lived branches, issue-first risky work, PR fields, reviewers, 400-line budget, and no unauthorized direct push/merge to `main`.
- [x] 2.2 Document architecture roadmap: bundled fallback now, schema/version metadata next, optional HTTPS static JSON sync later, backend only when questionnaires/auth/admin publishing justify it.
- [x] 2.3 Add dataset contract template with dataset identity, schema version, publisher `15luisbeto`, compatibility target, sources, validation, evolution, migration, and fallback expectations.
- [x] 2.4 Add questionnaire section covering future personal and anonymous responses, including privacy, storage, submission, retention, and backend trigger responsibilities.

## Phase 3: Verification Guidance

- [x] 3.1 Add verification section listing `pnpm lint`, `pnpm exec tsc --noEmit` for type-sensitive changes, manual schedule checks, and development-build-only OAuth/native validation.
- [x] 3.2 Cross-check `docs/team-architecture-workflow.md` against all scenarios in the three change specs.
- [x] 3.3 Confirm no runtime files under `app/`, `components/`, `hooks/`, `lib/`, `providers/`, or `data/` were modified.

## Phase 4: Final Review Prep

- [x] 4.1 Run `pnpm lint` if the docs change is lintable in this project; otherwise record that no lintable source changed.
- [x] 4.2 Run `pnpm exec tsc --noEmit` only if TypeScript-sensitive examples or source files were touched.
- [x] 4.3 Mark completed tasks in `openspec/changes/team-architecture-workflow/tasks.md` during apply and prepare a concise PR summary.
