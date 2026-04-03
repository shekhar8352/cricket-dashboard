import { connectDB } from "@/database/mongoose";
import Match, { IMatch } from "@/lib/models/Match";
import Performance from "@/lib/models/Performance";
import "@/lib/models/Series"; // Ensure Series model is registered
import {
    MatchFormData,
    MatchListItem,
    MatchFilters,
    MatchReadOnlyDetail,
    PerformanceReadOnly,
    PerformanceInningsRead,
} from "@/types";
import mongoose from "mongoose";

/**
 * Get all matches with optional filters
 */
export async function getAllMatches(
    filters?: MatchFilters
): Promise<MatchListItem[]> {
    await connectDB();

    const query: Record<string, unknown> = {};

    if (filters?.format) query.format = filters.format;
    if (filters?.level) query.level = filters.level;
    if (filters?.opponent) query.opponent = { $regex: filters.opponent, $options: "i" };
    if (filters?.series) query.seriesId = new mongoose.Types.ObjectId(filters.series);
    if (filters?.result) query.result = filters.result;
    if (filters?.venue) query.venue = { $regex: filters.venue, $options: "i" };

    // Date range filter
    if (filters?.startDate || filters?.endDate) {
        query.date = {};
        if (filters.startDate) {
            (query.date as Record<string, Date>).$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            (query.date as Record<string, Date>).$lte = new Date(filters.endDate);
        }
    }

    const matches = await Match.find(query)
        .populate("series", "name")
        .sort({ date: -1 })
        .lean<any[]>();

    // Get performance existence for each match
    const matchIds = matches.map((m) => m._id);
    const performances = await Performance.find(
        { match: { $in: matchIds } },
        { match: 1 }
    ).lean();
    const performanceMatchIds = new Set(
        performances.map((p) => p.match.toString())
    );

    return matches.map((m) => ({
        _id: m._id.toString(),
        series: m.series
            ? { _id: m.series._id.toString(), name: m.series.name }
            : undefined,
        format: m.format,
        level: m.level,
        date: m.date.toISOString(),
        venue: m.venue,
        city: m.city,
        country: m.country,
        opponent: m.opponent,
        teamRepresented: m.teamRepresented,
        venueType: m.venueType,
        result: m.result,
        resultMargin: m.resultMargin,
        hasPerformance: performanceMatchIds.has(m._id.toString()),
        notes: m.notes,
    }));
}

/**
 * Get a single match by ID
 */
export async function getMatchById(id: string): Promise<MatchListItem | null> {
    await connectDB();

    const match = await Match.findById(id)
        .populate("series", "name")
        .lean<any>();

    if (!match) return null;

    // Check if performance exists
    const performance = await Performance.findOne({ match: id }).lean();

    return {
        _id: match._id.toString(),
        series: match.series
            ? { _id: match.series._id.toString(), name: match.series.name }
            : undefined,
        format: match.format,
        level: match.level,
        date: match.date.toISOString(),
        venue: match.venue,
        city: match.city,
        country: match.country,
        opponent: match.opponent,
        teamRepresented: match.teamRepresented,
        venueType: match.venueType,
        result: match.result,
        resultMargin: match.resultMargin,
        hasPerformance: !!performance,
        pitchType: match.pitchType,
        weatherCondition: match.weatherCondition,
        notes: match.notes,
    };
}

function inningsBattingRead(b: Record<string, unknown> | undefined): PerformanceInningsRead | undefined {
    if (!b) return undefined;
    return {
        didNotBat: b.didNotBat as boolean | undefined,
        runs: b.runs as number | undefined,
        ballsFaced: b.ballsFaced as number | undefined,
        fours: b.fours as number | undefined,
        sixes: b.sixes as number | undefined,
        dismissalType: b.dismissalType as string | undefined,
        dismissalBowler: b.dismissalBowler as string | undefined,
        dismissalFielder: b.dismissalFielder as string | undefined,
        strikeRate: b.strikeRate as number | undefined,
    };
}

function inningsBowlingRead(b: Record<string, unknown> | undefined): PerformanceInningsRead | undefined {
    if (!b) return undefined;
    return {
        didNotBowl: b.didNotBowl as boolean | undefined,
        overs: b.overs as number | undefined,
        maidens: b.maidens as number | undefined,
        runsConceded: b.runsConceded as number | undefined,
        wickets: b.wickets as number | undefined,
        wides: b.wides as number | undefined,
        noBalls: b.noBalls as number | undefined,
        economy: b.economy as number | undefined,
    };
}

