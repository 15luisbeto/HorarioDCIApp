# Proposal: GitHub Collaboration Templates

## Intent

Make the existing team workflow executable in GitHub by adding lightweight PR and issue templates that surface ownership, scope, verification, risk, native/OAuth testing limits, and the 400-line review budget before review starts.

## Scope

### In Scope
- Add a pull request template under `.github/` for linked issue, change type, owner, scope, verification, risk notes, device/build validation, and review-size budget.
- Add structured issue forms for bugs, feature requests, and docs/tasks under `.github/ISSUE_TEMPLATE/`.
- Add an issue-template chooser config that keeps blank issues enabled and avoids assuming labels already exist.
- Extend `team-workflow-governance` specs to require collaboration templates/checklists.

### Out of Scope
- GitHub Actions, labeler automation, branch protection, CI enforcement, or PR-size bots.
- Runtime code, Expo config, OAuth redirect/package identifiers, persistence behavior, data shape, or release configuration changes.
- Requiring labels that may not exist in the repository.

## Capabilities

### Modified Capabilities
- `team-workflow-governance`: add template/checklist requirements for PRs and issue intake.

## Approach

Use the minimal docs/governance slice from exploration: one Markdown PR template plus GitHub Issue Forms. The forms will ask contributors to write owner, context, acceptance criteria, risk category, and validation path in plain text. Optional labels can be mentioned as manual maintainer metadata, not enforced YAML defaults.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `.github/PULL_REQUEST_TEMPLATE.md` | New | Review checklist aligned with team workflow and local-device testing rules. |
| `.github/ISSUE_TEMPLATE/bug_report.yml` | New | Structured bug intake. |
| `.github/ISSUE_TEMPLATE/feature_request.yml` | New | Structured feature intake. |
| `.github/ISSUE_TEMPLATE/docs_task.yml` | New | Lightweight docs/task intake. |
| `.github/ISSUE_TEMPLATE/config.yml` | New | Template chooser with blank issues enabled. |
| `openspec/changes/github-collaboration-templates/specs/team-workflow-governance/spec.md` | New delta | Governance template requirements. |

## Risks

| Risk | Likelihood | Mitigation |
|---|---:|---|
| Templates become too bureaucratic | Medium | Keep required fields focused on owner, scope, acceptance/verification, risk, and review budget. |
| Missing GitHub labels cause friction | Medium | Do not set required default labels; document optional/manual labels only. |
| Native/OAuth validation is misunderstood | Medium | Explicitly state Expo Go is not final evidence for OAuth/native; require development build or Play Console path. |

## Rollback Plan

Remove the `.github/` templates and this OpenSpec change folder. No runtime behavior, native config, stored data, or CI behavior changes are introduced.

## Dependencies

- `docs/team-architecture-workflow.md`
- `docs/local-device-testing.md`
- `openspec/specs/team-workflow-governance/spec.md`

## Success Criteria

- [ ] PR template includes linked issue, owner, type, scope, verification commands, risk notes, device/build evidence, and review-size budget.
- [ ] Issue forms capture owner, context, acceptance criteria, risk category, and validation path.
- [ ] No CI/workflow automation or mandatory labels are introduced.
