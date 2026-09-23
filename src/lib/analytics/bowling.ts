import type { BowlingAggregate, BowlingRow } from "./types";
import { ballsToOvers, oversToBalls, round } from "./math";

export function emptyBowling(): BowlingAggregate {
    return {
        innings: 0,
        overs: 0,
        balls: 0,
        maidens: 0,
        runs: 0,
        wickets: 0,
        wides: 0,
        noBalls: 0,
        average: null,
        economy: 0,
        strikeRate: null,
        maidensPercentage: 0,
        extrasPerOver: 0,
        threeWicketHauls: 0,
        fourWicketHauls: 0,
        fiveWicketHauls: 0,
        best: { wickets: 0, runs: 0 },
    };
}

export function ballsBowledOf(row: BowlingRow): number {
    if (row.ballsBowled > 0) return row.ballsBowled;
    return oversToBalls(row.overs);
}

export function bowlingStats(rows: BowlingRow[]): BowlingAggregate {
    if (rows.length === 0) return emptyBowling();

    let balls = 0;
    let maidens = 0;
    let runs = 0;
    let wickets = 0;
    let wides = 0;
    let noBalls = 0;
    let three = 0;
    let four = 0;
    let five = 0;
    let completedOvers = 0;
    let best = { wickets: -1, runs: Number.POSITIVE_INFINITY };

    for (const row of rows) {
        const b = ballsBowledOf(row);
        balls += b;
        maidens += row.maidens;
        runs += row.runsConceded;
        wickets += row.wickets;
        wides += row.wides;
        noBalls += row.noBalls;
        completedOvers += Math.floor(b / 6);
        if (row.wickets >= 5) five += 1;
        if (row.wickets >= 4) four += 1;
        if (row.wickets >= 3) three += 1;
        if (
            row.wickets > best.wickets ||
            (row.wickets === best.wickets && row.runsConceded < best.runs)
        ) {
            best = { wickets: row.wickets, runs: row.runsConceded };
        }
    }

    const trueOvers = balls / 6;
    return {
        innings: rows.length,
        overs: ballsToOvers(balls),
        balls,
        maidens,
        runs,
        wickets,
        wides,
        noBalls,
        average: wickets > 0 ? round(runs / wickets) : null,
        economy: trueOvers > 0 ? round(runs / trueOvers) : 0,
        strikeRate: wickets > 0 ? round(balls / wickets) : null,
        maidensPercentage: completedOvers > 0 ? round((maidens / completedOvers) * 100, 1) : 0,
        extrasPerOver: trueOvers > 0 ? round((wides + noBalls) / trueOvers) : 0,
        threeWicketHauls: three,
        fourWicketHauls: four,
        fiveWicketHauls: five,
        best: best.wickets < 0 ? { wickets: 0, runs: 0 } : best,
    };
}
