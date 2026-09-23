import type { AnalyticsFilters, CareerSummary, FormatStats, OpponentStats, VenueStats } from "@/types";
import { clamp } from "./math";
import { battingStats } from "./batting";
import { bowlingStats } from "./bowling";
import { fieldingHasDetail, fieldingStats } from "./fielding";
import { coverage } from "./coverage";
import { buildSplits } from "./splits";
import {
    calendarCells,
    formIndex,
    impactSeries,
    rollingForm,
    scatterPoints,
    toTrendPoints,
    yearBars,
} from "./trends";
import { bestFigures, milestones, topScores } from "./records";
import {
    battingPhases,
    bowlerCounts,
    bowlingDetailStats,
    categoricalBatting,
    dismissalCounts,
    entryPressure,
    milestoneBalls,
    paceVsSpin,
    partnerships,
    runTypeRates,
    scoreDistribution,
    teamShare,
    wicketHistogram,
    zoneCounts,
} from "./detail";
import { filterDataset, loadCareer } from "./loader";
import type {
    AllroundTabData,
    AnalyticsTabId,
    BattingTabData,
    BowlingTabData,
    CareerDataset,
    FieldingRow,
    FieldingTabData,
    H2HTabData,
    OverviewData,
    RadarAxis,
    SplitsTabData,
    TrendsTabData,
} from "./types";

function resultCounts(rows: FieldingRow[]) {
    const count = (result: string) => rows.filter((row) => row.result === result).length;
    return {
        won: count("won"),
        lost: count("lost"),
        draw: count("draw"),
        tie: count("tie"),
        noResult: count("no_result"),
    };
}

export function toCareerSummary(data: CareerDataset): CareerSummary {
    const bat = battingStats(data.batting);
    const bowl = bowlingStats(data.bowling);
    const field = fieldingStats(data.fielding);
    const results = resultCounts(data.fielding);
    const matches = data.fielding.length;
    return {
        matches,
        innings: bat.innings,
        runs: bat.runs,
        highestScore: bat.highest,
        battingAverage: bat.average,
        strikeRate: bat.strikeRate,
        fifties: bat.fifties,
        centuries: bat.centuries,
        ducks: bat.ducks,
        notOuts: bat.notOuts,
        fours: bat.fours,
        sixes: bat.sixes,
        wickets: bowl.wickets,
        bowlingAverage: bowl.average,
        economy: bowl.economy,
        bowlingStrikeRate: bowl.strikeRate,
        bestBowling: bowl.best,
        threeWicketHauls: bowl.threeWicketHauls,
        fiveWicketHauls: bowl.fiveWicketHauls,
        catches: field.catches,
        runOuts: field.runOuts,
        stumpings: field.stumpings,
        matchesWon: results.won,
        matchesLost: results.lost,
        matchesDrawn: results.draw,
        matchesTied: results.tie,
        matchesNoResult: results.noResult,
        winPercentage: matches > 0 ? Math.round((results.won / matches) * 1000) / 10 : 0,
        playerOfMatch: data.fielding.filter((row) => row.playerOfMatch).length,
        boundaryPercentage: bat.boundaryPercentage,
        ballsPerBoundary: bat.ballsPerBoundary,
        fourWicketHauls: bowl.fourWicketHauls,
        thirties: bat.thirties,
        goldenDucks: bat.goldenDucks,
        bowlingInnings: bowl.innings,
    };
}

export function emptyCareerSummary(): CareerSummary {
    return toCareerSummary({ matches: [], batting: [], bowling: [], fielding: [] });
}

export function toFormatStats(data: CareerDataset): FormatStats[] {
    return buildSplits(data, "format").map((row) => ({
        format: row.key as FormatStats["format"],
        matches: row.matches,
        innings: row.innings,
        runs: row.runs,
        battingAverage: row.battingAverage,
        strikeRate: row.strikeRate,
        fifties: row.fifties,
        centuries: row.centuries,
        wickets: row.wickets,
        bowlingAverage: row.bowlingAverage,
        economy: row.economy,
    }));
}

export function toOpponentStats(data: CareerDataset): OpponentStats[] {
    return buildSplits(data, "opponent").map((row) => ({
        opponent: row.label,
        matches: row.matches,
        runs: row.runs,
        battingAverage: row.battingAverage,
        strikeRate: row.strikeRate,
        wickets: row.wickets,
        bowlingAverage: row.bowlingAverage,
        economy: row.economy,
    }));
}

