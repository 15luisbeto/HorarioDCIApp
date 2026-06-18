# Automated Testing Foundation Delta: GitHub Actions CI

## ADDED Requirements

### Requirement: GitHub Actions CI Verification

The project MUST provide a GitHub Actions workflow that runs the established automated verification commands for pull requests and pushes to `main`. The workflow MUST install dependencies with pnpm from the committed lockfile and MUST run `pnpm test`, `pnpm lint`, and `pnpm typecheck` without requiring secrets, `.env`, native build credentials, EAS credentials, or OAuth validation.

#### Scenario: Pull request runs automated checks

- GIVEN a pull request is opened or updated
- WHEN GitHub Actions executes the CI workflow
- THEN it MUST install dependencies with `pnpm install --frozen-lockfile`
- AND it MUST run `pnpm test`, `pnpm lint`, and `pnpm typecheck`

#### Scenario: Main branch push runs automated checks

- GIVEN changes are pushed to `main`
- WHEN GitHub Actions executes the CI workflow
- THEN the same test, lint, and typecheck commands MUST run

#### Scenario: CI avoids secret-backed validation

- GIVEN the CI workflow is inspected
- WHEN a teammate reviews the workflow steps
- THEN it MUST NOT reference repository secrets, `.env` files, EAS commands, native Android/iOS builds, or OAuth redirect validation
