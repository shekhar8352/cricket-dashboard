import {
    BOWLER_TYPE_LABELS,
    DELIVERY_LENGTH_LABELS,
    DISMISSAL_LABELS,
    SHOT_LABELS,
    SHOT_ZONES,
    type BowlerType,
    type DeliveryLength,
    type DismissalType,
    type ShotPlayed,
} from "@/lib/constants";
import type { BattingRow, BowlingRow, NamedCount, PaceSpinStat, PartnershipAgg, PhaseStat } from "./types";
import { battingStats } from "./batting";
import { coverage } from "./coverage";
import { average, oversToBalls, round } from "./math";
import { phaseLabel } from "./splits";

function countBy(pairs: { key: string; label: string }[]): NamedCount[] {
    const map = new Map<string, NamedCount>();
    for (const pair of pairs) {
        const current = map.get(pair.key) || { key: pair.key, label: pair.label, count: 0 };
        current.count += 1;
        map.set(pair.key, current);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
}

export function scoreDistribution(rows: BattingRow[]): NamedCount[] {
    const bins: { key: string; label: string; test: (runs: number) => boolean }[] = [
        { key: "0", label: "0", test: (n) => n === 0 },
        { key: "1-9", label: "1–9", test: (n) => n >= 1 && n <= 9 },
        { key: "10-29", label: "10–29", test: (n) => n >= 10 && n <= 29 },
        { key: "30-49", label: "30–49", test: (n) => n >= 30 && n <= 49 },
        { key: "50-99", label: "50–99", test: (n) => n >= 50 && n <= 99 },
        { key: "100+", label: "100+", test: (n) => n >= 100 },
    ];
    return bins.map((bin) => ({
        key: bin.key,
        label: bin.label,
        count: rows.filter((row) => bin.test(row.runs)).length,
    }));
}

export function dismissalCounts(rows: BattingRow[]) {
    return countBy(
        rows
            .filter((row) => !row.isNotOut)
            .map((row) => {
                const key = row.dismissalType || "unknown";
                const label = key in DISMISSAL_LABELS ? DISMISSAL_LABELS[key as DismissalType] : key;
                return { key, label };
            })
    ).map((item) => ({ type: item.label, count: item.count }));
}

export function bowlerCounts(rows: BattingRow[]): NamedCount[] {
    return countBy(
        rows
            .filter((row) => !row.isNotOut && row.dismissalBowler)
            .map((row) => ({ key: row.dismissalBowler!.trim().toLowerCase(), label: row.dismissalBowler!.trim() }))
    );
}

export function runTypeRates(rows: BattingRow[]) {
    const detailed = rows.filter((row) => row.hasDetail && row.dots != null);
    const balls = detailed.reduce((s, r) => s + r.ballsFaced, 0);
    const dots = detailed.reduce((s, r) => s + (r.dots || 0), 0);
    const singles = detailed.reduce((s, r) => s + (r.singles || 0), 0);
    const twos = detailed.reduce((s, r) => s + (r.twos || 0), 0);
    const threes = detailed.reduce((s, r) => s + (r.threes || 0), 0);
    const boundaries = detailed.reduce((s, r) => s + r.fours + r.sixes, 0);
    const scoring = singles + twos + threes + boundaries;
    const rotation = singles + twos + threes;
    return {
        coverage: coverage(rows.length, detailed.length),
        dotPct: balls > 0 ? round((dots / balls) * 100, 1) : null,
        scoringShotPct: balls > 0 ? round((scoring / balls) * 100, 1) : null,
        strikeRotationPct: balls > 0 ? round((rotation / balls) * 100, 1) : null,
    };
}

export function battingPhases(rows: BattingRow[]): { phases: PhaseStat[]; covered: number } {
    const map = new Map<string, PhaseStat>();
    let covered = 0;
    for (const row of rows) {
        const phases = (row.phases || []).filter((p) => p.balls > 0 || p.runs > 0 || p.dots > 0);
        if (phases.length === 0) continue;
        covered += 1;
        for (const phase of phases) {
            const current = map.get(phase.phase) || {
                phase: phase.phase,
                label: phaseLabel(phase.phase),
                runs: 0,
                balls: 0,
                wickets: 0,
                dots: 0,
                fours: 0,
                sixes: 0,
                strikeRate: 0,
                economy: 0,
                average: null,
                boundaryPercentage: 0,
            };
            current.runs += phase.runs;
            current.balls += phase.balls;
            current.dots += phase.dots;
            current.fours += phase.fours;
            current.sixes += phase.sixes;
            map.set(phase.phase, current);
        }
    }
    const phases = [...map.values()].map((phase) => {
        const boundaryRuns = phase.fours * 4 + phase.sixes * 6;
        return {
            ...phase,
            strikeRate: phase.balls > 0 ? round((phase.runs / phase.balls) * 100) : 0,
            economy: phase.balls > 0 ? round(phase.runs / (phase.balls / 6)) : 0,
            boundaryPercentage: phase.runs > 0 ? round((boundaryRuns / phase.runs) * 100, 1) : 0,
        };
    });
    return { phases, covered };
}

export function paceVsSpin(rows: BattingRow[]): { sides: PaceSpinStat[]; covered: number } {
    let covered = 0;
    const acc = {
        pace: { runs: 0, balls: 0, fours: 0, sixes: 0, dismissals: 0 },
        spin: { runs: 0, balls: 0, fours: 0, sixes: 0, dismissals: 0 },
    };
    for (const row of rows) {
        const pace = row.vsPace;
        const spin = row.vsSpin;
        if (!pace && !spin) continue;
        if ((pace?.balls || 0) + (spin?.balls || 0) <= 0) continue;
        covered += 1;
        if (pace) {
            acc.pace.runs += pace.runs;
            acc.pace.balls += pace.balls;
            acc.pace.fours += pace.fours;
            acc.pace.sixes += pace.sixes;
            if (pace.dismissed) acc.pace.dismissals += 1;
        }
        if (spin) {
            acc.spin.runs += spin.runs;
            acc.spin.balls += spin.balls;
            acc.spin.fours += spin.fours;
            acc.spin.sixes += spin.sixes;
            if (spin.dismissed) acc.spin.dismissals += 1;
        }
    }
    const toStat = (side: "pace" | "spin", label: string): PaceSpinStat => {
        const item = acc[side];
        return {
            side,
            label,
            ...item,
            average: item.dismissals > 0 ? round(item.runs / item.dismissals) : null,
            strikeRate: item.balls > 0 ? round((item.runs / item.balls) * 100) : 0,
        };
    };
    return { sides: [toStat("pace", "Pace"), toStat("spin", "Spin")], covered };
}

export function zoneCounts(rows: BattingRow[]): { zones: NamedCount[]; covered: number } {
    const totals = new Map<string, number>();
    let covered = 0;
    for (const row of rows) {
        const zones = row.zones || {};
        const sum = Object.values(zones).reduce((total: number, n) => total + (n || 0), 0);
        if (sum <= 0) continue;
        covered += 1;
        for (const [key, value] of Object.entries(zones)) {
            totals.set(key, (totals.get(key) || 0) + (value || 0));
        }
    }
    return {
        covered,
        zones: SHOT_ZONES.map((zone) => ({
            key: zone.id,
            label: zone.label,
            count: totals.get(zone.id) || 0,
        })),
    };
}

export function entryPressure(rows: BattingRow[]) {
    const detailed = rows.filter((row) => row.entryWickets != null);
    return {
        coverage: coverage(rows.length, detailed.length),
        pressure: battingStats(detailed.filter((row) => (row.entryWickets || 0) >= 3)),
        settled: battingStats(detailed.filter((row) => (row.entryWickets || 0) < 3)),
    };
}

export function teamShare(rows: BattingRow[]) {
    const detailed = rows.filter((row) => (row.teamScore?.runs || 0) > 0);
    const shares = detailed.map((row) => row.runs / (row.teamScore!.runs || 1));
    return {
        coverage: coverage(rows.length, detailed.length),
        averageShare: shares.length ? round((average(shares) || 0) * 100, 1) : null,
        samples: detailed.length,
    };
}

export function milestoneBalls(rows: BattingRow[]) {
    const to50 = rows.filter((row) => (row.ballsTo50 || 0) > 0).map((row) => row.ballsTo50!);
    const to100 = rows.filter((row) => (row.ballsTo100 || 0) > 0).map((row) => row.ballsTo100!);
    const covered = rows.filter((row) => (row.ballsTo50 || 0) > 0 || (row.ballsTo100 || 0) > 0).length;
    return {
        coverage: coverage(rows.length, covered),
        avgBallsTo50: average(to50),
        avgBallsTo100: average(to100),
        samples50: to50.length,
        samples100: to100.length,
    };
}

export function partnerships(rows: BattingRow[]): { rows: PartnershipAgg[]; covered: number } {
    const map = new Map<number, { count: number; runs: number; balls: number; myRuns: number; best: number }>();
    let covered = 0;
    for (const row of rows) {
        const list = (row.partnerships || []).filter((p) => p.runs > 0 || (p.partner || "").trim());
        if (list.length === 0) continue;
        covered += 1;
        for (const item of list) {
            const wicket = item.wicket || 0;
            const current = map.get(wicket) || { count: 0, runs: 0, balls: 0, myRuns: 0, best: 0 };
            current.count += 1;
            current.runs += item.runs;
            current.balls += item.balls;
            current.myRuns += item.myRuns;
            current.best = Math.max(current.best, item.runs);
            map.set(wicket, current);
        }
    }
    return {
        covered,
        rows: [...map.entries()]
            .sort(([a], [b]) => a - b)
            .map(([wicket, item]) => ({
                wicket,
                count: item.count,
                runs: item.runs,
                balls: item.balls,
                myRuns: item.myRuns,
                average: item.count > 0 ? round(item.runs / item.count) : 0,
                best: item.best,
            })),
    };
}

export function categoricalBatting(rows: BattingRow[]) {
    const detailed = rows.filter((row) => row.hasDetail);
    return {
        bowlerTypes: countBy(
            detailed
                .filter((row) => row.bowlerType)
                .map((row) => ({
                    key: row.bowlerType!,
                    label: BOWLER_TYPE_LABELS[row.bowlerType as BowlerType] || row.bowlerType!,
                }))
        ),
        lengths: countBy(
            detailed
                .filter((row) => row.deliveryLength && !row.isNotOut)
                .map((row) => ({
                    key: row.deliveryLength!,
                    label: DELIVERY_LENGTH_LABELS[row.deliveryLength as DeliveryLength] || row.deliveryLength!,
                }))
        ),
        shots: countBy(
            detailed
                .filter((row) => row.shotPlayed && !row.isNotOut)
                .map((row) => ({
                    key: row.shotPlayed!,
                    label: SHOT_LABELS[row.shotPlayed as ShotPlayed] || row.shotPlayed!,
                }))
        ),
    };
}

export function bowlingDetailStats(rows: BowlingRow[]) {
    const withDots = rows.filter((row) => row.hasDetail && row.dots != null);
    const balls = withDots.reduce((s, r) => s + (r.ballsBowled || oversToBalls(r.overs)), 0);
    const dots = withDots.reduce((s, r) => s + (r.dots || 0), 0);
    const boundaryBalls = withDots.reduce((s, r) => s + (r.foursConceded || 0) + (r.sixesConceded || 0), 0);

    const phaseMap = new Map<string, PhaseStat>();
    let phaseCovered = 0;
    for (const row of rows) {
        const phases = (row.phases || []).filter((p) => p.balls > 0 || p.runs > 0 || p.wickets > 0);
        if (phases.length === 0) continue;
        phaseCovered += 1;
        for (const phase of phases) {
            const current = phaseMap.get(phase.phase) || {
                phase: phase.phase,
                label: phaseLabel(phase.phase),
                runs: 0,
                balls: 0,
                wickets: 0,
                dots: 0,
                fours: 0,
                sixes: 0,
                strikeRate: 0,
                economy: 0,
                average: null,
                boundaryPercentage: 0,
            };
            current.runs += phase.runs;
            current.balls += phase.balls;
            current.wickets += phase.wickets;
            current.dots += phase.dots;
            phaseMap.set(phase.phase, current);
        }
    }
    const phases = [...phaseMap.values()].map((phase) => ({
        ...phase,
        economy: phase.balls > 0 ? round(phase.runs / (phase.balls / 6)) : 0,
        strikeRate: phase.wickets > 0 ? round(phase.balls / phase.wickets) : 0,
        average: phase.wickets > 0 ? round(phase.runs / phase.wickets) : null,
    }));

    const wickets = rows.flatMap((row) => row.wicketsDetail || []);
    const topOrder = wickets.filter((w) => (w.batterPosition || 0) >= 1 && (w.batterPosition || 0) <= 4).length;
    const droppedRows = rows.filter((row) => row.catchesDroppedOffBowling != null && row.hasDetail);

    const spellRows = rows.filter((row) => (row.spells || []).some((s) => s.overs > 0 || s.wickets > 0 || s.runs > 0));
    const foldSpells = (pick: (spells: NonNullable<BowlingRow["spells"]>) => NonNullable<BowlingRow["spells"]>) => {
        let spells = 0;
        let balls = 0;
        let runs = 0;
        let wkts = 0;
        for (const row of spellRows) {
            for (const spell of pick(row.spells || [])) {
                spells += 1;
                balls += oversToBalls(spell.overs);
                runs += spell.runs;
                wkts += spell.wickets;
            }
        }
        const overs = balls / 6;
        return {
            spells,
            overs: balls > 0 ? Number((balls / 6).toFixed(1)) : 0,
            runs,
            wickets: wkts,
            economy: overs > 0 ? round(runs / overs) : 0,
        };
    };

    return {
        coverage: coverage(rows.length, rows.filter((row) => row.hasDetail).length),
        dotPct: balls > 0 ? round((dots / balls) * 100, 1) : null,
        boundaryBallPct: balls > 0 ? round((boundaryBalls / balls) * 100, 1) : null,
        phases,
        phaseCoverage: coverage(rows.length, phaseCovered),
        topOrderWicketPct: wickets.length > 0 ? round((topOrder / wickets.length) * 100, 1) : null,
        wicketQualitySamples: wickets.length,
        wicketQualityCoverage: coverage(
            rows.filter((row) => row.wickets > 0).length,
            rows.filter((row) => (row.wicketsDetail || []).length > 0).length
        ),
        wicketTypes: countBy(
            wickets
                .filter((w) => w.dismissalType)
                .map((w) => ({
                    key: w.dismissalType!,
                    label: DISMISSAL_LABELS[w.dismissalType as DismissalType] || w.dismissalType!,
                }))
        ),
        wicketLengths: countBy(
            wickets
                .filter((w) => w.deliveryLength)
                .map((w) => ({
                    key: w.deliveryLength!,
                    label: DELIVERY_LENGTH_LABELS[w.deliveryLength as DeliveryLength] || w.deliveryLength!,
                }))
        ),
        firstSpell: foldSpells((spells) => spells.slice(0, 1)),
        laterSpells: foldSpells((spells) => spells.slice(1)),
        spellCoverage: coverage(rows.length, spellRows.length),
        dropped: droppedRows.reduce((s, r) => s + (r.catchesDroppedOffBowling || 0), 0),
        droppedCoverage: coverage(rows.length, droppedRows.length),
    };
}

export function wicketHistogram(rows: BowlingRow[]): NamedCount[] {
    const byMatch = new Map<string, number>();
    for (const row of rows) byMatch.set(row.matchId, (byMatch.get(row.matchId) || 0) + row.wickets);
    const bins = ["0", "1", "2", "3", "4", "5+"];
    const counts = new Map(bins.map((bin) => [bin, 0]));
    for (const wickets of byMatch.values()) {
        const key = wickets >= 5 ? "5+" : String(wickets);
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    return bins.map((bin) => ({ key: bin, label: bin, count: counts.get(bin) || 0 }));
}
