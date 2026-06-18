## Linked issue

- Closes/Fixes/Refs: <!-- #issue or "No linked issue: <reason>" -->

## Owner and scope

- Owner responsible for follow-up/rollback: <!-- @user or name -->
- Change type: <!-- feature | bugfix | docs | refactor | config | release -->
- Affected capability: <!-- schedules | favorites | exports | OAuth | institutional data | release | docs/governance | other -->
- Scope:
  - <!-- What changed? -->
- Non-goals:
  - <!-- What intentionally did not change? -->

## Verification

Record every command run. For docs/template-only changes, mark runtime commands as N/A with a short reason.

- [ ] `pnpm test` — <!-- pass | fail | N/A: reason -->
- [ ] `pnpm lint` — <!-- pass | fail | N/A: reason -->
- [ ] `pnpm typecheck` — <!-- pass | fail | N/A: reason -->
- [ ] Manual checks — <!-- device/browser/docs review performed, or N/A -->

## Native, OAuth, and Play Console validation boundary

- [ ] This PR does not affect Google OAuth, native redirects, package/bundle IDs, EAS/release config, or Play Console distribution.
- [ ] If it does affect any of those areas, Expo Go was NOT used as final evidence.
- [ ] Required native/OAuth validation path is documented: <!-- development build | Play Console internal/closed/public testing | N/A -->
- [ ] Play Console coordination with `15luisbeto` is documented when relevant.

## Risk notes

Check all areas touched and explain the mitigation or rollback plan.

- [ ] OAuth/native redirects, package identifiers, or Google Calendar scopes
- [ ] Local persistence, migrations, favorites/settings, or SQLite behavior
- [ ] Academic data shape, dataset compatibility, or publication process
- [ ] EAS/release configuration or Play Console distribution
- [ ] Runtime behavior visible to users
- [ ] Docs/governance/template-only change
- Risk summary and rollback notes:
  - <!-- Include issue-first context for risky work. -->

## Review budget

- Estimated changed lines: <!-- additions + deletions -->
- [ ] This PR stays within the roughly 400-line review budget.
- [ ] This PR exceeds the budget and documents a split plan or maintainer-approved exception.
- Review notes for maintainers:
  - <!-- Suggested focus areas, optional/manual labels like type: feature or risk: native/oauth. Do not rely on labels existing. -->

## Release readiness, when applicable

- [ ] Release notes owner is identified.
- [ ] Lint/typecheck status is visible for release-sensitive work.
- [ ] Unresolved risk exceptions are documented.