export function toVenueStats(data: CareerDataset): VenueStats[] {
    const grouped = new Map<string, CareerDataset>();
    const consider = (row: { venue: string; city: string; country: string; matchId: string }) => {
        const key = `${row.venue}|${row.city}|${row.country}`;
        return key;
    };
    for (const row of data.fielding) {
        const key = consider(row);
        const bucket = grouped.get(key) || { matches: [], batting: [], bowling: [], fielding: [] };
        bucket.fielding.push(row);
        grouped.set(key, bucket);
    }
    for (const row of data.batting) {
        const key = consider(row);
        const bucket = grouped.get(key) || { matches: [], batting: [], bowling: [], fielding: [] };
        bucket.batting.push(row);
        grouped.set(key, bucket);
    }
    for (const row of data.bowling) {
        const key = consider(row);
        const bucket = grouped.get(key) || { matches: [], batting: [], bowling: [], fielding: [] };
        bucket.bowling.push(row);
        grouped.set(key, bucket);
    }
    return [...grouped.entries()]
        .map(([key, bucket]) => {
            const [venue, city, country] = key.split("|");
            const bat = battingStats(bucket.batting);
            const bowl = bowlingStats(bucket.bowling);
            return {
                venue: venue || "Unknown venue",
                city: city || "",
                country: country || "",
                matches: bucket.fielding.length || new Set(bucket.batting.map((row) => row.matchId)).size,
                runs: bat.runs,
                battingAverage: bat.average,
                wickets: bowl.wickets,
                bowlingAverage: bowl.average,
            };
        })
        .sort((a, b) => b.matches - a.matches || b.runs - a.runs);
}

export function toRecordCoverage(data: CareerDataset) {
    const totalMatches = data.matches.length;
    const withPerformance = data.fielding.length;
    const withSeries = data.matches.filter((match) => match.seriesId).length;
    return {
        totalMatches,
        withPerformance,
        withoutPerformance: Math.max(0, totalMatches - withPerformance),
        pctWithPerformance: totalMatches > 0 ? Math.round((withPerformance / totalMatches) * 100) : 0,
        withSeries,
        pctSeriesTagged: totalMatches > 0 ? Math.round((withSeries / totalMatches) * 100) : 0,
    };
}

export function toVenueTypeOutcomes(data: CareerDataset) {
    const order = ["home", "away", "neutral", "unknown"] as const;
    return order.map((venueType) => {
        const rows = data.fielding.filter((row) => (row.venueType || "unknown") === venueType);
        return {
            venueType,
            matches: rows.length,
            won: rows.filter((row) => row.result === "won").length,
            lost: rows.filter((row) => row.result === "lost").length,
            other: rows.filter((row) => row.result === "draw" || row.result === "tie" || row.result === "no_result").length,
        };
    });
}

export function toMonthlyVolume(data: CareerDataset) {
    const counts = new Map<string, number>();
    for (const row of data.fielding) {
        const key = row.date.slice(0, 7);
        counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, count]) => {
            const [year, month] = key.split("-").map(Number);
            const label = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-IN", {
                month: "short",
                year: "2-digit",
            });
            return { key, label, count };
        });
}

export function toToss(data: CareerDataset) {
    const stats = {
        wonTossWonMatch: 0,
        wonTossLostMatch: 0,
        lostTossWonMatch: 0,
        lostTossLostMatch: 0,
        excludedNoTossOrSide: 0,
        excludedNonDecisiveResult: 0,
    };
    for (const row of data.fielding) {
        if (row.userWonToss == null) {
            stats.excludedNoTossOrSide += 1;
            continue;
        }
        if (row.result !== "won" && row.result !== "lost") {
            stats.excludedNonDecisiveResult += 1;
            continue;
        }
        if (row.userWonToss && row.result === "won") stats.wonTossWonMatch += 1;
        else if (row.userWonToss) stats.wonTossLostMatch += 1;
        else if (row.result === "won") stats.lostTossWonMatch += 1;
        else stats.lostTossLostMatch += 1;
    }
    return stats;
}

