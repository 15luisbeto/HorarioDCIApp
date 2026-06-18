# Team Architecture Workflow

## Purpose

Prepare HorarioDCIApp for a team of about four developers while keeping the product mobile-first, offline-capable, and reviewable. This document makes team ownership, Git/GitHub workflow, architecture boundaries, and institutional data contracts explicit before runtime refactors begin.

## Scope

| In scope | What it means |
|---|---|
| Team workflow governance | Branch, issue, PR, review, merge, and release expectations. |
| Mobile/data responsibility split | Mobile owns UX and offline behavior; data/backend owns publication, validation, privacy, and lifecycle rules. |
| Architecture roadmap | Bundled data now, schema/version metadata next, optional static sync later, backend only when justified. |
| Dataset contract template | Required fields and validation expectations for schedules and future institutional datasets. |
| Questionnaire planning | Future personal and anonymous response responsibilities before collection begins. |

## Non-goals

- Do not refactor runtime code in `app/`, `components/`, `hooks/`, `lib/`, `providers/`, or `data/` as part of this workflow document.
- Do not create a backend, questionnaire storage, admin UI, remote sync, test runner, or data schema implementation here.
- Do not change OAuth redirects, app package identifiers, persistence behavior, current schedule JSON shape, or release configuration without a separate reviewed change.

## Project map

| Area | Current role | Ownership notes |
|---|---|---|
| `app/` | Expo Router routes, tabs, settings, exports, favorites, welcome, modal, and OAuth redirect screens. | Mobile UX owns routing, screens, navigation behavior, and user-visible flows. |
| `components/` | Shared presentational UI and Expo template UI primitives. | Mobile UX owns reusable UI consistency and accessibility-friendly presentation. |
| `hooks/` | Client-side hooks including theme behavior and Google Calendar auth orchestration. | Feature owners coordinate hook changes with affected screens and services. |
| `lib/` | Service/domain logic for schedule generation and Google Calendar configuration/events. | Schedule and integration owners keep business rules out of route files where possible. |
| `providers/` | App preferences provider backed by local persistence. | Persistence owner protects storage contracts, migrations, and favorites/settings behavior. |
| `data/` | Bundled institutional schedule dataset, currently `schedules.ugto.2026-1.json`. | Dataset owner/publisher is `15luisbeto`; changes require compatibility and validation notes. |
| `app.config.ts` | Expo app identity, scheme, package/bundle IDs, plugins, typed routes, Google Calendar public config. | Native/OAuth changes are risky and require issue or explicit risk note before implementation. |
| `eas.json` | EAS Android development, preview, and production build profiles. | Release/EAS owner keeps build profile impact visible before release. |

## Ownership matrix

| Responsibility | Primary owner role | Required coordination | Definition of done |
|---|---|---|---|
| Mobile UX | Mobile/frontend developer | Schedule, persistence, data, or integration owner when behavior crosses boundaries. | Screens render expected states, remain usable offline where applicable, and include manual verification notes. |
| Schedule logic | Schedule/domain developer | Dataset publisher and mobile UX owner. | Schedule behavior works from bundled/cached data and does not require a live backend. |
| Local persistence | Persistence developer | Mobile UX owner and release owner for migrations or storage risks. | Favorites/settings remain backward compatible or include reviewed migration/fallback notes. |
| Google Calendar/OAuth | Integration developer | Release/EAS owner and maintainer `15luisbeto`. | OAuth/native validation is done in an Expo development build; Expo Go is not accepted for real redirect validation. |
| Institutional data | Dataset owner/publisher `15luisbeto` | Schedule/domain owner and future backend/data owner. | Dataset identifies type, schema version, owner, compatibility target, sources, validation status/procedure, and fallback expectations. |
| Release/EAS | Release maintainer | Feature owner and repository maintainer `15luisbeto`. | Lint/typecheck status, unresolved risks, version impact, and release notes ownership are visible before merge/release. |

