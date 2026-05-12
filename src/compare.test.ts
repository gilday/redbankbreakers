import { describe, expect, test } from "bun:test";
import { compareGames, type Game } from "./compare.ts";

const NOW = new Date("2026-05-12T12:00:00Z");

function game(isoStart: string, summary: string): Game {
  return { start: new Date(isoStart), summary };
}

describe("compareGames", () => {
  test("returns empty when feeds agree on future game time", () => {
    const ts = [game("2026-06-01T16:00:00Z", "Red Bank Breakers vs Rivals")];
    const gs = [game("2026-06-01T16:00:00Z", "Red Bank FC vs Rivals FC")];
    expect(compareGames(ts, gs, NOW)).toEqual([]);
  });

  test("reports time mismatch for future game", () => {
    const ts = [game("2026-06-01T16:00:00Z", "Red Bank Breakers vs Rivals")];
    const gs = [game("2026-06-01T14:30:00Z", "Red Bank FC vs Rivals FC")];
    const result = compareGames(ts, gs, NOW);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("time mismatch");
    expect(result[0]).toContain("TeamSnap");
    expect(result[0]).toContain("GotSport");
  });

  test("filters out past games even when they mismatch", () => {
    const ts = [game("2026-04-01T16:00:00Z", "Red Bank Breakers vs Rivals")];
    const gs = [game("2026-04-01T14:30:00Z", "Red Bank FC vs Rivals FC")];
    expect(compareGames(ts, gs, NOW)).toEqual([]);
  });

  test("reports GotSport game with no TeamSnap match", () => {
    const ts: Game[] = [];
    const gs = [game("2026-06-01T16:00:00Z", "Red Bank FC vs Rivals FC")];
    const result = compareGames(ts, gs, NOW);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("no TeamSnap match");
  });

  test("ignores TeamSnap practices and other non-game events", () => {
    const ts = [
      game("2026-06-01T22:00:00Z", "Practice"),
      game("2026-06-01T23:00:00Z", "Team Pizza Night"),
    ];
    const gs = [game("2026-06-01T16:00:00Z", "Red Bank FC vs Rivals FC")];
    const result = compareGames(ts, gs, NOW);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("no TeamSnap match");
  });

  test("matches TeamSnap 'at' away games", () => {
    const ts = [game("2026-06-01T16:00:00Z", "Red Bank Breakers at Rivals")];
    const gs = [game("2026-06-01T16:00:00Z", "Rivals FC vs Red Bank FC")];
    expect(compareGames(ts, gs, NOW)).toEqual([]);
  });

  test("handles multiple games across different dates independently", () => {
    const ts = [
      game("2026-06-01T16:00:00Z", "Red Bank Breakers vs A"),
      game("2026-06-08T16:00:00Z", "Red Bank Breakers vs B"),
      game("2026-06-15T16:00:00Z", "Red Bank Breakers vs C"),
    ];
    const gs = [
      game("2026-06-01T16:00:00Z", "Red Bank FC vs A FC"), // match
      game("2026-06-08T14:30:00Z", "Red Bank FC vs B FC"), // mismatch
      game("2026-06-15T16:00:00Z", "Red Bank FC vs C FC"), // match
    ];
    const result = compareGames(ts, gs, NOW);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("time mismatch");
  });

  test("matches games on same day by date key, not exact timestamp", () => {
    // Same Eastern-time date, different times — should be flagged as mismatch (not as 'no match')
    const ts = [game("2026-06-01T16:00:00Z", "Red Bank Breakers vs Rivals")]; // noon ET
    const gs = [game("2026-06-01T23:00:00Z", "Red Bank FC vs Rivals FC")]; // 7pm ET, same day
    const result = compareGames(ts, gs, NOW);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain("time mismatch");
    expect(result[0]).not.toContain("no TeamSnap match");
  });
});
