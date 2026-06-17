# Exploration: team-architecture-workflow

## Current State

HorarioDCIApp is currently a mobile-first Expo Router app, not a client/server product. Routes live under `app/`, shared UI under `components/`, user preferences under `providers/app-preferences.tsx`, and domain/service logic under `lib/`.

Current architecture constraints from the codebase:

| Area | Current constraint | Evidence |
| --- | --- | --- |
| Runtime data | Academic schedules are bundled as a static JSON import, so schedule data changes currently require a new app build/release. | `lib/schedules.ts` imports `@/data/schedules.ugto.2026-1.json`. |
| Domain coupling | Schedule types, search, conflict analysis, favorite creation, PDF HTML generation, and schedule generation live in one large module. | `lib/schedules.ts` contains data types, algorithms, formatting, exports, and PDF builders. |
| Local persistence | User data is local-only using `expo-sqlite/kv-store`; there is no app backend persistence. | `providers/app-preferences.tsx`. |
| External integration | Google Calendar is called directly from the mobile app with an in-memory access token. | `hooks/use-google-calendar-auth.ts`, `lib/google-calendar-events.ts`. |
| Native/OAuth validation | Real OAuth validation depends on an Expo development build, not Expo Go. | `README.md`, `openspec/config.yaml`. |
| Quality gates | Lint and TypeScript are available; no unit/integration/E2E runner is configured. | `package.json`, `openspec/config.yaml`. |
| Backend readiness | No backend project, API client, remote config, schema migrations, or dataset version manifest exists yet. | Directory scan and package scripts. |

## Affected Areas

- `data/` — current static source for academic datasets; future datasets would either expand here or become cached remote payloads.
- `lib/schedules.ts` — central domain module that would need separation into dataset schema, schedule repository, generation algorithms, export builders, and UI-facing selectors before team scaling.
- `app/(tabs)/index.tsx` — consumes schedule data synchronously; remote/hybrid data would require loading/error/version states.
- `app/(tabs)/explore.tsx` — catalog screen currently assumes one local schedule dataset; future institutional pages need generic catalog/page patterns.
- `providers/app-preferences.tsx` — local persistence exists and can also store dataset cache metadata, but should not become a general backend abstraction.
- `lib/google-calendar-*` and `hooks/use-google-calendar-auth.ts` — direct external API integration should remain isolated from institutional dataset delivery.
- `openspec/config.yaml` — already declares hybrid SDD, Expo/TypeScript constraints, quality gates, and risk rules.
- Proposed future docs: `docs/team-workflow.md`, `docs/architecture.md`, `docs/data-schema.md`, or a single reviewable first artifact at `docs/team-architecture-workflow.md`.

## Viability: Frontend/Backend Separation for This App

Separation is viable, but it should be introduced around **data ownership and delivery**, not by turning the product into a web/backend-heavy system immediately.

| Responsibility | Mobile frontend | Data/backend concern |
| --- | --- | --- |
| User experience | Schedule search/generation, favorites, catalog pages, exports, Google Calendar UX. | None, except serving valid data and metadata. |
| Institutional data | Reads typed datasets through a repository interface. | Owns canonical datasets: schedules, research groups, investigators, credit types, study plans, pages. |
| Dataset updates | Displays current cached/bundled data and update status. | Publishes versioned JSON/API payloads and validates schemas. |
| Questionnaires | Renders forms and stores local draft state. | Later: stores submissions, exports responses, manages privacy/consent. |

For this app, the backend does **not** need to own schedule generation initially. Keeping generation on-device preserves offline behavior, avoids server cost, and keeps the product as a mobile app. The backend/data side should first own versioned datasets and optional questionnaires later.

## Approaches

1. **Local-only bundled datasets** — Keep all institutional data in `data/*.json` and release the app each semester.
   - Pros: lowest complexity; works offline; no hosting, auth, API, or caching layer; easy rollback through app releases.
   - Cons: dataset updates require app releases; non-developers cannot easily publish data; bundled data grows with the app; no live corrections.
   - Effort: Low.

2. **Remote API / remote dataset service** — Mobile app fetches datasets from a backend or static API and uses remote data as source of truth.
   - Pros: updates without app releases; backend/data developers can own schema, validation, and publishing; scales to research groups, investigators, study plans, pages, and questionnaires.
   - Cons: requires hosting, monitoring, network states, cache invalidation, version compatibility, possible auth/privacy design for questionnaires.
   - Effort: High if built as a full API now; Medium if implemented first as versioned static JSON behind HTTPS.

3. **Hybrid local fallback + remote sync** — Bundle a known-good dataset, then fetch a version manifest and newer compatible datasets when online.
   - Pros: keeps offline/mobile reliability; enables corrections without app releases; gradual backend adoption; safe rollback by ignoring incompatible remote schema versions.
   - Cons: more client complexity than local-only; needs schema versioning, cache metadata, stale-data UX, and validation pipeline.
   - Effort: Medium.

