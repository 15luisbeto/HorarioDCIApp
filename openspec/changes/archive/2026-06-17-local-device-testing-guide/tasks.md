# Tasks: Local Device Testing Guide

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 160-260 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR: docs guide + README pointer + task tracking |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Add local physical-device testing documentation | PR 1 | Single docs-only work unit; no runtime code. |

## Phase 1: Guide Structure

- [x] 1.1 Create `docs/local-device-testing.md` with title, purpose, audience, and quick checklist for local phone testing.
- [x] 1.2 Add local setup section using `pnpm install` and `pnpm start`; state Android Studio is not required for Expo Go checks.
- [x] 1.3 Add testing-scope summary covering UI/navigation, bundled data, favorites, exports, and what must not be validated in Expo Go.

## Phase 2: Expo Go Device Workflows

- [x] 2.1 Document Android Expo Go install, permission prompts, QR scanning from Metro/Expo, and expected local smoke-check result.
- [x] 2.2 Document iOS Expo Go install, Camera/Expo Go scanning path, camera/local-network permissions, and expected smoke-check result.
- [x] 2.3 Document local-network requirements: same Wi-Fi/LAN, reachable dev machine, blocked guest networks, VPNs, and firewalls.

## Phase 3: Native Validation and Governance

- [x] 3.1 Add Expo Go vs development build vs Play Console internal/closed/public testing matrix.
- [x] 3.2 State Google OAuth/native redirects require an Expo development build or Play-distributed test build, not Expo Go.
- [x] 3.3 Document `pnpm start:dev-client` only for installed development builds/native validation.
- [x] 3.4 Document Play Console governance: `15luisbeto` controls publication and announces internal/closed test versions or delegates instructions.

## Phase 4: Troubleshooting and README

- [x] 4.1 Add troubleshooting for QR not loading, stale Metro sessions, permissions, same-network failures, VPN/firewall/guest Wi-Fi, and tunnel fallback.
- [x] 4.2 Update `README.md` near quick start / Expo Go note with a concise link to `docs/local-device-testing.md`.
- [x] 4.3 Verify the README link path and manually review the guide against all spec scenarios.
- [x] 4.4 Record docs-only verification: `pnpm lint` only if Markdown/README linting is applicable; `pnpm exec tsc --noEmit` not required because no runtime TypeScript changes are planned.
