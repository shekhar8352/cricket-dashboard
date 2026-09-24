import mongoose from "mongoose";
import { connectDB } from "@/database/mongoose";
import "@/lib/models/Series";
import Match from "@/lib/models/Match";
import Performance, {
    battingDetailIsMeaningful,
    bowlingDetailIsMeaningful,
    type IBattingDetail,
    type IBowlingDetail,
    type IInningsBatting,
    type IInningsBowling,
} from "@/lib/models/Performance";
import { DOMESTIC_LEVELS, isMultiInningsFormat, type MatchFormat, type MatchLevel } from "@/lib/constants";
import type { AnalyticsFilters } from "@/types";
import { oversToBalls } from "./math";
import type { BattingRow, BowlingRow, CareerDataset, FieldingRow, MatchContext } from "./types";

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function userWonToss(tossWinner?: string | null, teamRepresented?: string | null): boolean | null {
    const toss = (tossWinner || "").trim().toLowerCase().replace(/\s+/g, " ");
    const team = (teamRepresented || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (!toss || !team) return null;
    if (toss === team) return true;
    if (toss.length >= 4 && team.length >= 4 && (toss.includes(team) || team.includes(toss))) return true;
    return false;
}

function inferBattedFirst(
    explicit: boolean | undefined,
    wonToss: boolean | null,
    decision?: string | null
): boolean | undefined {
    if (typeof explicit === "boolean") return explicit;
    if (wonToss == null || (decision !== "bat" && decision !== "bowl")) return undefined;
    if (wonToss) return decision === "bat";
    return decision === "bowl";
}

function tierOf(level: string): MatchContext["tier"] {
    if (level === "international") return "international";
    if (level === "ipl") return "ipl";
    return "domestic";
}

function matchInnings(
    format: string,
    slot: BattingRow["inningsSlot"],
    battedFirst?: boolean
): number | null {
    const multi = isMultiInningsFormat(format as MatchFormat);
    if (!multi) {
        if (battedFirst == null) return 1;
        return battedFirst ? 1 : 2;
    }
    if (battedFirst == null) return slot === "second" ? 2 : 1;
    if (slot === "first") return battedFirst ? 1 : 2;
    return battedFirst ? 3 : 4;
}

function presentScore(raw?: { runs?: number; wickets?: number; overs?: number } | null) {
    if (!raw) return undefined;
    const runs = Number(raw.runs) || 0;
    const wickets = Number(raw.wickets) || 0;
    const overs = Number(raw.overs) || 0;
    if (runs <= 0 && wickets <= 0 && overs <= 0) return undefined;
    return { runs, wickets, overs };
}

export function buildMatchFilterQuery(filters?: AnalyticsFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {};
    if (!filters) return query;

    if (filters.format) query.format = filters.format;
    if (filters.level) query.level = filters.level;
    else if (filters.tier === "international") query.level = "international";
    else if (filters.tier === "domestic") query.level = { $in: DOMESTIC_LEVELS };

    if (filters.opponent) query.opponent = { $regex: escapeRegex(filters.opponent), $options: "i" };
    if (filters.series && mongoose.Types.ObjectId.isValid(filters.series)) {
        query.series = new mongoose.Types.ObjectId(filters.series);
    }
    if (filters.venue) query.venue = { $regex: escapeRegex(filters.venue), $options: "i" };
    if (filters.venueType) query.venueType = filters.venueType;
    if (filters.homeAway) query.venueType = filters.homeAway;
    if (filters.result) query.result = filters.result;

    const date: { $gte?: Date; $lte?: Date } = {};
    if (filters.year && /^\d{4}$/.test(filters.year)) {
        const year = Number(filters.year);
        date.$gte = new Date(Date.UTC(year, 0, 1));
        date.$lte = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    }
    if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (!date.$gte || start > date.$gte) date.$gte = start;
    }
    if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (!date.$lte || end < date.$lte) date.$lte = end;
    }
    if (date.$gte || date.$lte) query.date = date;
    return query;
}

