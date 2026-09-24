import type { BattingRow, CareerDataset, MatchContext, SplitStatRow } from "./types";
import { battingStats } from "./batting";
import { bowlingStats } from "./bowling";
import { round } from "./math";
import { LEVEL_LABELS, PHASE_LABELS } from "@/lib/constants";

export const SPLIT_DIMENSIONS = [
    { id: "format", label: "Format" },
    { id: "level", label: "Level" },
    { id: "tier", label: "International vs domestic" },
    { id: "opponent", label: "Opponent" },
    { id: "venue", label: "Venue" },
    { id: "country", label: "Country" },
    { id: "venueType", label: "Home / away" },
    { id: "pitch", label: "Pitch" },
    { id: "weather", label: "Weather" },
    { id: "toss", label: "Toss" },
    { id: "tossDecision", label: "Toss decision" },
    { id: "dayNight", label: "Day / night" },
    { id: "matchType", label: "Stage" },
    { id: "series", label: "Series" },
    { id: "year", label: "Year" },
    { id: "month", label: "Month" },
    { id: "captain", label: "Captaincy" },
    { id: "result", label: "Result" },
    { id: "battingFirst", label: "Batting first / chasing" },
    { id: "keeper", label: "Wicketkeeper" },
] as const;

export type SplitDimension = (typeof SPLIT_DIMENSIONS)[number]["id"];

function titleCase(value: string): string {
    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function splitKey(row: MatchContext, dimension: string): { key: string; label: string } | null {
    switch (dimension) {
        case "format":
            return { key: row.format, label: row.format };
        case "level":
            return { key: row.level, label: LEVEL_LABELS[row.level] || row.level };
        case "tier":
            return {
                key: row.tier,
                label: row.tier === "international" ? "International" : row.tier === "ipl" ? "IPL" : "Domestic",
            };
        case "opponent":
            return { key: row.opponent, label: row.opponent };
        case "venue":
            return { key: row.venue, label: row.city ? `${row.venue}, ${row.city}` : row.venue };
        case "country":
            return row.country ? { key: row.country, label: row.country } : null;
        case "venueType":
            return { key: row.venueType || "unknown", label: titleCase(row.venueType || "unknown") };
        case "pitch":
            return row.pitchType ? { key: row.pitchType, label: titleCase(row.pitchType) } : null;
        case "weather":
            return row.weatherCondition ? { key: row.weatherCondition, label: titleCase(row.weatherCondition) } : null;
        case "toss":
            if (row.userWonToss == null) return null;
            return { key: row.userWonToss ? "won" : "lost", label: row.userWonToss ? "Won toss" : "Lost toss" };
        case "tossDecision":
            if (!row.tossDecision || row.userWonToss == null) return null;
            return {
                key: `${row.userWonToss ? "won" : "lost"}-${row.tossDecision}`,
                label: `${row.userWonToss ? "Won" : "Lost"} toss, ${row.tossDecision}`,
            };
        case "dayNight":
            if (row.dayNight == null) return null;
            return { key: row.dayNight ? "night" : "day", label: row.dayNight ? "Day/night" : "Day" };
        case "matchType":
            return row.matchType ? { key: row.matchType, label: titleCase(row.matchType) } : null;
        case "series":
            return row.seriesName ? { key: row.seriesId || row.seriesName, label: row.seriesName } : null;
        case "year":
            return { key: row.date.slice(0, 4), label: row.date.slice(0, 4) };
        case "month": {
            const key = row.date.slice(0, 7);
            const [y, m] = key.split("-").map(Number);
            const label = new Date(Date.UTC(y, (m || 1) - 1, 1)).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
            });
            return { key, label };
        }
        case "captain":
            return { key: row.isCaptain ? "captain" : "player", label: row.isCaptain ? "Captain" : "Not captain" };
        case "keeper":
            return { key: row.isWicketkeeper ? "keeper" : "outfield", label: row.isWicketkeeper ? "Keeper" : "Not keeper" };
        case "result":
            return row.result ? { key: row.result, label: titleCase(row.result) } : null;
        case "battingFirst":
            if (row.battedFirst == null) return null;
            return { key: row.battedFirst ? "bat" : "chase", label: row.battedFirst ? "Batted first" : "Chased" };
        default:
            return null;
    }
}

export function battingSplitKey(row: BattingRow, dimension: string): { key: string; label: string } | null {
    if (dimension === "position") {
        if (!row.battingPosition) return null;
        return { key: String(row.battingPosition), label: `No. ${row.battingPosition}` };
    }
    if (dimension === "innings") {
        const n = row.matchInnings;
        if (!n) return { key: row.inningsSlot, label: row.inningsSlot === "second" ? "2nd innings" : "1st innings" };
        return { key: String(n), label: `Innings ${n}` };
    }
    return splitKey(row, dimension);
}

function groupBy<T>(rows: T[], keyFn: (row: T) => { key: string; label: string } | null): Map<string, { label: string; rows: T[] }> {
    const map = new Map<string, { label: string; rows: T[] }>();
    for (const row of rows) {
        const key = keyFn(row);
        if (!key) continue;
        const bucket = map.get(key.key) || { label: key.label, rows: [] };
        bucket.rows.push(row);
        map.set(key.key, bucket);
    }
    return map;
}

export function buildSplits(data: CareerDataset, dimension: string): SplitStatRow[] {
    const batGroups = groupBy(data.batting, (row) =>
        dimension === "position" || dimension === "innings" ? battingSplitKey(row, dimension) : splitKey(row, dimension)
    );
    const bowlGroups = groupBy(data.bowling, (row) => splitKey(row, dimension));
    const fieldGroups = groupBy(data.fielding, (row) => splitKey(row, dimension));

    const keys = new Set<string>([...batGroups.keys(), ...bowlGroups.keys(), ...fieldGroups.keys()]);
    const rows: SplitStatRow[] = [];

    for (const key of keys) {
        const bat = battingStats(batGroups.get(key)?.rows || []);
        const bowl = bowlingStats(bowlGroups.get(key)?.rows || []);
        const field = fieldGroups.get(key)?.rows || [];
        const label = batGroups.get(key)?.label || bowlGroups.get(key)?.label || fieldGroups.get(key)?.label || key;
        const matches = field.length || new Set([...(batGroups.get(key)?.rows || []), ...(bowlGroups.get(key)?.rows || [])].map((r) => r.matchId)).size;
        const won = field.filter((r) => r.result === "won").length;
        rows.push({
            key,
            label,
            matches,
            innings: bat.innings,
            runs: bat.runs,
            battingAverage: bat.average,
            strikeRate: bat.strikeRate,
            fifties: bat.fifties,
            centuries: bat.centuries,
            wickets: bowl.wickets,
            bowlingAverage: bowl.average,
            economy: bowl.economy,
            bowlingStrikeRate: bowl.strikeRate,
            catches: field.reduce((s, r) => s + r.catches, 0),
            winPercentage: matches > 0 ? round((won / matches) * 100, 1) : 0,
        });
    }

    return rows.sort((a, b) => b.matches - a.matches || b.runs - a.runs);
}

export function phaseLabel(phase: string): string {
    if (phase in PHASE_LABELS) return PHASE_LABELS[phase as keyof typeof PHASE_LABELS];
    return phase;
}
