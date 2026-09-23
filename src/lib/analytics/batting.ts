import type { BattingAggregate, BattingRow } from "./types";
import { round, stddev } from "./math";

export function emptyBatting(): BattingAggregate {
    return {
        innings: 0,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        notOuts: 0,
        dismissals: 0,
        average: null,
        strikeRate: 0,
        fifties: 0,
        centuries: 0,
        thirties: 0,
        ducks: 0,
        goldenDucks: 0,
        highest: { runs: 0, isNotOut: false },
        boundaryRuns: 0,
        boundaryPercentage: 0,
        ballsPerBoundary: null,
        ballsPerDismissal: null,
        notOutPercentage: 0,
        runsPerInnings: 0,
        innings20PlusPct: 0,
        standardDeviation: 0,
        conversion30to50: null,
        conversion50to100: null,
        reached30: 0,
        reached50: 0,
        reached100: 0,
    };
}

export function battingStats(rows: BattingRow[]): BattingAggregate {
    if (rows.length === 0) return emptyBatting();

    let runs = 0;
    let balls = 0;
    let fours = 0;
    let sixes = 0;
    let notOuts = 0;
    let fifties = 0;
    let centuries = 0;
    let thirties = 0;
    let ducks = 0;
    let goldenDucks = 0;
    let reached30 = 0;
    let reached50 = 0;
    let reached100 = 0;
    let innings20 = 0;
    let highest = { runs: -1, isNotOut: false };
    const scores: number[] = [];

    for (const row of rows) {
        runs += row.runs;
        balls += row.ballsFaced;
        fours += row.fours;
        sixes += row.sixes;
        scores.push(row.runs);
        if (row.isNotOut) notOuts += 1;
        if (row.runs >= 100) centuries += 1;
        else if (row.runs >= 50) fifties += 1;
        else if (row.runs >= 30) thirties += 1;
        if (row.runs >= 30) reached30 += 1;
        if (row.runs >= 50) reached50 += 1;
        if (row.runs >= 100) reached100 += 1;
        if (row.runs >= 20) innings20 += 1;
        if (row.runs === 0 && !row.isNotOut) {
            ducks += 1;
            if (row.ballsFaced <= 1) goldenDucks += 1;
        }
        if (row.runs > highest.runs) highest = { runs: row.runs, isNotOut: row.isNotOut };
    }

    const dismissals = rows.length - notOuts;
    const boundaryRuns = fours * 4 + sixes * 6;
    const boundaries = fours + sixes;

    return {
        innings: rows.length,
        runs,
        balls,
        fours,
        sixes,
        notOuts,
        dismissals,
        average: dismissals > 0 ? round(runs / dismissals) : null,
        strikeRate: balls > 0 ? round((runs / balls) * 100) : 0,
        fifties,
        centuries,
        thirties,
        ducks,
        goldenDucks,
        highest: highest.runs < 0 ? { runs: 0, isNotOut: false } : highest,
        boundaryRuns,
        boundaryPercentage: runs > 0 ? round((boundaryRuns / runs) * 100, 1) : 0,
        ballsPerBoundary: boundaries > 0 ? round(balls / boundaries) : null,
        ballsPerDismissal: dismissals > 0 ? round(balls / dismissals) : null,
        notOutPercentage: rows.length > 0 ? round((notOuts / rows.length) * 100, 1) : 0,
        runsPerInnings: rows.length > 0 ? round(runs / rows.length) : 0,
        innings20PlusPct: rows.length > 0 ? round((innings20 / rows.length) * 100, 1) : 0,
        standardDeviation: stddev(scores),
        conversion30to50: reached30 > 0 ? round((reached50 / reached30) * 100, 1) : null,
        conversion50to100: reached50 > 0 ? round((reached100 / reached50) * 100, 1) : null,
        reached30,
        reached50,
        reached100,
    };
}
