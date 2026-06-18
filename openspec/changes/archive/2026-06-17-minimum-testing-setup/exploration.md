## Exploration: minimum-testing-setup

### Current State
The app is an Expo Router project using Expo SDK 54, React Native 0.81.5, React 19.1.0, TypeScript strict mode, pnpm, and path alias `@/*`. `package.json` has `start`, native/web launch scripts, and `lint`, but no `test`, `test:watch`, `typecheck`, Jest config, or direct test dependencies. No project test files were found. `pnpm-lock.yaml` contains transitive Jest packages from Expo tooling, but the root importer does not declare Jest, `jest-expo`, `@types/jest`, `@testing-library/react-native`, or `react-test-renderer` as dev dependencies.

The best first testing surface is pure schedule/domain logic in `lib/schedules.ts`: it exports deterministic functions for search normalization, course filtering, conflict analysis, schedule generation, favorite creation, export text, and PDF HTML generation. App screens consume those functions from `app/(tabs)/index.tsx`, `app/favorites.tsx`, and `app/exports.tsx`, so domain tests protect user-visible behavior without touching native modules, OAuth redirects, Expo Router rendering, SQLite, or device-only flows.

Expo SDK 54 documentation recommends Jest with the `jest-expo` preset and installing `jest-expo`, `jest`, and `@types/jest`. React Native Testing Library is available for component tests, but its docs note that it depends on a matching `react-test-renderer` version and React 19 projects should use async-ready APIs such as `renderAsync` from the start.

### Affected Areas
- `package.json` — future change would add root dev dependencies, Jest config, `test`, `test:watch`, and likely `typecheck` scripts.
- `pnpm-lock.yaml` — future dependency install would update the lockfile through pnpm/Expo install tooling.
- `lib/schedules.ts` — first safe target for deterministic unit tests around generation, conflicts, search, labels, and export formatting.
- `data/schedules.ugto.2026-1.json` — imported by `lib/schedules.ts`; tests can start against exported dataset behavior or use exported builders with small fixtures where possible.
- `app/(tabs)/index.tsx` — benefits from tested schedule generation and conflict-analysis behavior, but should not be the first test target.
- `app/favorites.tsx` — benefits from tested favorite schedule preview/building behavior, but component tests can wait.
- `app/exports.tsx`, `hooks/use-google-calendar-auth.ts`, `lib/google-calendar-events.ts`, `lib/google-calendar-config.ts` — OAuth/native/export behavior should be explicitly out of the first automated slice to avoid brittle native and redirect tests.
- `openspec/config.yaml` — currently records no test runner and no typecheck script; later proposal/design may update quality rules after test setup lands.

### Approaches
1. **Pure TypeScript/domain tests first with Jest + jest-expo** — Install the Expo-aligned Jest stack, add scripts/config, and write the first tests for `lib/schedules.ts` only.
   - Pros: Smallest useful safety net, aligns with Expo docs, avoids native/OAuth brittleness, protects core schedule generation, keeps PR review size low for a four-person team.
   - Cons: Does not validate screen rendering or user interactions yet; `lib/schedules.ts` imports the full JSON dataset, so tests should avoid becoming large snapshot/data-coupled checks.
   - Effort: Low

2. **Full React Native Testing Library setup immediately** — Install Jest + `jest-expo` + `@testing-library/react-native` + matching `react-test-renderer`, configure setup matchers, and write component tests.
   - Pros: Establishes the future component-testing stack in one change; can test visible UI behavior and accessibility-oriented queries.
   - Cons: Higher compatibility surface with React 19 async rendering, `react-test-renderer` peer matching, Expo Router/provider wrappers, native module mocks, and larger review size.
   - Effort: Medium

3. **Vitest for pure TypeScript only** — Add a fast Node-oriented unit runner just for `lib/` modules.
   - Pros: Fast and simple for isolated TypeScript functions.
   - Cons: Not Expo’s documented path, separate toolchain from future React Native component tests, extra configuration for TS/aliases/JSON imports, and likely migration cost when component tests arrive.
   - Effort: Medium

### Recommendation
Proceed with Approach 1: install the Expo-aligned Jest runner first and test only pure schedule/domain behavior in `lib/schedules.ts`. Add scripts as a minimum: `test` for non-watch execution, `test:watch` for local feedback, and `typecheck` as `tsc --noEmit` so the team has one clear command for strict TypeScript verification. Keep React Native Testing Library out of the first slice unless the team explicitly wants the larger stack now; add it in a second, focused change using React 19 async-ready APIs and a matching `react-test-renderer` version.

Recommended first test cases after runner setup:
- `normalizeSearchValue` removes accents, lowercases, and trims.
- `searchCourseNames` excludes already selected names and respects the limit.
- `analyzeCourseConflicts` returns `idle` for fewer than two selected courses and detects warning/impossible states from real selected course names.
- `generateSchedules` returns no options for empty input and respects result limits/count caps for selected names.
- `buildScheduleOptionFromCourses` sorts courses and sessions deterministically.
- `formatFavoriteExportText` produces stable human-readable export text from a small fixture.

Recommended Strict TDD policy: strict TDD should remain disabled until the runner is installed and at least one deterministic domain test exists. After this change lands, enable Strict TDD for future pure domain changes under `lib/` first: RED test for expected schedule behavior, GREEN implementation, REFACTOR with `pnpm test`, `pnpm lint`, and `pnpm typecheck`. Do not require Strict TDD yet for OAuth/native redirect validation because real OAuth requires an Expo development build and should not be modeled as brittle unit tests.

### Risks
- Expo/Jest compatibility must follow SDK 54-compatible packages; use Expo install tooling or exact Expo-compatible versions rather than arbitrary latest versions.
- React 19 component tests require React Native Testing Library async-ready patterns and a `react-test-renderer` version matching `react@19.1.0`; adding this too early increases risk.
- `lib/schedules.ts` imports static JSON data, so broad assertions against the whole dataset can become brittle when academic data changes.
- Native/OAuth modules (`expo-auth-session`, redirects, sharing, print, SQLite) may require mocks or development-build validation; they should stay outside the first automated slice.
- No current runner means the first implementation PR must prove setup with both a passing test command and existing `pnpm lint` / `pnpm exec tsc --noEmit` verification.

### Ready for Proposal
Yes — recommend a narrow proposal for a minimum Jest + `jest-expo` setup, `test`/`test:watch`/`typecheck` scripts, and initial deterministic tests for `lib/schedules.ts` only. The orchestrator should tell the user that component/RNTL and OAuth/native tests are intentionally deferred to protect review size and avoid brittle first tests.