export function skillsRadar(data: CareerDataset): RadarAxis[] {
    const bat = battingStats(data.batting);
    const bowl = bowlingStats(data.bowling);
    const field = fieldingStats(data.fielding);
    const rates = runTypeRates(data.batting);
    return [
        {
            key: "average",
            label: "Batting avg",
            raw: bat.average == null ? "—" : String(bat.average),
            score: clamp(((bat.average || 0) / 50) * 100),
        },
        {
            key: "sr",
            label: "Strike rate",
            raw: String(bat.strikeRate),
            score: clamp((bat.strikeRate / 160) * 100),
        },
        {
            key: "economy",
            label: "Economy",
            raw: String(bowl.economy),
            score: clamp(((12 - bowl.economy) / 12) * 100),
        },
        {
            key: "bowlSr",
            label: "Bowling SR",
            raw: bowl.strikeRate == null ? "—" : String(bowl.strikeRate),
            score: bowl.strikeRate == null ? 0 : clamp(((40 - bowl.strikeRate) / 40) * 100),
        },
        {
            key: "dot",
            label: "Dot %",
            raw: rates.dotPct == null ? "—" : `${rates.dotPct}%`,
            score: rates.dotPct ?? 0,
        },
        {
            key: "fielding",
            label: "Fielding",
            raw: `${field.dismissalsPerMatch}/match`,
            score: clamp((field.dismissalsPerMatch / 1.5) * 100),
        },
    ];
}

function overview(data: CareerDataset): OverviewData {
    const summary = toCareerSummary(data);
    const results = resultCounts(data.fielding);
    const unrecorded = Math.max(0, summary.matches - results.won - results.lost - results.draw - results.tie - results.noResult);
    return {
        summary,
        form: formIndex(data.batting),
        radar: skillsRadar(data),
        milestones: milestones(data.batting, data.bowling),
        formats: toFormatStats(data),
        results: { ...results, noResult: results.noResult + unrecorded },
        recordCoverage: toRecordCoverage(data),
        venueTypeOutcomes: toVenueTypeOutcomes(data),
        monthlyVolume: toMonthlyVolume(data),
        toss: toToss(data),
        tierSplit: buildSplits(data, "tier"),
        dismissalBreakdown: dismissalCounts(data.batting),
    };
}

function battingTab(data: CareerDataset): BattingTabData {
    const rates = runTypeRates(data.batting);
    const phases = battingPhases(data.batting);
    const pace = paceVsSpin(data.batting);
    const zones = zoneCounts(data.batting);
    const entry = entryPressure(data.batting);
    const share = teamShare(data.batting);
    const balls = milestoneBalls(data.batting);
    const partners = partnerships(data.batting);
    const cats = categoricalBatting(data.batting);
    return {
        core: battingStats(data.batting),
        distribution: scoreDistribution(data.batting),
        positions: buildSplits(data, "position"),
        inningsSplit: buildSplits(data, "innings"),
        chaseSplit: buildSplits(data, "battingFirst"),
        dismissals: dismissalCounts(data.batting),
        bowlers: bowlerCounts(data.batting),
        topScores: topScores(data.batting),
        detailCoverage: rates.coverage,
        dotPct: rates.dotPct,
        scoringShotPct: rates.scoringShotPct,
        strikeRotationPct: rates.strikeRotationPct,
        phases: phases.phases,
        phaseCoverage: coverage(data.batting.length, phases.covered),
        paceSpin: pace.sides,
        paceSpinCoverage: coverage(data.batting.length, pace.covered),
        bowlerTypes: cats.bowlerTypes,
        lengths: cats.lengths,
        shots: cats.shots,
        zones: zones.zones,
        zoneCoverage: coverage(data.batting.length, zones.covered),
        avgBallsTo50: balls.avgBallsTo50,
        avgBallsTo100: balls.avgBallsTo100,
        samples50: balls.samples50,
        samples100: balls.samples100,
        milestoneCoverage: balls.coverage,
        entryPressure: entry.pressure,
        entrySettled: entry.settled,
        entryCoverage: entry.coverage,
        teamShare: share.averageShare,
        teamShareSamples: share.samples,
        teamShareCoverage: share.coverage,
        partnerships: partners.rows,
        partnershipCoverage: coverage(data.batting.length, partners.covered),
    };
}

