## Exploration: local-device-testing-guide

### Current State
HorarioDCIApp is an Expo Router app using Expo SDK 54, React 19, React Native 0.81, TypeScript strict mode, pnpm, and EAS Android profiles. `package.json` exposes `pnpm start` for Expo Go QR testing, `pnpm start:dev-client` for an installed development build, `pnpm android:dev` for local native Android builds, and `pnpm lint`; there is no `typecheck` script, so type-sensitive verification uses `pnpm exec tsc --noEmit`.

`README.md` already has quick-start setup, Expo Go mention, Google Calendar env setup, and a development-build section explaining that real Google OAuth/native redirects require an installed development build. It does not yet give teammates a practical phone-testing checklist for Android/iOS: installing Expo Go, same-network/QR requirements, permissions, troubleshooting, browser/store download notes, or a clear Expo Go vs development-build capability matrix.

Native/runtime config relevant to this guide:
- `app.config.ts` sets scheme/package/bundle ID to `com.luisbeto.horariodciapp`, enables typed routes and React Compiler, configures `expo-router`, `expo-sqlite`, and `expo-splash-screen`, and reads public Google Calendar values from `EXPO_PUBLIC_*` env vars.
- `eas.json` has a `development` profile with `developmentClient: true`, `distribution: internal`, and Android APK output.
- `hooks/use-google-calendar-auth.ts` builds a native redirect URI as `com.luisbeto.horariodciapp:/oauthredirect` for Android/iOS and uses `AuthSession.makeRedirectUri` for web.
- `app/oauthredirect.tsx` exists as the OAuth redirect route.
- `.env.example` documents only public Expo config variables; no secrets should be added.

### Affected Areas
- `docs/local-device-testing.md` — recommended new practical guide for team members testing on physical devices without Android Studio.
- `README.md` — recommended small link from quick start to the full guide; avoid duplicating the whole guide in README.
- `docs/team-architecture-workflow.md` — already states verification guidance and development-build requirement for OAuth; no required change unless the team wants a cross-link.
- `app.config.ts` — source of app identity and OAuth/native scheme facts to cite; should not be modified for this change.
- `eas.json` — source of development-build facts to cite; should not be modified for this change.
- `package.json` — source of scripts to document; should not be modified unless a later proposal explicitly adds helper scripts.

### Approaches
1. **Dedicated local-device testing guide plus README link** — Create `docs/local-device-testing.md` with Android/iOS setup, Expo Go QR workflow, permission/network checklist, capability matrix, development-build notes for OAuth, and optional manual QR test plan; add a concise README link.
   - Pros: Keeps README lightweight, gives teammates one operational checklist, aligns with existing docs under `docs/`, and avoids runtime code changes.
   - Cons: Adds another doc that must be maintained when Expo SDK, scripts, or OAuth config change.
   - Effort: Low

2. **Expand README only** — Put all local phone-testing instructions directly in `README.md`.
   - Pros: Highest visibility for first-time setup.
   - Cons: README is already carrying setup, OAuth, and feature context; adding full device troubleshooting would make it dense and harder to review.
   - Effort: Low

3. **Docs plus runtime/manual execution in this change** — Create guide and perform/record a real Expo Go QR smoke test on a physical phone.
   - Pros: Strongest evidence that instructions work in the current environment.
   - Cons: Depends on local network, a physical phone, Expo account/app availability, and interactive QR scanning that may not be reproducible by the agent; should be a manual verification checklist rather than a hard automated requirement.
   - Effort: Medium

### Recommendation
Use Approach 1: add `docs/local-device-testing.md` and a short README link. The guide should include a manual test plan, not require actual runtime execution as part of the docs change. Verification for this change should be documentation review plus optional manual QR smoke test by a teammate: run `pnpm install`, `pnpm start`, install/open Expo Go on Android or iOS, scan the QR from the Expo terminal/browser, confirm the app loads, and verify local UI/data/favorites/export flows that do not depend on Google OAuth native redirects.

The guide should clearly separate what Expo Go can test from what requires a development build:

| Area | Expo Go / QR | Development build required |
| --- | --- | --- |
| Local UI/navigation | Yes | No |
| Bundled schedule data and schedule generation | Yes | No |
| Favorites/local persistence smoke checks | Yes | No, unless debugging native persistence differences |
| PDF/export/share smoke checks | Usually yes, but verify device behavior manually | Only if Expo Go behavior differs from installed app expectations |
| Google Calendar UI/config screens | Yes for viewing configuration and non-redirect UI states | Yes for real OAuth/native redirect validation |
| Real Google OAuth and Calendar sync | No; Expo Go is insufficient for package/SHA-1 native redirect validation | Yes, using installed development build |

Android guidance should cover installing Expo Go from the Play Store or Expo/browser download path, granting camera/local-network-related prompts when requested, keeping computer and phone on the same network, using QR scan from Expo Go or camera/browser handoff, and switching Expo connection mode/troubleshooting if LAN blocks discovery. iOS guidance should cover installing Expo Go from the App Store, camera/local network prompts, same-network QR scanning, and a clear note that Apple/TestFlight/signing constraints make custom development builds more involved than Expo Go; real OAuth/native redirect validation still requires a development build with the bundle ID.

### Risks
- Expo Go app availability and names can vary by store/region/browser path; the guide should prefer official Expo docs/store links and avoid promising unsupported sideload paths.
- Local network restrictions, VPNs, firewalls, guest Wi-Fi isolation, or corporate networks can block QR/LAN loading; include tunnel/LAN troubleshooting without making runtime code changes.
- iOS development-build installation has Apple account/device signing/TestFlight/internal distribution constraints; keep this as a note unless the team explicitly wants an iOS build distribution guide.
- Real Google OAuth/native redirects must not be marked as verified through Expo Go; existing specs and README require a development build.
- Documentation can become stale if package scripts, Expo SDK, package identifiers, or EAS profiles change.

### Ready for Proposal
Yes — propose a docs-only change that creates `docs/local-device-testing.md`, adds a README pointer, and defines verification as doc review plus an optional manual Expo Go QR smoke test. The proposal should explicitly state that runtime code, OAuth identifiers, EAS profiles, and secrets are out of scope.
