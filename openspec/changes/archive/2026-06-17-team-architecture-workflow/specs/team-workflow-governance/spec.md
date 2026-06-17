# Team Workflow Governance Specification

## Purpose

Define team operating rules for branches, PRs, ownership, reviews, and releases for a four-person HorarioDCIApp team.

## Requirements

### Requirement: Reviewable Team Workflow

Team changes MUST use traceable Git/GitHub practices that keep ownership, risk, review size, and release readiness explicit. Risky work SHOULD start from an issue; PRs SHOULD stay within a 400-line review budget unless an exception is documented. Direct push or merge to `main` MUST NOT occur without prior authorization from the repository owner/maintainer, currently `15luisbeto`.

#### Scenario: Normal feature review

- GIVEN a developer starts a non-trivial app change
- WHEN they open a PR
- THEN the PR MUST describe scope, owner, verification, and affected capability
- AND it SHOULD remain within the 400-line review budget

#### Scenario: Risky native or OAuth change

- GIVEN a change affects OAuth, native redirects, package identifiers, storage, data shape, or release configuration
- WHEN the work is proposed
- THEN an issue or explicit risk note MUST exist before implementation
- AND OAuth/native validation MUST require a development build rather than Expo Go

#### Scenario: Release readiness

- GIVEN a release candidate is prepared
- WHEN maintainers review readiness
- THEN lint/typecheck status, unresolved risk exceptions, and ownership of release notes MUST be visible
