# Proposal: Local Device Testing Guide

## Intent

Give teammates a practical Expo Go QR workflow for physical Android/iOS phones, while making the boundary clear: Expo Go is for local UI/data smoke checks, not real Google OAuth/native redirects or Play Store release testing.

## Scope

### In Scope
- Create `docs/local-device-testing.md` with Android/iOS Expo Go setup, permissions, same-network QR flow, and troubleshooting.
- Add a short `README.md` pointer to the guide instead of duplicating instructions.
- Include a matrix: Expo Go vs development build vs Play Console internal/closed/public testing.
- Document that `15luisbeto` owns Google Play Console publication; closed versions are announced by the license owner.

### Out of Scope
- Runtime code, OAuth identifiers, EAS profiles, scripts, secrets, or `.env.example` changes.
- Creating Android Studio instructions or requiring Android Studio for teammates.
- Publishing Play Console builds or performing live device verification.

## Capabilities

### New Capabilities
- `local-device-testing`: Team contract for physical-device testing, Expo Go limits, native validation, and Play Console responsibilities.

### Modified Capabilities
- None.

## Approach

Use a dedicated guide plus README link. Lead with a checklist, then platform details. Android covers Expo Go install path, prompts, same Wi-Fi, QR scan, and LAN/tunnel troubleshooting. iOS covers App Store Expo Go, camera/local network permissions, QR scanning, and the Apple signing/TestFlight constraint note.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docs/local-device-testing.md` | New | Local phone testing guide. |
| `README.md` | Modified | Small link to the full guide. |
| `openspec/changes/local-device-testing-guide/specs/` | Later | Spec phase defines capability. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Expo Go mistaken for OAuth validation | Med | Matrix states OAuth/native redirects require development build or Play Store test app. |
| Store/network instructions vary | Med | Prefer official paths; include LAN, tunnel, VPN/firewall, and guest Wi-Fi troubleshooting. |
| Play Console ownership unclear | Low | State `15luisbeto` controls publication and announces test versions. |

## Rollback Plan

Delete `docs/local-device-testing.md`, remove the README link, and discard this change folder before archive. No runtime/release config changes are involved.

## Dependencies

- Existing scripts: `pnpm install`, `pnpm start`, optional `pnpm start:dev-client`.
- Official Expo Go availability on stores or Expo’s official download path.
- Google OAuth/native testing remains dependent on development builds or Play Store test builds.

## Success Criteria

- [ ] Teammates can follow Android/iOS QR steps without Android Studio.
- [ ] Guide clearly distinguishes Expo Go, development build, and Play Console testing.
- [ ] Google OAuth/native redirects are not presented as testable in Expo Go.
- [ ] Play Console publication ownership by `15luisbeto` is documented.
