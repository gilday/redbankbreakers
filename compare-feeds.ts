// GotSport doesn't reliably notify coaches when games are rescheduled.
// TeamSnap is our source of truth, so we diff it against GotSport to catch silent changes.
import { findDiscrepancies } from "./src/compare.ts";

const teamSnapUrl = process.env.TEAM_SNAP_ICAL_FEED;
const gotSportUrl = process.env.GOT_SPORT_ICAL_FEED;
if (!teamSnapUrl || !gotSportUrl) {
  console.error("Missing TEAM_SNAP_ICAL_FEED or GOT_SPORT_ICAL_FEED env vars");
  process.exit(1);
}
const ntfyChannel =
  process.argv.find((a) => a.startsWith("--ntfy-channel="))?.split("=")[1] ??
  process.env.NTFY_CHANNEL;

const lines = await findDiscrepancies({ teamSnapUrl, gotSportUrl });

if (lines.length === 0) {
  console.log("✅ All future game times match between TeamSnap and GotSport.");
} else {
  for (const line of lines) console.log(`${line}\n`);
  console.log(`Found ${lines.length} discrepancy(ies).`);
  if (ntfyChannel) {
    await fetch(`https://ntfy.sh/${ntfyChannel}`, {
      method: "POST",
      headers: {
        Title: "Red Bank Breakers schedule discrepancy",
        Tags: "warning,soccer",
        "Content-Type": "text/plain",
      },
      body: lines.join("\n\n"),
    });
  }
}
