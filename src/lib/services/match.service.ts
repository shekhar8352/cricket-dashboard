import { connectDB } from "@/database/mongoose";
import Match, { IMatch } from "@/lib/models/Match";
import Performance from "@/lib/models/Performance";
import { MatchFormData, MatchListItem, MatchFilters } from "@/types";
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
    if (filters?.series) query.series = new mongoose.Types.ObjectId(filters.series);
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
        homeAway: m.homeAway,
        result: m.result,
        resultMargin: m.resultMargin,
        hasPerformance: performanceMatchIds.has(m._id.toString()),
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
        homeAway: match.homeAway,
        result: match.result,
        resultMargin: match.resultMargin,
        hasPerformance: !!performance,
    };
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

    if (data.series) {
        matchData.series = new mongoose.Types.ObjectId(data.series);
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
        homeAway: match.homeAway,
        result: match.result,
        resultMargin: match.resultMargin,
        hasPerformance: false,
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
    if (data.series) updateData.series = new mongoose.Types.ObjectId(data.series);

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
        homeAway: match.homeAway,
        result: match.result,
        resultMargin: match.resultMargin,
        hasPerformance: !!performance,
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
