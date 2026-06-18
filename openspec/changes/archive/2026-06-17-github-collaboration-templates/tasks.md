# Tasks: GitHub Collaboration Templates

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 220-330 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR: template-only governance files |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add GitHub PR and issue templates | PR 1 | Single docs/governance slice; no CI, labels enforcement, or runtime code. |

## Phase 1: PR Template

- [x] 1.1 Create `.github/PULL_REQUEST_TEMPLATE.md` with linked issue, change type, owner, scope/non-goals, and affected capability fields.
- [x] 1.2 Add verification checklist for `pnpm test`, `pnpm lint`, `pnpm typecheck`, manual checks, and docs-only N/A notes.
- [x] 1.3 Add risk section covering OAuth/native, storage, data shape, EAS/release, Play Console, and 400-line budget exception/split.

## Phase 2: Issue Forms

- [x] 2.1 Create `.github/ISSUE_TEMPLATE/bug_report.yml` with observed/expected behavior, environment, owner, risk category, reproduction, validation path, and acceptance criteria.
- [x] 2.2 Create `.github/ISSUE_TEMPLATE/feature_request.yml` with problem, outcome, owner, scope/non-goals, acceptance criteria, risk category, validation path, and review-size expectation.
- [x] 2.3 Create `.github/ISSUE_TEMPLATE/docs_task.yml` with context, owner, affected area, acceptance checks, risk category, and validation path.

## Phase 3: Template Chooser and Governance Safety

- [x] 3.1 Create `.github/ISSUE_TEMPLATE/config.yml` with `blank_issues_enabled: true` and no required missing-label assumptions.
- [x] 3.2 Ensure all templates mention optional/manual labels only as guidance, not enforced YAML defaults.
- [x] 3.3 Confirm no `.github/workflows/`, labeler config, branch protection, or CI automation is added.

## Phase 4: Verification

- [x] 4.1 Cross-check templates against `openspec/changes/github-collaboration-templates/specs/team-workflow-governance/spec.md` scenarios.
- [x] 4.2 Run `pnpm test`, `pnpm lint`, and `pnpm typecheck`, or record any environment blocker.
- [x] 4.3 Mark completed tasks during apply and prepare PR notes with forecast and validation evidence.
