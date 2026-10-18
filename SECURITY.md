# Security Policy

## Reporting a vulnerability

Please report security issues privately through GitHub's
[private vulnerability reporting](https://github.com/AaronStahley/scrum-poker-frontend/security/advisories/new),
not in a public issue or pull request.

Include what you found, how to reproduce it, and what an attacker could do with it.
This is a personal project, so responses are best effort; you can expect an
acknowledgement within a week.

## Supported versions

Only the latest release, deployed at https://the-scrum-poker.vercel.app, receives fixes.

## Scope

In scope:
- The application code in this repository
- The Firestore and Realtime Database security rules (`firestore.rules`, `database.rules.json`)

Out of scope:
- The Firebase web configuration (`NEXT_PUBLIC_FIREBASE_*` values). It is public by
  design; access is controlled by the security rules
- Denial of service and volume-based attacks
- Issues in Firebase, Vercel or other third-party services; report those to the provider