## Git and GitHub workflow

### Branch model

- Use short-lived feature branches from `main`.
- Prefer branch names that expose intent: `feat/schedule-filters`, `fix/calendar-export-timezone`, `docs/team-workflow`.
- Keep branches narrow. A branch should have one clear review purpose and a rollback path.

### Issue-first triggers

Create a GitHub issue or explicit risk note before implementation when a change touches any of these areas:

- OAuth redirects, native schemes, package identifiers, or Google Calendar scopes.
- Local persistence, migrations, or stored favorites/settings behavior.
- Academic data shape, dataset compatibility, or publication process.
- EAS/release configuration.
- Work likely to exceed the 400-line review budget.

### Pull request expectations

Every non-trivial PR should include:

| Field | Required content |
|---|---|
| Scope | What changed and what intentionally did not change. |
| Owner | Person responsible for follow-up and rollback. |
| Affected capability | Example: schedules, favorites, exports, OAuth, institutional data, release. |
| Verification | Commands run and manual checks performed. |
| Risk notes | Directly call out native/OAuth, storage, data-shape, or release risks. |
| Review budget | State whether the PR stays within roughly 400 changed lines or needs an exception/split. |

### Review and merge rules

- PRs should stay within a 400-line review budget unless an exception is documented.
- Prefer one reviewer familiar with the touched capability and one maintainer review for risky changes.
- `main` must not receive direct push or merge without authorization from the repository owner/maintainer, currently `15luisbeto`.
- Do not merge with unresolved lint/typecheck failures unless the maintainer explicitly accepts and records the risk.
- Configure GitHub branch protection for `main` using `docs/branch-protection.md` so CI and PR review enforce this workflow.

### Release readiness checklist

- [ ] `pnpm lint` status is visible when lintable source changed.
- [ ] `pnpm exec tsc --noEmit` status is visible when TypeScript-sensitive source or examples changed.
- [ ] OAuth/native changes were validated in a development build, not only Expo Go.
- [ ] Release notes owner is identified.
- [ ] Risk exceptions and rollback plan are documented.

## Architecture roadmap

| Phase | Direction | Why |
|---|---|---|
| 1. Bundled fallback now | Keep schedules available from bundled app data. | Current student schedule behavior must work offline and must not require a live backend. |
| 2. Schema/version metadata next | Add explicit dataset identity, schema version, publisher, compatibility target, sources, and validation procedure before expanding datasets. | Prevents schema drift as schedules, research groups, investigators, credit types, study plans, and static pages grow. |
| 3. Optional HTTPS static JSON sync later | Fetch versioned remote data, validate it, cache compatible data, and fall back to bundled data on error or incompatibility. | Supports institutional updates without backend operational cost. |
| 4. Backend only when justified | Introduce a backend for questionnaires, authenticated submissions, admin publishing, or sensitive data workflows. | Backend complexity is justified by privacy, write operations, auditability, and administration needs — not by read-only schedule data alone. |

### Responsibility boundary

| Capability | Mobile owns | Data/backend owns |
|---|---|---|
| Schedules | Rendering, filtering, interactions, offline fallback, export UX. | Dataset publication, schema versioning, source provenance, validation. |
| Research groups and investigators | Discovery UX, details screens, cached/offline presentation rules. | Authoritative records, update cadence, source metadata, validation. |
| Credit types and study plans | Student-facing navigation and compatibility messaging. | Contract definitions, version history, migration/fallback notes. |
| Static institutional pages | Reading experience and offline behavior. | Content lifecycle, publication ownership, source review. |
| Questionnaires | User interaction, accessibility, consent UI, submission state. | Privacy, storage, submission endpoint, retention, anonymity model, audit requirements. |

## Dataset contract template

Before a dataset is bundled, fetched, cached, or expanded beyond current schedule data, document this contract.

