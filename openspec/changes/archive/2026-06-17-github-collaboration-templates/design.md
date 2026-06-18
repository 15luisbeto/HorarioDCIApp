# Design: GitHub Collaboration Templates

## Technical Approach

This is a template-only governance change. It creates `.github/` collaboration files that translate `docs/team-architecture-workflow.md` and `docs/local-device-testing.md` into contributor prompts. No runtime code, CI, release config, OAuth/native config, labels, or automation will change.

## File Plan

| File | Action | Planned content |
|---|---|---|
| `.github/PULL_REQUEST_TEMPLATE.md` | Create | Markdown checklist for linked issue, type, owner, scope/non-goals, affected capability, verification commands, risk notes, Expo Go/development build/Play Console validation, 400-line budget, and optional manual labels. |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | Create | GitHub Issue Form for observed/expected behavior, environment, owner, capability, risk, reproduction, validation path, and acceptance criteria. |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | Create | Issue Form for problem, proposed outcome, owner, scope/non-goals, acceptance criteria, risk, validation path, and review-size expectation. |
| `.github/ISSUE_TEMPLATE/docs_task.yml` | Create | Issue Form for docs/tasks with context, owner, affected area, acceptance checks, risk, and validation path. |
| `.github/ISSUE_TEMPLATE/config.yml` | Create | Chooser config; keep `blank_issues_enabled: true`; include links/names without label assumptions. |

## Template Content Rules

- Use explicit plain-language fields instead of enforcing labels that may not exist.
- Include optional/manual label guidance only as text, for example `type: bug`, `type: feature`, `type: docs`, or `risk: native/oauth`.
- PR verification must list `pnpm test`, `pnpm lint`, and `pnpm typecheck`, with room for “not applicable” notes on docs-only changes.
- Native/OAuth or Play Console changes must state Expo Go is not final evidence; require development build or Play Console testing coordinated by `15luisbeto`.
- The PR template must ask whether the diff is inside the roughly 400-line review budget or needs split/exception.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|---|---|---|---|
| Format | Markdown PR template + YAML Issue Forms | Markdown-only; automation-backed enforcement | Forms improve intake structure while keeping first slice small and reviewable. |
| Labels | Optional/manual text only | YAML `labels:` defaults | Missing labels create friction; maintainers can add labels later. |
| Automation | None | Actions, labeler, PR-size checks | The requirement explicitly excludes CI/workflow automation from this change. |
| Blank issues | Enabled | Disable blank issues | Early team setup needs escape hatches for maintainers. |

## Verification Strategy

- Static review: confirm GitHub Issue Forms use valid YAML keys and required fields are intentional.
- Content review: cross-check templates against `docs/team-architecture-workflow.md`, `docs/local-device-testing.md`, and the delta spec.
- Commands: run `pnpm test`, `pnpm lint`, and `pnpm typecheck` if apply changes are prepared for review; record docs/template-only context.

## Rollout

Apply as one small PR. If the team later wants enforcement, create a separate SDD change for labels, branch protection, GitHub Actions, or PR-size automation after the manual template workflow is proven.
