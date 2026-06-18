# Automated Testing Foundation Specification

## Purpose

Define the minimum automated testing contract for HorarioDCIApp: runner commands, Expo-compatible Jest setup, deterministic schedule-domain tests, excluded test layers, and team verification expectations.

## Requirements

### Requirement: Test Runner Commands

The project MUST expose pnpm scripts that let teammates run the automated test suite and TypeScript verification consistently. `test` MUST run the deterministic Jest suite, `test:watch` SHOULD run the same suite in watch mode, and `typecheck` MUST execute `tsc --noEmit`.

#### Scenario: Teammate runs tests locally

- GIVEN dependencies are installed with pnpm
- WHEN a teammate runs `pnpm test`
- THEN the configured Jest suite MUST execute without requiring native device access

#### Scenario: Teammate runs type-sensitive verification

- GIVEN TypeScript strict mode is enabled
- WHEN a teammate runs `pnpm typecheck`
- THEN it MUST perform the same verification as `pnpm exec tsc --noEmit`

### Requirement: Expo SDK-Compatible Jest Configuration

The test setup MUST use Expo SDK-compatible Jest tooling, including the `jest-expo` preset and compatible `jest`/`@types/jest` declarations. The configuration MUST support project imports used by the tested domain code, including the `@/*` alias when tests require it.

#### Scenario: Jest starts in the Expo app context

- GIVEN the project has Expo SDK-compatible Jest dependencies
- WHEN `pnpm test` starts
- THEN Jest MUST load with the `jest-expo` preset
- AND module aliases needed by tested code MUST resolve

#### Scenario: Dependency versions are selected

- GIVEN testing dependencies are added
- WHEN versions are chosen
- THEN they MUST be compatible with the app's Expo SDK rather than arbitrary latest releases

### Requirement: First Deterministic Schedule Domain Tests

The first suite MUST cover deterministic behavior in `lib/schedules.ts` only. Tests MUST prefer small fixtures or stable behavior-focused assertions over broad snapshots, full-dataset coupling, or runtime behavior changes.

#### Scenario: Deterministic schedule helper behavior is protected

- GIVEN a schedule helper receives stable input data
- WHEN its Jest test executes
- THEN the expected schedule-domain result MUST be asserted deterministically

#### Scenario: Dataset coupling is avoided

- GIVEN a test can pass by relying on the entire production academic dataset
- WHEN the test is authored
- THEN it SHOULD instead use a minimal stable fixture or targeted assertion

### Requirement: Native, OAuth, and Component Tests Excluded

This foundation MUST NOT introduce React Native Testing Library, component tests, Expo Router rendering tests, snapshots, OAuth/native redirect tests, SQLite tests, PDF/share tests, Google Calendar tests, integration tests, or E2E tests.

#### Scenario: Native OAuth validation is requested

- GIVEN a teammate wants to validate Google OAuth or native redirects
- WHEN they inspect this testing foundation
- THEN they MUST see that such validation is out of scope
- AND real OAuth/native validation SHALL remain tied to an Expo development build or Play-distributed test build

### Requirement: Team Verification Expectations

Documentation or workflow notes MUST tell teammates to run `pnpm test`, `pnpm lint`, and `pnpm typecheck` or `pnpm exec tsc --noEmit` before review. CI, if configured in this change or later, SHOULD run the same commands and MUST NOT require secrets or native credentials for this first suite.

#### Scenario: Reviewer checks a testing setup change

- GIVEN a PR affects the testing foundation or schedule-domain tests
- WHEN the PR is prepared for review
- THEN its verification notes MUST include test, lint, and typecheck outcomes

### Requirement: Future Strict TDD Enablement

After the runner exists and `pnpm test` is reliable, future changes MAY enable strict TDD policy for eligible deterministic domain work. Strict TDD MUST NOT be required before this foundation is implemented and verified.

#### Scenario: Strict TDD is considered later

- GIVEN the Jest runner is installed and passing
- WHEN the team updates SDD testing policy
- THEN strict TDD MAY be enabled for suitable domain changes
- AND native or OAuth work MAY still require separate manual/development-build validation
