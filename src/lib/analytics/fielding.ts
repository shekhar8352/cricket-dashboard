import type { FieldingAggregate, FieldingRow } from "./types";
import { round } from "./math";

export function emptyFielding(): FieldingAggregate {
    return {
        matches: 0,
        catches: 0,
        runOuts: 0,
        stumpings: 0,
        dismissals: 0,
        dropped: 0,
        directHits: 0,
        runsSaved: 0,
        misfields: 0,
        catchEfficiency: null,
        dismissalsPerMatch: 0,
    };
}

export function fieldingStats(rows: FieldingRow[]): FieldingAggregate {
    if (rows.length === 0) return emptyFielding();
    const catches = rows.reduce((s, r) => s + r.catches, 0);
    const runOuts = rows.reduce((s, r) => s + r.runOuts, 0);
    const stumpings = rows.reduce((s, r) => s + r.stumpings, 0);
    const dropped = rows.reduce((s, r) => s + r.dropped, 0);
    const dismissals = catches + runOuts + stumpings;
    const chances = catches + dropped;
    return {
        matches: rows.length,
        catches,
        runOuts,
        stumpings,
        dismissals,
        dropped,
        directHits: rows.reduce((s, r) => s + r.directHits, 0),
        runsSaved: rows.reduce((s, r) => s + r.runsSavedEstimate, 0),
        misfields: rows.reduce((s, r) => s + r.misfields, 0),
        catchEfficiency: chances > 0 ? round((catches / chances) * 100, 1) : null,
        dismissalsPerMatch: round(dismissals / rows.length),
    };
}

export function fieldingHasDetail(row: FieldingRow): boolean {
    return row.dropped > 0 || row.directHits > 0 || row.runsSavedEstimate > 0 || row.misfields > 0;
}
