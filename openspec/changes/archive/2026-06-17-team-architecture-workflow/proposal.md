# Proposal: Team Architecture Workflow

## Intent

Prepare HorarioDCIApp for ~4 developers without turning it into a backend-first product. The app remains mobile-first, while team workflow, responsibility boundaries, and institutional data contracts become explicit and versionable before source refactors begin.

## Scope

### In Scope
- Define a later deliverable: `docs/team-architecture-workflow.md` covering Git/GitHub workflow, ownership, architecture boundaries, roadmap, and schema direction.
- Specify mobile frontend vs data/backend responsibilities for schedules, research groups, investigators, credit types, study plans, static institutional pages, and later questionnaires.
- Propose phased data delivery: bundled fallback now, schema/version metadata next, optional remote static sync before a full backend.
- Establish review workflow expectations: short-lived branches, issue-first risky work, 400-line review budget, lint/typecheck gates.

### Out of Scope
- Source refactors in `app/`, `components/`, `hooks/`, `lib/`, or `data/`.
- Creating production backend, questionnaire storage, admin UI, or remote sync implementation now.
- Changing OAuth redirects, package identifiers, persistence behavior, or current schedule data shape.

## Capabilities

### New Capabilities
- `team-workflow-governance`: Git/GitHub branch, PR, ownership, review, and release practices for a four-person team.
- `mobile-data-architecture`: Responsibility split between mobile UX and data/backend concerns, preserving offline mobile behavior.
- `institutional-data-schema`: Versionable dataset contracts for schedules and future institutional datasets.

### Modified Capabilities
- None; `openspec/specs/` currently has no existing capability specs.

## Approach

Create architecture/spec artifacts first, then design the future team document. Prefer a phased hybrid path: keep bundled datasets as reliable fallback, add schema/version metadata, and only later introduce HTTPS-hosted versioned JSON plus cache rules. A full backend waits until questionnaires, authenticated submissions, or admin publishing justify it.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docs/team-architecture-workflow.md` | New | Planned later versionable team document. |
| `openspec/changes/team-architecture-workflow/` | New | Proposal/spec/design/tasks for this architecture workflow change. |
| `data/` | Planned | Future typed institutional datasets and version metadata. |
| `lib/schedules.ts` | Planned | Future boundary split; no refactor in this phase. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Overdesigning backend too early | Med | Document hybrid path; defer backend build. |
| Schema drift across datasets | High | Require versioned schemas and validation before data expansion. |
| Team workflow ignored | Med | Make practices versionable and reviewable in docs. |

## Rollback Plan

Revert this change folder and any later docs-only artifacts. Since no runtime code, data shape, OAuth, storage, or release config changes are made, app behavior remains unchanged.

## Dependencies

- Existing Expo Router/TypeScript project conventions and OpenSpec rules.
- Future agreement on dataset publisher, data access level, and questionnaire privacy model.

## Success Criteria

- [ ] Specs can be written for all three listed capabilities without placeholders.
- [ ] Later design clearly plans `docs/team-architecture-workflow.md` before refactors.
- [ ] Proposal preserves mobile-first product direction and avoids premature backend implementation.
