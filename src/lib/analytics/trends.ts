import type { TrendDataPoint } from "@/types";
import type {
    BattingRow,
    BowlingRow,
    CalendarCell,
    CareerDataset,
    FieldingRow,
    ImpactPoint,
    RollingPoint,
    ScatterPoint,
    YearBar,
} from "./types";
import { battingStats } from "./batting";
import { round } from "./math";
import { ballsBowledOf } from "./bowling";

function family(format: string): "t20" | "odi" | "test" {
    if (format === "Test" || format === "First-class" || format === "Youth Test") return "test";
    if (format === "ODI" || format === "List-A" || format === "Youth ODI") return "odi";
    return "t20";
}

const BASELINE = {
    t20: { sr: 130, econ: 8 },
    odi: { sr: 90, econ: 5.5 },
    test: { sr: 50, econ: 3.2 },
};

/** Weighted match impact: runs scaled by strike rate vs a format baseline, plus wickets, minus expensive overs. */
export function impactForMatch(batting: BattingRow[], bowling: BowlingRow[]): number {
    const format = batting[0]?.format || bowling[0]?.format || "T20";
    const base = BASELINE[family(format)];
    const bat = battingStats(batting);
    const srFactor = bat.balls > 0 ? bat.strikeRate / base.sr : 1;
    const battingPart = bat.runs * srFactor;
    let bowlPart = 0;
    for (const row of bowling) {
        const balls = ballsBowledOf(row);
        const overs = balls / 6;
        const economy = overs > 0 ? row.runsConceded / overs : base.econ;
        bowlPart += row.wickets * 22 - Math.max(0, economy - base.econ) * overs;
    }
    return round(battingPart + bowlPart, 1);
}

export function toTrendPoints(data: CareerDataset): TrendDataPoint[] {
    const field = [...data.fielding].sort((a, b) => a.date.localeCompare(b.date));
    const batByMatch = new Map<string, BattingRow[]>();
    const bowlByMatch = new Map<string, BowlingRow[]>();
    for (const row of data.batting) {
        const list = batByMatch.get(row.matchId) || [];
        list.push(row);
        batByMatch.set(row.matchId, list);
    }
    for (const row of data.bowling) {
        const list = bowlByMatch.get(row.matchId) || [];
        list.push(row);
        bowlByMatch.set(row.matchId, list);
    }

    let cumulativeRuns = 0;
    let cumulativeWickets = 0;
    let cumulativeBalls = 0;
    let cumulativeBowlBalls = 0;
    let cumulativeRunsConceded = 0;
    let cumulativeInnings = 0;
    let cumulativeNotOuts = 0;

    return field.map((match) => {
        const bat = batByMatch.get(match.matchId) || [];
        const bowl = bowlByMatch.get(match.matchId) || [];
        const runs = bat.reduce((s, r) => s + r.runs, 0);
        const balls = bat.reduce((s, r) => s + r.ballsFaced, 0);
        const wickets = bowl.reduce((s, r) => s + r.wickets, 0);
        const bowlBalls = bowl.reduce((s, r) => s + ballsBowledOf(r), 0);
        const conceded = bowl.reduce((s, r) => s + r.runsConceded, 0);
        cumulativeRuns += runs;
        cumulativeWickets += wickets;
        cumulativeBalls += balls;
        cumulativeBowlBalls += bowlBalls;
        cumulativeRunsConceded += conceded;
        cumulativeInnings += bat.length;
        cumulativeNotOuts += bat.filter((r) => r.isNotOut).length;
        const dismissals = cumulativeInnings - cumulativeNotOuts;
        const trueOvers = cumulativeBowlBalls / 6;

        return {
            matchId: match.matchId,
            date: match.date,
            opponent: match.opponent,
            format: match.format,
            runs,
            wickets,
            cumulativeRuns,
            cumulativeWickets,
            runningAverage: dismissals > 0 ? round(cumulativeRuns / dismissals) : 0,
            runningStrikeRate: cumulativeBalls > 0 ? round((cumulativeRuns / cumulativeBalls) * 100) : 0,
            runningEconomy: trueOvers > 0 ? round(cumulativeRunsConceded / trueOvers) : 0,
        };
    });
}

