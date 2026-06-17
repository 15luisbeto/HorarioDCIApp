# Institutional Data Schema Specification

## Purpose

Define versionable contracts for schedule data and future institutional datasets.

## Requirements

### Requirement: Versionable Institutional Dataset Contract

Institutional datasets MUST have explicit schema identity, version, ownership, compatibility, and validation expectations before they are expanded beyond current schedule data. The initial institutional dataset publisher/owner is `15luisbeto`.

#### Scenario: Dataset publication

- GIVEN a dataset is prepared for app consumption
- WHEN it is published or bundled
- THEN it MUST identify dataset type, schema version, publisher/owner, and compatibility target
- AND it SHOULD include a validation status or validation procedure

#### Scenario: Schema evolution

- GIVEN a dataset shape changes
- WHEN the change is reviewed
- THEN the new schema version MUST be distinguishable from previous versions
- AND migration or fallback expectations MUST be documented before adoption

#### Scenario: Sensitive questionnaire data

- GIVEN questionnaires are introduced later
- WHEN questionnaire data includes personal or anonymous responses
- THEN the schema MUST define privacy, storage, submission, and retention responsibilities for both modes
- AND a full backend MAY be required before collection begins
