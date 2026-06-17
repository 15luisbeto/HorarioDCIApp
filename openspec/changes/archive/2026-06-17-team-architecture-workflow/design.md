# Design: Team Architecture Workflow

## Technical Approach

This is a docs/architecture change, not a runtime refactor. The future `docs/team-architecture-workflow.md` will codify how a four-person team changes an Expo Router app whose UI lives in `app/` and `components/`, domain services in `lib/`, preferences in `providers/app-preferences.tsx`, and bundled academic data in `data/schedules.ugto.2026-1.json`. The design preserves current offline schedule generation from `lib/schedules.ts` and treats Google Calendar/OAuth as a native-risk integration requiring development builds.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Delivery model | Mobile-first app with bundled/cached datasets | Backend-first rewrite | Current schedule features depend on local JSON and SQLite preferences; a backend now would add operational cost without solving current user needs. |
| Data roadmap | Phase 1 bundled JSON, Phase 2 schema/version metadata, Phase 3 optional HTTPS static JSON sync, Phase 4 backend only for questionnaires/auth/admin publishing | Direct database/API for all datasets | Versioned static data keeps offline reliability while allowing institutional updates; sensitive submissions are the real backend trigger. |
| Team workflow | Trunk-based GitHub flow with short-lived feature branches, issue-first risky work, PR template/checklist, 400-line review budget | Long-lived dev branch or informal direct commits | Four developers need low merge debt and visible risk ownership; small PRs protect review quality. |
| Dataset contracts | Add explicit dataset identity, schema version, publisher, compatibility target, source metadata, and validation procedure before expanding datasets | Keep ad hoc JSON shapes | Current schedule JSON has useful metadata but no schema identity/compatibility field, so future datasets would drift. |

## Data Flow

Current flow remains:

```txt
data/schedules.ugto.2026-1.json ──→ lib/schedules.ts ──→ app/(tabs)/index.tsx
                                      │
                                      └── favorites types ──→ providers/app-preferences.tsx ──→ expo-sqlite kv-store
favorites/settings ──→ lib/google-calendar-* ──→ Google Calendar API
```

Future remote static sync must be additive:

```txt
bundled dataset ── fallback ─┐
remote versioned JSON ─ validate ─ compatible? ─ cache/use
                              └─ incompatible/error ─ use bundled fallback
```

## Future Team Document Structure

`docs/team-architecture-workflow.md` should contain:

1. **Project map**: `app/`, `components/`, `hooks/`, `lib/`, `providers/`, `data/`, `app.config.ts`, `eas.json`.
2. **Ownership matrix**: mobile UX, schedule logic, local persistence, Google Calendar/OAuth, institutional data, release/EAS.
3. **Git/GitHub workflow**: branch naming, issue-first triggers, PR size budget, required PR fields, reviewers, merge/release checklist.
4. **Architecture roadmap**: mobile-first now; schema contracts next; optional remote static sync; backend later for questionnaires/auth/admin publishing.
5. **Dataset contract template**: fields, validation expectations, versioning/evolution rules, fallback behavior.
6. **Testing/verification**: current commands, manual checks, and future test runner recommendation.

## File Changes

| File | Action | Description |
|---|---|---|
| `openspec/changes/team-architecture-workflow/design.md` | Create | This design artifact. |
| `docs/team-architecture-workflow.md` | Create later | Human-facing team architecture/workflow document. |
| `data/` | Plan later | Add dataset metadata/contracts without changing current data in this phase. |
| `lib/schedules.ts` | Plan later | Potentially split validation/loading from schedule generation after contracts exist. |

## Interfaces / Contracts

Future institutional datasets should converge on this envelope before adding new sources:

```ts
type InstitutionalDataset<T> = {
  dataset: string;
  schemaVersion: string;
  publisher: string;
  compatibleApp: string;
  updatedAt: string;
  sources: Array<{ label: string; url: string; updatedAt?: string }>;
  validation: { status: 'validated' | 'manual' | 'unknown'; procedure?: string };
  records: T[];
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Static quality | Docs links, TypeScript-sensitive examples | `pnpm lint`; `pnpm exec tsc --noEmit` if TS files/examples are touched. |
| Manual app checks | Schedule generation, favorites, exports | Expo Go is acceptable for local UI/data behavior. |
| Native/OAuth | Google redirect and Calendar sync | Development build only; Expo Go is insufficient. |
| Future automated tests | Schedule algorithms and dataset validation | Add a unit runner before enforcing TDD. |

## Migration / Rollout

No migration required. This phase only creates SDD design. Apply should create the docs file first, then any later data/schema work in separate reviewable PRs.

## Resolved Decisions

- Institutional dataset publisher/owner: `15luisbeto`.
- GitHub `main` governance: no direct push or merge to `main` without prior authorization from repository owner/maintainer, currently `15luisbeto`.
- Future questionnaires may collect both personal and anonymous responses; privacy, storage, submission, and retention responsibilities must cover both modes before collection.