export function rollingForm(rows: BattingRow[]): RollingPoint[] {
    const ordered = [...rows].sort((a, b) => a.date.localeCompare(b.date) || a.inningsSlot.localeCompare(b.inningsSlot));
    return ordered.map((row, index) => {
        const window = (n: number) => ordered.slice(Math.max(0, index - n + 1), index + 1);
        const s5 = battingStats(window(5));
        const s10 = battingStats(window(10));
        return {
            date: row.date,
            label: `${row.opponent} · ${new Date(row.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}`,
            average5: s5.average,
            average10: s10.average,
            strikeRate5: s5.strikeRate,
            strikeRate10: s10.strikeRate,
        };
    });
}

export function yearBars(data: CareerDataset): YearBar[] {
    const years = new Map<string, { field: FieldingRow[]; bat: BattingRow[]; bowl: BowlingRow[] }>();
    const ensure = (year: string) => {
        const bucket = years.get(year) || { field: [], bat: [], bowl: [] };
        years.set(year, bucket);
        return bucket;
    };
    for (const row of data.fielding) ensure(row.date.slice(0, 4)).field.push(row);
    for (const row of data.batting) ensure(row.date.slice(0, 4)).bat.push(row);
    for (const row of data.bowling) ensure(row.date.slice(0, 4)).bowl.push(row);

    return [...years.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([year, bucket]) => {
            const bat = battingStats(bucket.bat);
            const wickets = bucket.bowl.reduce((s, r) => s + r.wickets, 0);
            return {
                year,
                matches: bucket.field.length,
                runs: bat.runs,
                wickets,
                average: bat.average,
                strikeRate: bat.strikeRate,
            };
        });
}

export function scatterPoints(rows: BattingRow[]): ScatterPoint[] {
    return rows
        .filter((row) => row.ballsFaced > 0)
        .map((row) => ({
            x: round((row.runs / row.ballsFaced) * 100),
            y: row.runs,
            opponent: row.opponent,
            date: row.date,
            format: row.format,
        }));
}

export function calendarCells(rows: FieldingRow[], batting: BattingRow[]): CalendarCell[] {
    const runsByMonth = new Map<string, number>();
    for (const row of batting) {
        const key = row.date.slice(0, 7);
        runsByMonth.set(key, (runsByMonth.get(key) || 0) + row.runs);
    }
    const matchesByMonth = new Map<string, number>();
    for (const row of rows) {
        const key = row.date.slice(0, 7);
        matchesByMonth.set(key, (matchesByMonth.get(key) || 0) + 1);
    }
    const keys = new Set([...runsByMonth.keys(), ...matchesByMonth.keys()]);
    return [...keys]
        .sort()
        .map((key) => {
            const [y, m] = key.split("-").map(Number);
            return {
                key,
                year: String(y),
                month: m,
                label: new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", { month: "short" }),
                runs: runsByMonth.get(key) || 0,
                matches: matchesByMonth.get(key) || 0,
            };
        });
}

export function impactSeries(data: CareerDataset): ImpactPoint[] {
    const batByMatch = new Map<string, BattingRow[]>();
    const bowlByMatch = new Map<string, BowlingRow[]>();
    for (const row of data.batting) {
        const list = batByMatch.get(row.matchId) || [];
        list.push(row);
        batByMatch.set(row.matchId, list);
    }
    for (const row of data.bowling) {
        const list = bowlByMatch.get(row.matchId) || [];
        list.push(row);
        bowlByMatch.set(row.matchId, list);
    }
    return [...data.fielding]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((match) => {
            const bat = batByMatch.get(match.matchId) || [];
            const bowl = bowlByMatch.get(match.matchId) || [];
            return {
                matchId: match.matchId,
                date: match.date,
                opponent: match.opponent,
                impact: impactForMatch(bat, bowl),
                runs: bat.reduce((s, r) => s + r.runs, 0),
                wickets: bowl.reduce((s, r) => s + r.wickets, 0),
            };
        });
}

export function formIndex(rows: BattingRow[]) {
    const ordered = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const career = battingStats(ordered);
    const last5 = battingStats(ordered.slice(-5));
    const last10 = battingStats(ordered.slice(-10));
    const pack = (agg: ReturnType<typeof battingStats>) => ({
        innings: agg.innings,
        runs: agg.runs,
        average: agg.average,
        strikeRate: agg.strikeRate,
    });
    return {
        careerAverage: career.average,
        careerStrikeRate: career.strikeRate,
        last5: pack(last5),
        last10: pack(last10),
    };
}