type LeanMatch = {
    _id: mongoose.Types.ObjectId;
    series?: { _id: mongoose.Types.ObjectId; name?: string } | mongoose.Types.ObjectId;
    format: MatchFormat;
    level: MatchLevel;
    date: Date | string;
    venue: string;
    city: string;
    country?: string;
    opponent: string;
    teamRepresented?: string;
    venueType?: MatchContext["venueType"];
    result?: MatchContext["result"];
    pitchType?: string;
    weatherCondition?: string;
    tossWinner?: string;
    tossDecision?: "bat" | "bowl";
    matchType?: string;
    battedFirst?: boolean;
    dayNight?: boolean;
    teamScore?: { runs?: number; wickets?: number; overs?: number };
};

type LeanPerf = {
    match: mongoose.Types.ObjectId;
    batting?: IInningsBatting;
    bowling?: IInningsBowling;
    firstInningsBatting?: IInningsBatting;
    secondInningsBatting?: IInningsBatting;
    firstInningsBowling?: IInningsBowling;
    secondInningsBowling?: IInningsBowling;
    fielding?: {
        catches?: number;
        runOuts?: number;
        stumpings?: number;
        dropped?: number;
        directHits?: number;
        runsSavedEstimate?: number;
        misfields?: number;
    };
    isCaptain?: boolean;
    isWicketkeeper?: boolean;
    playerOfMatch?: boolean;
};

function seriesOf(series: LeanMatch["series"]): { id?: string; name?: string } {
    if (series && typeof series === "object" && "name" in series) {
        return { id: String(series._id), name: series.name };
    }
    if (series) return { id: String(series) };
    return {};
}

function toContext(match: LeanMatch, perf?: LeanPerf): MatchContext {
    const won = userWonToss(match.tossWinner, match.teamRepresented);
    const series = seriesOf(match.series);
    const date = match.date instanceof Date ? match.date.toISOString() : new Date(match.date).toISOString();
    return {
        matchId: String(match._id),
        date,
        format: match.format,
        level: match.level,
        opponent: match.opponent,
        venue: match.venue,
        city: match.city,
        country: match.country || "",
        venueType: match.venueType,
        result: match.result,
        pitchType: match.pitchType,
        weatherCondition: match.weatherCondition,
        tossDecision: match.tossDecision,
        matchType: match.matchType,
        teamRepresented: match.teamRepresented,
        seriesId: series.id,
        seriesName: series.name,
        battedFirst: inferBattedFirst(match.battedFirst, won, match.tossDecision),
        dayNight: typeof match.dayNight === "boolean" ? match.dayNight : undefined,
        teamScore: presentScore(match.teamScore),
        isCaptain: !!perf?.isCaptain,
        isWicketkeeper: !!perf?.isWicketkeeper,
        playerOfMatch: !!perf?.playerOfMatch,
        userWonToss: won,
        tier: tierOf(match.level),
    };
}

function mapBatting(ctx: MatchContext, slot: BattingRow["inningsSlot"], raw?: IInningsBatting): BattingRow | null {
    if (!raw || raw.didNotBat) return null;
    const detail: IBattingDetail | undefined = raw.detail;
    const hasDetail = battingDetailIsMeaningful(detail);
    return {
        ...ctx,
        inningsSlot: slot,
        matchInnings: matchInnings(ctx.format, slot, ctx.battedFirst),
        runs: raw.runs || 0,
        ballsFaced: raw.ballsFaced || 0,
        fours: raw.fours || 0,
        sixes: raw.sixes || 0,
        dismissalType: raw.dismissalType,
        dismissalBowler: raw.dismissalBowler,
        battingPosition: raw.battingPosition,
        isNotOut: raw.dismissalType === "not_out" || raw.dismissalType === "retired_hurt" || raw.isNotOut === true,
        hasDetail,
        dots: detail?.dots,
        singles: detail?.singles,
        twos: detail?.twos,
        threes: detail?.threes,
        minutesBatted: detail?.minutesBatted,
        ballsTo50: detail?.ballsTo50,
        ballsTo100: detail?.ballsTo100,
        entryWickets: detail?.entryWickets,
        vsPace: detail?.vsPace,
        vsSpin: detail?.vsSpin,
        phases: detail?.phases,
        zones: detail?.zones,
        bowlerType: detail?.bowlerType,
        deliveryLength: detail?.deliveryLength,
        shotPlayed: detail?.shotPlayed,
        partnerships: detail?.partnerships,
    };
}

