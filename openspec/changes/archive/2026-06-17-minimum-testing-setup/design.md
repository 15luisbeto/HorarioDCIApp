# Design: Minimum Testing Setup

## Technical Approach

Add the smallest Expo-aligned Jest layer: scripts in `package.json`, dev dependency declarations for Jest tooling, a focused `jest.config.js`, one `lib/schedules.test.ts` suite, and README command docs. The suite will exercise exported deterministic schedule helpers with local fixtures where possible, keeping native, OAuth, component, SQLite, PDF/share, integration, E2E, and snapshot tests out of this slice per `automated-testing-foundation`.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Runner preset | Use Jest with `preset: "jest-expo"`. | Plain `ts-jest`; Babel-only custom Jest config. | `jest-expo` matches Expo SDK behavior and avoids inventing unsupported transform setup. |
| Config location | Create `jest.config.js` with CommonJS export. | Inline `package.json` Jest field. | Existing config style uses CommonJS (`eslint.config.js`); a file keeps alias/preset config reviewable. |
| Alias handling | Add `moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" }`. | Rely on Expo defaults only. | `lib/schedules.ts` imports `@/data/...`; explicit mapping prevents runner/path drift from TypeScript paths. |
| First tests | Co-locate `lib/schedules.test.ts` beside `lib/schedules.ts`. | Global `__tests__/`; component tests. | Keeps schedule-domain coverage discoverable and avoids UI/native test scope. |
| Assertions | Use small `CourseEntry` fixtures for exported pure helpers; only targeted dataset assertions if unavoidable. | Snapshots or asserting large production dataset counts. | Protects behavior without coupling tests to every semester data row. |
| Typecheck script | Add `typecheck: "tsc --noEmit"`. | Keep only `pnpm exec tsc --noEmit`. | Spec requires a consistent command and project standards already use strict TypeScript. |

## Data Flow

```txt
pnpm test
  └─ jest.config.js ── preset jest-expo + @ alias
       └─ lib/schedules.test.ts
            └─ imports lib/schedules.ts ── reads static JSON through @/data alias
                 └─ asserts deterministic exported helper results
```

No app route, hook, SQLite, OAuth, or native device flow participates in this change.

## File Changes

| File | Action | Description |
|---|---|---|
| `package.json` | Modify | Add `test`, `test:watch`, `typecheck`; declare `jest`, `jest-expo`, `@types/jest` as dev dependencies. |
| `pnpm-lock.yaml` | Modify | Lock Expo SDK-compatible testing packages when installed during apply. |
| `jest.config.js` | Create | Configure `jest-expo` preset, alias mapping, and test file matching if needed. |
| `lib/schedules.test.ts` | Create | Unit tests for deterministic exports such as `normalizeSearchValue`, `formatTeachers`, `formatCourseLabel`, `buildScheduleOptionFromCourses`, and `formatFavoriteExportText`. |
| `README.md` | Modify | Add automated verification commands: `pnpm test`, `pnpm lint`, `pnpm typecheck`; state OAuth/native validation remains development-build-only. |

## Interfaces / Contracts

Package scripts:

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "typecheck": "tsc --noEmit"
}
```

Jest config contract:

```js
module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
};
```

Dependencies must be selected through Expo/pnpm-compatible install guidance for SDK 54, not arbitrary latest versions.

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| Unit | Deterministic `lib/schedules.ts` exported schedule/domain helpers. | Jest with local `CourseEntry` fixtures and behavior assertions. |
| Integration | None in this slice. | Explicitly deferred. |
| E2E/native | None in this slice. | OAuth/native validation remains manual/development-build documented flow. |

Verification after apply: `pnpm test`, `pnpm lint`, and `pnpm typecheck`.

## Migration / Rollout

No migration required. This adds development-only tooling, tests, and docs; no runtime behavior or data shape changes.

## Open Questions

- [ ] Confirm exact SDK 54-compatible package versions during apply using Expo tooling before editing `pnpm-lock.yaml`.
