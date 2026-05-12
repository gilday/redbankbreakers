/// <reference types="@cloudflare/workers-types" />
import { findDiscrepancies } from "./compare.ts";

interface Env {
  TEAM_SNAP_ICAL_FEED: string;
  GOT_SPORT_ICAL_FEED: string;
  NTFY_CHANNEL: string;
}

export default {
  async scheduled(
    _controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(run(env));
  },
};

async function run(env: Env): Promise<void> {
  const lines = await findDiscrepancies({
    teamSnapUrl: env.TEAM_SNAP_ICAL_FEED,
    gotSportUrl: env.GOT_SPORT_ICAL_FEED,
  });
  if (lines.length === 0) return;

  await fetch(`https://ntfy.sh/${env.NTFY_CHANNEL}`, {
    method: "POST",
    headers: {
      Title: "Red Bank Breakers schedule discrepancy",
      Tags: "warning,soccer",
      "Content-Type": "text/plain",
    },
    body: lines.join("\n\n"),
  });
}