function mapBowling(ctx: MatchContext, slot: BowlingRow["inningsSlot"], raw?: IInningsBowling): BowlingRow | null {
    if (!raw || raw.didNotBowl) return null;
    const balls = raw.ballsBowled > 0 ? raw.ballsBowled : oversToBalls(raw.overs || 0);
    if (balls === 0 && !(raw.wickets > 0)) return null;
    const detail: IBowlingDetail | undefined = raw.detail;
    return {
        ...ctx,
        inningsSlot: slot,
        overs: raw.overs || 0,
        maidens: raw.maidens || 0,
        runsConceded: raw.runsConceded || 0,
        wickets: raw.wickets || 0,
        wides: raw.wides || 0,
        noBalls: raw.noBalls || 0,
        ballsBowled: balls,
        hasDetail: bowlingDetailIsMeaningful(detail),
        dots: detail?.dots,
        foursConceded: detail?.foursConceded,
        sixesConceded: detail?.sixesConceded,
        phases: detail?.phases,
        spells: detail?.spells,
        wicketsDetail: detail?.wicketsDetail,
        catchesDroppedOffBowling: detail?.catchesDroppedOffBowling,
    };
}

export function filterDataset(data: CareerDataset, filters?: AnalyticsFilters): CareerDataset {
    if (!filters?.format && !filters?.opponent && !filters?.venue) return data;
    const ok = (row: MatchContext) => {
        if (filters.format && row.format !== filters.format) return false;
        if (filters.opponent && !row.opponent.toLowerCase().includes(filters.opponent.toLowerCase())) return false;
        if (filters.venue && !row.venue.toLowerCase().includes(filters.venue.toLowerCase())) return false;
        return true;
    };
    return {
        matches: data.matches.filter(ok),
        batting: data.batting.filter(ok),
        bowling: data.bowling.filter(ok),
        fielding: data.fielding.filter(ok),
    };
}

export async function loadCareer(filters?: AnalyticsFilters): Promise<CareerDataset> {
    await connectDB();
    const matchDocs = (await Match.find(buildMatchFilterQuery(filters)).populate("series", "name").lean()) as unknown as LeanMatch[];
    const ids = matchDocs.map((match) => match._id);
    const perfs = (ids.length
        ? await Performance.find({ match: { $in: ids } }).lean()
        : []) as unknown as LeanPerf[];
    const perfByMatch = new Map(perfs.map((perf) => [String(perf.match), perf]));

    const matches: MatchContext[] = [];
    const batting: BattingRow[] = [];
    const bowling: BowlingRow[] = [];
    const fielding: FieldingRow[] = [];

    for (const match of matchDocs) {
        const perf = perfByMatch.get(String(match._id));
        if (filters?.captain === "yes" && !perf?.isCaptain) continue;
        if (filters?.captain === "no" && (!perf || perf.isCaptain)) continue;

        const ctx = toContext(match, perf);
        matches.push(ctx);
        if (!perf) continue;

        fielding.push({
            ...ctx,
            catches: perf.fielding?.catches || 0,
            runOuts: perf.fielding?.runOuts || 0,
            stumpings: perf.fielding?.stumpings || 0,
            dropped: perf.fielding?.dropped || 0,
            directHits: perf.fielding?.directHits || 0,
            runsSavedEstimate: perf.fielding?.runsSavedEstimate || 0,
            misfields: perf.fielding?.misfields || 0,
        });

        const slots: { bat?: IInningsBatting; bowl?: IInningsBowling; slot: BattingRow["inningsSlot"] }[] =
            isMultiInningsFormat(match.format)
                ? [
                      { bat: perf.firstInningsBatting, bowl: perf.firstInningsBowling, slot: "first" },
                      { bat: perf.secondInningsBatting, bowl: perf.secondInningsBowling, slot: "second" },
                  ]
                : [{ bat: perf.batting, bowl: perf.bowling, slot: "single" }];

        for (const slot of slots) {
            const bat = mapBatting(ctx, slot.slot, slot.bat);
            if (bat) batting.push(bat);
            const bowl = mapBowling(ctx, slot.slot, slot.bowl);
            if (bowl) bowling.push(bowl);
        }
    }

    batting.sort((a, b) => a.date.localeCompare(b.date));
    bowling.sort((a, b) => a.date.localeCompare(b.date));
    fielding.sort((a, b) => a.date.localeCompare(b.date));

    return { matches, batting, bowling, fielding };
}
