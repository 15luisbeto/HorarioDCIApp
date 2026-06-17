# Mobile Data Architecture Specification

## Purpose

Define the contract between mobile UX behavior and data/backend responsibilities while preserving offline-first schedule use.

## Requirements

### Requirement: Mobile-First Data Boundary

The mobile app MUST remain usable with bundled institutional data, and future data/backends SHALL provide versioned, validated datasets without owning mobile presentation behavior.

#### Scenario: Offline schedule use

- GIVEN no network is available
- WHEN a student opens schedule features
- THEN the app MUST use bundled or cached data sufficient for existing schedule behavior
- AND it MUST NOT require a live backend for current schedule generation

#### Scenario: Future remote data source

- GIVEN versioned remote institutional data is available
- WHEN the app evaluates the dataset
- THEN the dataset MUST declare identity, version, and compatibility metadata
- AND the app MUST be able to reject incompatible data without breaking the bundled fallback

#### Scenario: Responsibility split

- GIVEN a feature uses schedules, research groups, investigators, credit types, study plans, static pages, or questionnaires
- WHEN responsibilities are assigned
- THEN mobile MUST own user interaction, offline behavior, and rendering
- AND data/backend concerns MUST own publication, validation, privacy, and lifecycle rules
