# Local Device Testing Specification

## Purpose

Define the team contract for physical-device testing, Expo Go QR smoke checks, native/OAuth validation limits, troubleshooting, and Play Console ownership.

## Requirements

### Requirement: Local Setup Guide

The guide MUST document local setup without requiring Android Studio. It SHALL point teammates to `pnpm install`, `pnpm start`, and the optional development-client command only when native validation is needed.

#### Scenario: Teammate prepares local testing

- GIVEN a teammate has cloned the app
- WHEN they read the guide
- THEN they MUST see the required package-manager and start commands
- AND they MUST NOT be told Android Studio is required for Expo Go checks

### Requirement: Expo Go Physical-Device QR Testing

The guide MUST cover Android and iOS physical-device Expo Go QR flows, including app installation, camera/permission prompts, same-network expectations, and QR scanning from the Metro/Expo server.

#### Scenario: Android Expo Go smoke check

- GIVEN the app is running locally and an Android phone has Expo Go
- WHEN the teammate scans the QR code from the local server
- THEN the app SHOULD open in Expo Go for UI and bundled-data smoke checks
- AND local network access MUST be allowed when prompted

#### Scenario: iOS Expo Go smoke check

- GIVEN the app is running locally and an iPhone has Expo Go
- WHEN the teammate scans the QR code using the supported camera or Expo Go flow
- THEN the app SHOULD open for UI and bundled-data smoke checks
- AND camera/local-network permissions MUST be granted if requested

### Requirement: Expo Go and Native Validation Boundaries

The guide MUST distinguish Expo Go, development builds, and Play Console test builds. Expo Go MUST NOT be presented as sufficient for real Google OAuth/native redirect validation; that validation SHALL require an Expo development build or Play-distributed test build.

#### Scenario: OAuth validation is requested

- GIVEN a teammate needs to validate Google OAuth or native redirects
- WHEN they consult the guide
- THEN the guide MUST direct them away from Expo Go
- AND it SHALL identify development builds or Play Console test builds as valid paths

### Requirement: Play Console Testing Governance

The guide MUST state that `15luisbeto` owns Google Play Console publication governance. Internal, closed, and public testing tracks SHOULD be described by purpose, and closed/internal test versions SHALL be announced by the license owner or their delegate.

#### Scenario: Closed testing availability

- GIVEN a teammate asks whether a Play Console closed test is available
- WHEN they read the guide
- THEN they MUST see that `15luisbeto` controls publication
- AND they SHOULD wait for the announced version and track instructions

### Requirement: Troubleshooting and Network Requirements

The guide MUST include troubleshooting for same Wi-Fi/LAN reachability, VPNs, firewalls, guest networks, stale Metro sessions, permissions, and tunnel fallback.

#### Scenario: QR code does not load on phone

- GIVEN Expo Go cannot reach the local app after scanning the QR
- WHEN the teammate follows troubleshooting
- THEN they MUST verify same-network access, blocked VPN/firewall/guest Wi-Fi conditions, and app permissions
- AND they MAY use tunnel mode when LAN access is unavailable