function bowlingTab(data: CareerDataset): BowlingTabData {
    const detail = bowlingDetailStats(data.bowling);
    return {
        core: bowlingStats(data.bowling),
        histogram: wicketHistogram(data.bowling).map((bin) => ({ label: bin.label, count: bin.count })),
        bestFigures: bestFigures(data.bowling),
        detailCoverage: detail.coverage,
        dotPct: detail.dotPct,
        boundaryBallPct: detail.boundaryBallPct,
        phases: detail.phases,
        phaseCoverage: detail.phaseCoverage,
        topOrderWicketPct: detail.topOrderWicketPct,
        wicketQualitySamples: detail.wicketQualitySamples,
        wicketQualityCoverage: detail.wicketQualityCoverage,
        wicketTypes: detail.wicketTypes,
        wicketLengths: detail.wicketLengths,
        firstSpell: detail.firstSpell,
        laterSpells: detail.laterSpells,
        spellCoverage: detail.spellCoverage,
        dropped: detail.dropped,
        droppedCoverage: detail.droppedCoverage,
    };
}

function fieldingTab(data: CareerDataset): FieldingTabData {
    return {
        core: fieldingStats(data.fielding),
        detailCoverage: coverage(data.fielding.length, data.fielding.filter(fieldingHasDetail).length),
    };
}

function allroundTab(data: CareerDataset): AllroundTabData {
    const bat = battingStats(data.batting);
    const bowl = bowlingStats(data.bowling);
    return {
        battingAverage: bat.average,
        bowlingAverage: bowl.average,
        index: bat.average != null && bowl.average != null ? Math.round((bat.average - bowl.average) * 100) / 100 : null,
        captain: buildSplits(data, "captain"),
        keeper: buildSplits(data, "keeper"),
        results: buildSplits(data, "result"),
        impact: impactSeries(data),
    };
}

function h2hTab(data: CareerDataset, opponent?: string): H2HTabData {
    const opponents = toOpponentStats(data);
    if (!opponent) return { opponents, selected: null, profile: null };
    const query = opponent.toLowerCase();
    const matched = filterDataset(data, { opponent: query });
    const exact = data.fielding.filter((row) => row.opponent.toLowerCase() === query);
    const profileData = exact.length > 0 ? filterDataset(data, { opponent }) : matched;
    const narrowed: CareerDataset = exact.length
        ? {
              matches: data.matches.filter((row) => row.opponent.toLowerCase() === query),
              batting: data.batting.filter((row) => row.opponent.toLowerCase() === query),
              bowling: data.bowling.filter((row) => row.opponent.toLowerCase() === query),
              fielding: exact,
          }
        : profileData;
    return {
        opponents,
        selected: opponent,
        profile: {
            batting: battingStats(narrowed.batting),
            bowling: bowlingStats(narrowed.bowling),
            fielding: fieldingStats(narrowed.fielding),
            venues: toVenueStats(narrowed),
            timeline: toTrendPoints(narrowed),
            topScores: topScores(narrowed.batting, 5),
        },
    };
}

export async function getAnalyticsTab(tab: AnalyticsTabId, filters?: AnalyticsFilters) {
    if (tab === "h2h") {
        const { opponent, ...rest } = filters || {};
        const data = await loadCareer(rest);
        return h2hTab(data, opponent);
    }
    if (tab === "splits") {
        const { dimension, ...rest } = filters || {};
        const data = await loadCareer(rest);
        const dim = dimension || "format";
        const payload: SplitsTabData = { dimension: dim, rows: buildSplits(data, dim) };
        return payload;
    }

    const data = await loadCareer(filters);
    switch (tab) {
        case "overview":
            return overview(data);
        case "batting":
            return battingTab(data);
        case "bowling":
            return bowlingTab(data);
        case "fielding":
            return fieldingTab(data);
        case "allround":
            return allroundTab(data);
        case "trends": {
            const payload: TrendsTabData = {
                trends: toTrendPoints(data),
                rolling: rollingForm(data.batting),
                years: yearBars(data),
                scatter: scatterPoints(data.batting),
                calendar: calendarCells(data.fielding, data.batting),
            };
            return payload;
        }
        default:
            return overview(data);
    }
}

export async function getHomeBundle() {
    const data = await loadCareer();
    return {
        summary: toCareerSummary(data),
        formats: toFormatStats(data),
        trends: toTrendPoints(data),
        form: formIndex(data.batting),
        radar: skillsRadar(data),
    };
}
