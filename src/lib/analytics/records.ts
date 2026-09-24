import type { BattingRow, BowlingFigureRow, BowlingRow, Milestone, ScoreRow } from "./types";
import { ballsToOvers, round } from "./math";
import { ballsBowledOf } from "./bowling";

export function topScores(rows: BattingRow[], limit = 10): ScoreRow[] {
    return [...rows]
        .sort((a, b) => b.runs - a.runs || a.ballsFaced - b.ballsFaced)
        .slice(0, limit)
        .map((row) => ({
            matchId: row.matchId,
            date: row.date,
            opponent: row.opponent,
            format: row.format,
            runs: row.runs,
            balls: row.ballsFaced,
            isNotOut: row.isNotOut,
            strikeRate: row.ballsFaced > 0 ? round((row.runs / row.ballsFaced) * 100) : 0,
        }));
}

export function bestFigures(rows: BowlingRow[], limit = 8): BowlingFigureRow[] {
    return [...rows]
        .filter((row) => row.wickets > 0 || row.runsConceded > 0)
        .sort((a, b) => b.wickets - a.wickets || a.runsConceded - b.runsConceded)
        .slice(0, limit)
        .map((row) => {
            const balls = ballsBowledOf(row);
            const overs = balls / 6;
            return {
                matchId: row.matchId,
                date: row.date,
                opponent: row.opponent,
                format: row.format,
                wickets: row.wickets,
                runs: row.runsConceded,
                overs: ballsToOvers(balls),
                economy: overs > 0 ? round(row.runsConceded / overs) : 0,
            };
        });
}

export function milestones(batting: BattingRow[], bowling: BowlingRow[]): Milestone[] {
    const bat = [...batting].sort((a, b) => a.date.localeCompare(b.date));
    const bowl = [...bowling].sort((a, b) => a.date.localeCompare(b.date));
    const out: Milestone[] = [];
    if (bat[0]) {
        out.push({ label: "First innings", date: bat[0].date, detail: `vs ${bat[0].opponent}` });
    }

    let runs = 0;
    const runMarks = [500, 1000, 2000, 3000, 5000, 10000];
    let nextRun = 0;
    let fifty = false;
    let hundred = false;
    for (const row of bat) {
        runs += row.runs;
        if (!fifty && row.runs >= 50) {
            fifty = true;
            out.push({ label: "First fifty", date: row.date, detail: `${row.runs} vs ${row.opponent}` });
        }
        if (!hundred && row.runs >= 100) {
            hundred = true;
            out.push({ label: "First century", date: row.date, detail: `${row.runs} vs ${row.opponent}` });
        }
        while (nextRun < runMarks.length && runs >= runMarks[nextRun]) {
            out.push({ label: `${runMarks[nextRun].toLocaleString()} runs`, date: row.date, detail: `Reached vs ${row.opponent}` });
            nextRun += 1;
        }
    }

    let wickets = 0;
    const wicketMarks = [10, 25, 50, 100, 200];
    let nextWicket = 0;
    let five = false;
    for (const row of bowl) {
        wickets += row.wickets;
        if (!five && row.wickets >= 5) {
            five = true;
            out.push({ label: "First five-for", date: row.date, detail: `${row.wickets}/${row.runsConceded} vs ${row.opponent}` });
        }
        while (nextWicket < wicketMarks.length && wickets >= wicketMarks[nextWicket]) {
            out.push({
                label: `${wicketMarks[nextWicket]} wickets`,
                date: row.date,
                detail: `Reached vs ${row.opponent}`,
            });
            nextWicket += 1;
        }
    }

    return out.sort((a, b) => a.date.localeCompare(b.date));
}
