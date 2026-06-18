# Proposal: Minimum Testing Setup

## Intent

Establish the smallest useful automated testing foundation for HorarioDCIApp so the team can protect deterministic schedule/domain behavior before expanding into brittle native or UI test layers.

## Scope

### In Scope
- Add Expo-aligned Jest tooling declarations: `jest`, `jest-expo`, and `@types/jest`.
- Add `package.json` scripts for `test`, `test:watch`, and `typecheck` (`tsc --noEmit`).
- Add minimal Jest configuration using the `jest-expo` preset and project alias support if needed.
- Add first deterministic unit tests for `lib/schedules.ts` behavior only.
- Document how teammates run `pnpm test`, `pnpm lint`, and `pnpm exec tsc --noEmit`/`pnpm typecheck`.

### Out of Scope
- React Native Testing Library, component tests, Expo Router rendering tests, and snapshots.
- OAuth, native redirect, SQLite, PDF/share, Google Calendar, or development-build validation tests.
- Runtime behavior changes, academic data shape changes, persistence changes, or package identifier changes.
- Installing packages during proposal phase.

## Capabilities

### New Capabilities
- `automated-testing-foundation`: Defines the team contract for minimal automated tests, runner commands, and first safe domain-test coverage.

### Modified Capabilities
- None.

## Approach

Use the exploration recommendation: a narrow Jest + `jest-expo` first slice focused on pure schedule/domain tests in `lib/schedules.ts`. Prefer targeted assertions over broad snapshots or full-dataset coupling.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json` | Modified | Add test/typecheck scripts and dev dependency declarations. |
| `pnpm-lock.yaml` | Modified | Lock Expo-compatible test packages when dependencies are installed later. |
| Jest config file or `package.json` Jest field | New/Modified | Configure `jest-expo` preset and aliases if required. |
| `lib/schedules.test.ts` or colocated test path | New | Cover deterministic schedule helpers. |
| docs/README testing section | Modified | Explain team commands and first-slice boundaries. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Expo/Jest version mismatch | Medium | Use SDK 54-compatible installation guidance, not arbitrary latest versions. |
| Dataset-coupled brittle tests | Medium | Use small fixtures or stable, behavior-focused assertions. |
| Scope creep into native/UI tests | Low | Keep RNTL/OAuth/native tests explicitly deferred. |

## Rollback Plan

Remove the test scripts, Jest config, test files, docs section, and added dev dependencies/lockfile entries. No runtime code or data behavior should need rollback.

## Dependencies

- pnpm package management.
- Expo SDK 54-compatible `jest-expo`, `jest`, and `@types/jest` versions.

## Success Criteria

- [ ] `pnpm test` runs deterministic `lib/schedules.ts` tests successfully.
- [ ] `pnpm lint` remains passing for lintable changes.
- [ ] `pnpm exec tsc --noEmit` or `pnpm typecheck` remains passing.
- [ ] Proposal/spec/design keep component, RNTL, OAuth, and native tests out of this first slice.
