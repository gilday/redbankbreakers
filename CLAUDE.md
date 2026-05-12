# redbankbreakers.team

Tools and services for the Red Bank Breakers soccer team (Red Bank FC in MOSA/GotSport).

## Stack

- Runtime: Bun
- Language: TypeScript

## Background

The team plays in the MOSA (Monmouth Ocean Soccer Association) league. MOSA uses GotSport for official scheduling. GotSport has a known failure mode where schedule changes don't generate email notifications to coaches — the admin must explicitly click "Save and Send a Message" (not just "Save"), and "Game Change Request" flows only produce in-app notifications. There is no public GotSport API; the iCal feed from the GotSport Team App is the only machine-readable live feed.

The team uses TeamSnap for day-to-day coordination. Both platforms expose iCal feeds that should describe the same games. The `compare-feeds.ts` script diffs them to catch silent GotSport reschedules.

## Conventions

- Feed URLs are secrets stored in `.env` (auto-loaded by Bun)
- TeamSnap events include practices and games; games are identified by " vs " or " at " in the summary
- GotSport feed only contains games
- TeamSnap uses America/New_York timezone; GotSport uses UTC
