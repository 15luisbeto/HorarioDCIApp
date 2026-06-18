# Team Workflow Governance Delta Specification

## Purpose

Extend team workflow governance with GitHub collaboration templates that make review expectations visible before implementation and review.

## MODIFIED Requirements

### Requirement: Reviewable Team Workflow

Team changes MUST use traceable Git/GitHub practices that keep ownership, risk, review size, and release readiness explicit. Risky work SHOULD start from an issue; PRs SHOULD stay within a 400-line review budget unless an exception is documented. Direct push or merge to `main` MUST NOT occur without prior authorization from the repository owner/maintainer, currently `15luisbeto`. Repository templates MUST prompt contributors for linked issue, owner, scope, affected capability, verification, risk notes, native/OAuth validation path when relevant, and review-budget status.

#### Scenario: Normal feature review

- GIVEN a developer starts a non-trivial app change
- WHEN they open a PR
- THEN the PR template MUST prompt for linked issue, change type, owner, scope, verification, and affected capability
- AND it SHOULD prompt for whether the PR remains within the 400-line review budget or needs a documented exception/split

#### Scenario: Risky native or OAuth change

- GIVEN a change affects OAuth, native redirects, package identifiers, storage, data shape, Play Console, or release configuration
- WHEN the work is proposed through an issue or PR
- THEN the relevant template MUST prompt for a risk category and explicit validation path
- AND OAuth/native validation MUST require a development build or Play Console-distributed build rather than Expo Go

#### Scenario: Release readiness

- GIVEN a release candidate is prepared
- WHEN maintainers review readiness
- THEN lint/typecheck status, unresolved risk exceptions, and ownership of release notes MUST be visible

## ADDED Requirements

### Requirement: Structured Collaboration Intake

The repository MUST provide GitHub issue templates for bug reports, feature requests, and docs/tasks. These templates MUST capture owner, context, acceptance criteria or expected outcome, risk category, and validation path. Templates MUST NOT require labels that may not exist unless those labels are clearly documented as optional/manual maintainer metadata.

#### Scenario: Bug report intake

- GIVEN a teammate reports a defect
- WHEN they select the bug report template
- THEN the form MUST prompt for observed behavior, expected behavior, context/environment, owner, risk category, and reproduction or validation path

#### Scenario: Feature request intake

- GIVEN a teammate proposes a feature
- WHEN they select the feature request template
- THEN the form MUST prompt for problem/context, proposed outcome, owner, scope or non-goals, acceptance criteria, risk category, and validation path

#### Scenario: Docs or task intake

- GIVEN a teammate creates non-bug/non-feature work
- WHEN they select the docs/task template
- THEN the form MUST prompt for owner, task context, acceptance criteria, affected area, risk category, and validation path

### Requirement: Template-Only First Slice

The first collaboration-template change MUST NOT add CI, workflow automation, labeler configuration, branch protection, or enforcement bots.

#### Scenario: First slice implementation

- GIVEN the templates are implemented
- WHEN maintainers review the diff
- THEN only `.github/` template files and OpenSpec change artifacts SHOULD be changed
- AND no GitHub Actions workflow or automation configuration SHALL be introduced
