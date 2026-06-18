## Exploration: github-collaboration-templates

### Current State
The repository currently has no `.github/` directory on this branch, so there are no PR templates, issue templates, issue forms, labeler configs, or GitHub workflow files to preserve. Team workflow expectations already exist in `docs/team-architecture-workflow.md` and `openspec/specs/team-workflow-governance/spec.md`: non-trivial PRs should expose scope, owner, affected capability, verification, risk notes, and the roughly 400-line review budget; risky work needs an issue or explicit risk note before implementation; direct push/merge to `main` requires authorization from `15luisbeto`. Local testing boundaries exist in `docs/local-device-testing.md` and `openspec/specs/local-device-testing/spec.md`: Expo Go is valid for local UI/data smoke checks, but OAuth/native redirects require an Expo development build or Play Console-distributed build, and Play Console publication/testing is controlled by `15luisbeto`.

### Affected Areas
- `.github/pull_request_template.md` — new PR template should make action, linked issue, owner, scope, verification, risk category, Expo Go/dev build/Play Console notes, and review budget explicit.
- `.github/ISSUE_TEMPLATE/bug_report.yml` — new issue form should capture observed behavior, expected behavior, environment, owner, affected capability, risk category, verification/reproduction, and native/OAuth/Play Console constraints when relevant.
- `.github/ISSUE_TEMPLATE/feature_request.yml` — new issue form should capture problem, proposed outcome, owner, scope/non-goals, affected capability, risks, verification plan, and review-size expectations before implementation.
- `.github/ISSUE_TEMPLATE/task.yml` — optional lightweight task/docs issue form for non-bug/non-feature work, including owner, scope, acceptance checks, verification, and risk category.
- `.github/ISSUE_TEMPLATE/risk_change.yml` — optional focused issue form for workflow-triggered risky changes: OAuth/native redirects, storage/persistence, academic data shape, EAS/release configuration, Play Console, or work likely to exceed 400 changed lines.
- `.github/ISSUE_TEMPLATE/config.yml` — optional issue-template chooser config to disable blank issues only if the team wants structured intake; otherwise keep blank issues enabled to avoid blocking maintainers during early team setup.
- `docs/team-architecture-workflow.md` — source of truth for PR fields, issue-first triggers, ownership, review budget, and merge authorization; no doc changes are required for the first slice unless the templates reveal missing wording.
- `docs/local-device-testing.md` — source of truth for Expo Go versus development build versus Play Console testing notes; no doc changes are required for the first slice.

### Approaches
1. **Minimal Markdown PR template plus YAML issue forms** — Add one PR template and a small set of GitHub Issue Forms under `.github/ISSUE_TEMPLATE/`.
   - Pros: Matches the documented workflow directly, keeps risky work visible before implementation, supports structured labels/metadata, and is easy to review as a docs-only slice.
   - Cons: Requires contributors to understand GitHub Issue Forms; label names only help if labels exist or are later created manually in GitHub.
   - Effort: Low

2. **Markdown-only templates** — Add `.md` templates for PRs and issues without GitHub Issue Forms YAML.
   - Pros: Lowest friction, simple to edit, no GitHub form syntax risks.
   - Cons: Weaker structure, easier for contributors to skip required owner/risk/testing fields, and less useful for future automation/type labels.
   - Effort: Low

3. **Templates plus automation/workflows** — Add templates and GitHub Actions or labeler behavior to enforce labels, PR size, linked issues, or checks.
   - Pros: Stronger governance and reduced manual review burden.
   - Cons: Larger first slice, introduces CI/workflow risk, may require permissions/secrets decisions, and is unnecessary before template behavior is proven.
   - Effort: Medium

### Recommendation
Use Approach 1 as the first implementation slice: add `.github/pull_request_template.md`, issue forms for bug reports, feature requests, tasks/docs work, and risky changes, plus a conservative `config.yml`. The templates should include these required fields: owner, linked issue, scope/non-goals, affected capability, verification commands/manual checks, risk category, Expo Go/development build/Play Console notes, 400-line review budget status, and optional type labels such as `type: bug`, `type: feature`, `type: docs`, `type: task`, and `risk: native/oauth` only if the repository will maintain those labels. Do not add enforcement workflows yet; keep this docs/governance-only and reviewable.

### Risks
- GitHub Issue Forms can reference labels that do not exist; GitHub accepts missing labels poorly from a workflow perspective, so labels should either be created manually by a maintainer or omitted/kept clearly optional.
- Overly strict forms can slow small team collaboration; keep required fields focused on owner, scope, verification, risk, and review budget.
- Native/OAuth and Play Console wording must not imply Expo Go is sufficient; templates should force development-build or Play Console evidence when those areas are touched.
- Disabling blank issues too early could block maintainers from recording exceptional work quickly; leave blank issues enabled unless the owner chooses stricter intake.
- Adding automation in the same slice would expand risk beyond templates and may require permission decisions; avoid it for the minimal first slice.

### Ready for Proposal
Yes — propose a docs-only governance change that creates GitHub collaboration templates without implementing enforcement workflows. The orchestrator should tell the user that the minimal first slice is safe and small: PR template, structured issue forms, optional chooser config, no secrets, no runtime code, and no CI behavior changes.