## Recommended Git/GitHub Workflow for ~4 Developers

| Practice | Recommendation | Why |
| --- | --- | --- |
| Branching | Trunk-based with short-lived feature branches from `main`: `feat/<scope>`, `fix/<scope>`, `docs/<scope>`. | Four developers do not need Git Flow ceremony; short branches reduce merge pain. |
| PR size | Keep PRs near the existing 400-line review budget; split large architecture/data work into chained PRs. | Protects review quality and avoids hidden coupling. |
| Ownership | Use lightweight CODEOWNERS by area: mobile UI/routes, data/schema, integrations, docs/workflow. | Separates responsibility without creating silos. |
| Required checks | Require `pnpm lint` and `pnpm exec tsc --noEmit` before merge. Add tests only after a runner is selected. | Matches current tooling. |
| Data changes | Require schema validation and a dataset changelog/version entry before merge. | Prevents breaking the generator with malformed institutional data. |
| Releases | Use tags/releases for app builds and separate dataset versions for remote/hybrid data. | App version and data version should evolve independently. |
| Issues | Use issue-first planning for features touching data shape, OAuth, persistence, or release behavior. | These are risk-bearing decisions in current OpenSpec rules. |

Suggested team split:

- Mobile frontend devs: Expo Router screens, components, UX states, native/OAuth/export behavior.
- Data/backend devs: schemas, dataset ingestion, validation, version manifests, later questionnaire endpoints.
- Shared contract: TypeScript schema package or generated types consumed by the app and data pipeline.

## Recommendation

Use a **phased hybrid path**: keep the app mobile-first and preserve bundled fallback data, but design the data layer as if datasets can come from either local JSON or a remote versioned source.

Recommended phases:

1. **Document and stabilize contracts first**: create a versionable team document and schema documentation before refactoring. Proposed path: `docs/team-architecture-workflow.md`, with schema details either in the same file or `docs/data-schema.md` if it grows.
2. **Modularize current local data access**: split `lib/schedules.ts` responsibilities in later implementation work, introducing repository/schema boundaries without changing behavior.
3. **Add institutional datasets locally first**: research groups, investigators, credit types, study plans, and static pages can start as typed local JSON with schema validation.
4. **Introduce dataset versioning**: add dataset IDs, `schema_version`, `dataset_version`, `period`, `updated_at`, and source metadata consistently.
5. **Move to remote static delivery before full backend**: publish versioned JSON + manifest over HTTPS; cache with local fallback in the app.
6. **Add a real backend only when questionnaires or authenticated data workflows require it**: avoid backend complexity until submissions, admin editing, or privacy/security requirements justify it.

## Risks

- Schema drift: adding many datasets without validation will make frontend/backend separation brittle.
- Remote update compatibility: the app must reject datasets with incompatible schema versions instead of crashing.
- Offline behavior: remote-only data would weaken the current mobile experience unless cached/fallback data is preserved.
- Ownership ambiguity: if `lib/schedules.ts` remains a large mixed module, four developers will collide frequently.
- Questionnaire scope creep: in-app questionnaires introduce privacy, consent, storage, and possibly institutional compliance concerns.
- No tests yet: refactoring data generation without tests is risky; typecheck/lint are not enough for schedule-combination correctness.
- OAuth constraints: Google Calendar remains native-build-sensitive and should not be mixed with dataset backend decisions.

## Questions

- Who will own dataset publication: developers only, an academic coordinator, or a future admin UI?
- Are institutional datasets public-only, or will any require restricted access?
- What is the expected update frequency: urgent corrections, monthly, semesterly, or semiannual only?
- Should study plans and credit types be versioned by program/year/period?
- Do questionnaires require identity, anonymous submission, or export-only workflows?
- What backend budget/hosting constraints exist, if any?
- Is web support still expected, or is it only a development/testing side effect of Expo?

## Suggested Documentation Artifact Paths

For the later proposal/document phase:

- `docs/team-architecture-workflow.md` — recommended single starting document covering team workflow, architecture, phased roadmap, and ownership.
- `docs/data-schema.md` — split out when dataset schemas become detailed enough to review independently.
- `docs/github-workflow.md` — optional split if PR/release/CODEOWNERS conventions grow beyond one section.
- `openspec/changes/team-architecture-workflow/proposal.md` — SDD proposal artifact for formal change intent.
- `openspec/changes/team-architecture-workflow/design.md` — later technical design once the proposal/spec are approved.

## Ready for Proposal

Yes. The proposal should frame this as a documentation/architecture change first, not a source-code refactor: produce the versionable team workflow, architecture, and schema direction, then plan implementation slices for data boundaries, dataset schemas, and optional remote sync.