| Field | Required? | Description |
|---|---:|---|
| Dataset identity | Yes | Stable dataset key, for example `schedules.ugto`. |
| Schema version | Yes | Distinguishable version such as `1.0.0`; shape changes require a new version. |
| Publisher/owner | Yes | Initial owner is `15luisbeto`. |
| Compatibility target | Yes | App version, feature version, or compatibility range expected to consume the dataset. |
| Updated at | Yes | Publication timestamp or academic-period timestamp. |
| Sources | Yes | Source labels, URLs or internal references, and optional source update timestamps. |
| Validation | Yes | `validated`, `manual`, or `unknown`, plus procedure when available. |
| Records | Yes | Dataset-specific payload. |
| Migration/fallback | Yes for shape changes | How the app handles older cached data, incompatible data, or missing data. |

### Example contract shape

```ts
type InstitutionalDataset<T> = {
  dataset: string;
  schemaVersion: string;
  publisher: '15luisbeto' | string;
  compatibleApp: string;
  updatedAt: string;
  sources: Array<{ label: string; url: string; updatedAt?: string }>;
  validation: { status: 'validated' | 'manual' | 'unknown'; procedure?: string };
  records: T[];
};
```

### Evolution rules

- Additive optional fields may keep the same major schema version when older app versions can safely ignore them.
- Required field changes, renamed fields, semantic meaning changes, or removed fields require a distinguishable schema version.
- Incompatible remote data must be rejected without breaking the bundled fallback.
- Dataset PRs must include source provenance and validation notes; if validation is manual or unknown, say so clearly.

## Future questionnaires

Questionnaires may collect both personal and anonymous responses in the future. Do not start collection until these responsibilities are defined and reviewed.

| Area | Personal responses | Anonymous responses |
|---|---|---|
| Privacy | Consent, identity fields, purpose, and access policy must be explicit. | Anonymity guarantees and limits must be explicit; avoid collecting indirect identifiers by accident. |
| Storage | Backend storage, access controls, audit needs, and deletion path are required. | Storage must preserve anonymity; retention and aggregation rules must be reviewed. |
| Submission | Authenticated or identity-linked submission flow may be required. | Submission flow should avoid accidental identity linkage unless disclosed. |
| Retention | Retention period and deletion responsibility must be documented. | Aggregation, expiration, and raw-response retention must be documented. |
| Backend trigger | Full backend is likely required before collecting sensitive personal submissions. | Backend may still be required for safe collection, abuse prevention, and retention control. |

## Verification guidance

| Change type | Verification |
|---|---|
| Docs-only changes | Check spelling, links, scope, and consistency with OpenSpec artifacts. Record when no lintable source changed. |
| Lintable source changes | Run `pnpm lint`. |
| TypeScript-sensitive changes | Run `pnpm exec tsc --noEmit` because there is no `typecheck` package script. |
| Schedule behavior | Manually verify existing schedule generation and relevant favorites/export behavior. Expo Go is acceptable for local UI/data checks. |
| Google OAuth/native redirects | Use an Expo development build. Expo Go is insufficient for the real Google OAuth flow. |
| Future dataset changes | Validate dataset identity, schema version, publisher, compatibility target, sources, validation procedure, migration, and fallback behavior. |

## Scenario cross-check

| Spec scenario | Covered by |
|---|---|
| Normal feature review | Git/GitHub workflow, PR expectations, review budget. |
| Risky native or OAuth change | Issue-first triggers, ownership matrix, OAuth development-build validation. |
| Release readiness | Release checklist and verification guidance. |
| Offline schedule use | Architecture roadmap and mobile/data responsibility boundary. |
| Future remote data source | Roadmap phase 3 and dataset contract fallback rules. |
| Responsibility split | Ownership matrix and responsibility boundary. |
| Dataset publication | Dataset contract template. |
| Schema evolution | Dataset evolution rules. |
| Sensitive questionnaire data | Future questionnaires section for personal and anonymous responses. |
