# Design: Local Device Testing Guide

## Technical Approach

Create a docs-only operating guide at `docs/local-device-testing.md` and add a short README pointer. The guide will translate the spec into a practical teammate workflow: install dependencies, run Expo, scan the QR with Expo Go on Android/iOS, understand network requirements, troubleshoot common LAN failures, and know when Expo Go is NOT enough. No runtime code, scripts, EAS profiles, OAuth identifiers, or env files change.

## Architecture Decisions

| Decision | Choice | Alternatives considered | Rationale |
|---|---|---|---|
| Documentation shape | Dedicated guide plus README link | Expand README only | README already contains quick start, OAuth, and feature context. A dedicated guide keeps detailed QR/troubleshooting content discoverable without making README dense. |
| Runtime scope | Documentation only | Add scripts or modify config | Existing scripts already cover `pnpm start` and `pnpm start:dev-client`; changing runtime would exceed the proposal and increase release/OAuth risk. |
| Validation boundary | Capability matrix for Expo Go, development build, and Play/closed testing | Single Expo Go checklist | The spec requires Expo Go not be confused with real Google OAuth/native redirect validation. A matrix makes the boundary explicit. |
| Governance wording | State `15luisbeto` owns Play Console publication and announces closed/internal versions | Leave ownership implicit | Existing workflow docs already identify `15luisbeto` as maintainer/release owner; testing availability must not look self-serve. |

## Data Flow

This change has documentation flow, not runtime data flow:

```txt
README.md ──links──> docs/local-device-testing.md
                         │
                         ├── package.json scripts: pnpm install/start/start:dev-client
                         ├── app.config.ts identity: package/bundle/scheme
                         ├── eas.json profiles: development/preview/production
                         └── team workflow: OAuth requires development build
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `docs/local-device-testing.md` | Create | Practical guide with quick checklist, Android Expo Go QR path, iOS equivalent, setup commands, network requirements, troubleshooting, capability matrix, and Play Console governance. |
| `README.md` | Modify | Add a concise link near quick start / Expo Go note, avoiding duplicated instructions. |

## Interfaces / Contracts

No code interfaces are introduced. Documentation contract:

- Commands MUST use pnpm: `pnpm install`, `pnpm start`; mention `pnpm start:dev-client` only for installed development builds/native validation.
- Expo Go MAY be used for local UI/navigation, bundled data, favorites, and export smoke checks.
- Expo Go MUST NOT be presented as valid for real Google OAuth/native redirect validation.
- Google OAuth/native redirects require development build or Play-distributed test build using `com.luisbeto.horariodciapp` identity.
- Play Console internal/closed/public testing governance belongs to `15luisbeto`; testers wait for announced track/version instructions.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Docs review | Guide satisfies all spec requirements and README link resolves | Manual read-through and link check. |
| Lint/typecheck | Not applicable to docs-only change | No lintable/runtime TypeScript changes planned; record as not run unless README tooling requires otherwise. |
| Manual device smoke | Optional Android/iOS Expo Go QR flow | Teammate runs `pnpm start`, scans QR, verifies local UI/data only; OAuth validation deferred to development/Play build. |

## Migration / Rollout

No migration required. Roll out as a docs-only PR. Rollback is deleting `docs/local-device-testing.md` and removing the README link.

## Open Questions

- [ ] None.