function performanceToRead(p: Record<string, unknown>): PerformanceReadOnly {
    const fielding = (p.fielding as Record<string, number>) || {};
    return {
        isCaptain: !!p.isCaptain,
        isWicketkeeper: !!p.isWicketkeeper,
        matchRuns: Number(p.matchRuns) || 0,
        matchWickets: Number(p.matchWickets) || 0,
        matchBallsFaced: Number(p.matchBallsFaced) || 0,
        matchOvers: Number(p.matchOvers) || 0,
        fielding: {
            catches: fielding.catches ?? 0,
            runOuts: fielding.runOuts ?? 0,
            stumpings: fielding.stumpings ?? 0,
            totalDismissals: fielding.totalDismissals ?? 0,
        },
        batting: inningsBattingRead(p.batting as Record<string, unknown>),
        bowling: inningsBowlingRead(p.bowling as Record<string, unknown>),
        firstInningsBatting: inningsBattingRead(p.firstInningsBatting as Record<string, unknown>),
        secondInningsBatting: inningsBattingRead(p.secondInningsBatting as Record<string, unknown>),
        firstInningsBowling: inningsBowlingRead(p.firstInningsBowling as Record<string, unknown>),
        secondInningsBowling: inningsBowlingRead(p.secondInningsBowling as Record<string, unknown>),
    };
}

/**
 * Match + optional performance for read-only detail views.
 */
export async function getMatchReadOnlyDetail(id: string): Promise<MatchReadOnlyDetail | null> {
    await connectDB();

    const match = await Match.findById(id).populate("series", "name").lean<any>();
    if (!match) return null;

    const performanceDoc = await Performance.findOne({ match: id }).lean<Record<string, unknown>>();

    const base: MatchReadOnlyDetail = {
        _id: match._id.toString(),
        series: match.series
            ? { _id: match.series._id.toString(), name: match.series.name }
            : undefined,
        format: match.format,
        level: match.level,
        date: match.date.toISOString(),
        venue: match.venue,
        city: match.city,
        country: match.country,
        opponent: match.opponent,
        teamRepresented: match.teamRepresented,
        venueType: match.venueType,
        result: match.result,
        resultMargin: match.resultMargin,
        hasPerformance: !!performanceDoc,
        pitchType: match.pitchType,
        weatherCondition: match.weatherCondition,
        notes: match.notes,
        tossWinner: match.tossWinner,
        tossDecision: match.tossDecision,
        matchType: match.matchType,
        performance: performanceDoc ? performanceToRead(performanceDoc) : null,
    };

    return base;
}

/**
 * Create a new match
 */
export async function createMatch(data: MatchFormData): Promise<MatchListItem> {
    await connectDB();

    const matchData: Record<string, unknown> = {
        ...data,
        date: new Date(data.date),
    };

    if (data.seriesId) {
        matchData.series = new mongoose.Types.ObjectId(data.seriesId);
    }

    const match = await Match.create(matchData);

    // Populate series for response
    await match.populate("series", "name");

    const populatedMatch = match.toObject() as IMatch & {
        series?: { _id: mongoose.Types.ObjectId; name: string }
    };

    return {
        _id: match._id.toString(),
        series: populatedMatch.series
            ? { _id: populatedMatch.series._id.toString(), name: populatedMatch.series.name }
            : undefined,
        format: match.format,
        level: match.level,
        date: match.date.toISOString(),
        venue: match.venue,
        city: match.city,
        country: match.country,
        opponent: match.opponent,
        teamRepresented: match.teamRepresented,
        venueType: match.venueType,
        result: match.result,
        resultMargin: match.resultMargin,
        hasPerformance: false,
        notes: match.notes,
    };
}

/**
 * Update a match
 */
export async function updateMatch(
    id: string,
    data: Partial<MatchFormData>
): Promise<MatchListItem | null> {
    await connectDB();

    const updateData: Record<string, unknown> = { ...data };
    if (data.date) updateData.date = new Date(data.date);
    if (data.seriesId) updateData.series = new mongoose.Types.ObjectId(data.seriesId);

    const match = await Match.findByIdAndUpdate(id, updateData, { new: true })
        .populate("series", "name")
        .lean<any>();

    if (!match) return null;

    // Check performance existence
    const performance = await Performance.findOne({ match: id }).lean();

    return {
        _id: match._id.toString(),
        series: match.series
            ? { _id: match.series._id.toString(), name: match.series.name }
            : undefined,
        format: match.format,
        level: match.level,
        date: match.date.toISOString(),
        venue: match.venue,
        city: match.city,
        country: match.country,
        opponent: match.opponent,
        teamRepresented: match.teamRepresented,
        venueType: match.venueType,
        result: match.result,
        resultMargin: match.resultMargin,
        hasPerformance: !!performance,
        notes: match.notes,
    };
}

/**
 * Delete a match and its associated performance
 */
export async function deleteMatch(id: string): Promise<boolean> {
    await connectDB();

    // Delete associated performance first
    await Performance.findOneAndDelete({ match: id });

    const result = await Match.findByIdAndDelete(id);
    return !!result;
}

/**
 * Get unique opponents from all matches
 */
export async function getUniqueOpponents(): Promise<string[]> {
    await connectDB();

    const opponents = await Match.distinct("opponent");
    return opponents.sort();
}

/**
 * Get unique venues from all matches
 */
export async function getUniqueVenues(): Promise<{ venue: string; city: string; country: string }[]> {
    await connectDB();

    const venues = await Match.aggregate([
        {
            $group: {
                _id: { venue: "$venue", city: "$city", country: "$country" },
            },
        },
        {
            $project: {
                _id: 0,
                venue: "$_id.venue",
                city: "$_id.city",
                country: "$_id.country",
            },
        },
        { $sort: { venue: 1 } },
    ]);

    return venues;
}
