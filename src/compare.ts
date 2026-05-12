import ICAL from "ical.js";

export interface Game {
  start: Date;
  summary: string;
}

export interface CompareOptions {
  teamSnapUrl: string;
  gotSportUrl: string;
  now?: Date;
}

export async function findDiscrepancies(opts: CompareOptions): Promise<string[]> {
  const [teamSnap, gotSport] = await Promise.all([
    fetchAndParse(opts.teamSnapUrl),
    fetchAndParse(opts.gotSportUrl),
  ]);
  return compareGames(teamSnap, gotSport, opts.now ?? new Date());
}

export function compareGames(teamSnap: Game[], gotSport: Game[], now: Date): string[] {
  const teamSnapByDate = new Map<string, Game>();
  for (const g of teamSnap) {
    if (!isGame(g.summary)) continue;
    teamSnapByDate.set(toDateKey(g.start), g);
  }

  const lines: string[] = [];
  for (const g of gotSport) {
    if (g.start <= now) continue;
    const dateKey = toDateKey(g.start);
    const ts = teamSnapByDate.get(dateKey);
    if (!ts) {
      lines.push(`⚠ ${dateKey}: GotSport game has no TeamSnap match — ${g.summary}`);
      continue;
    }
    if (g.start.getTime() !== ts.start.getTime()) {
      lines.push(
        `❌ ${dateKey}: time mismatch\n` +
          `   TeamSnap: ${toTimeStr(ts.start)} — ${ts.summary}\n` +
          `   GotSport: ${toTimeStr(g.start)} — ${g.summary}`,
      );
    }
  }
  return lines;
}

async function fetchAndParse(url: string): Promise<Game[]> {
  const text = await fetch(url).then((r) => r.text());
  const comp = new ICAL.Component(ICAL.parse(text));
  return comp.getAllSubcomponents("vevent").map((v) => {
    const e = new ICAL.Event(v);
    return { start: e.startDate.toJSDate(), summary: e.summary ?? "" };
  });
}

function isGame(summary: string): boolean {
  return / vs /i.test(summary) || / at /i.test(summary);
}

function toDateKey(date: Date): string {
  return date.toLocaleDateString("en-US", { timeZone: "America/New_York" });
}

function toTimeStr(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });
}
