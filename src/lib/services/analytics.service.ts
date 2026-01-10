import { connectDB } from "@/database/mongoose";
import Performance from "@/lib/models/Performance";
import Match from "@/lib/models/Match";
import {
    CareerSummary,
    FormatStats,
    TrendDataPoint,
    OpponentStats,
    VenueStats,
    AnalyticsFilters,
} from "@/types";
import { MatchFormat } from "@/lib/constants";
import mongoose from "mongoose";

/**
 * Build match filter query from analytics filters
 */
function buildMatchFilterQuery(filters?: AnalyticsFilters): Record<string, unknown> {
    const query: Record<string, unknown> = {};

    if (filters?.format) query.format = filters.format;
    if (filters?.level) query.level = filters.level;
    if (filters?.opponent) query.opponent = { $regex: filters.opponent, $options: "i" };
    if (filters?.series) query.series = new mongoose.Types.ObjectId(filters.series);
    if (filters?.venue) query.venue = { $regex: filters.venue, $options: "i" };
    if (filters?.homeAway) query.homeAway = filters.homeAway;

    if (filters?.startDate || filters?.endDate) {
        query.date = {};
        if (filters.startDate) {
            (query.date as Record<string, Date>).$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            (query.date as Record<string, Date>).$lte = new Date(filters.endDate);
        }
    }

    return query;
}

/**
 * Get career summary statistics
 */
export async function getCareerSummary(
    filters?: AnalyticsFilters
): Promise<CareerSummary> {
    await connectDB();

    const matchFilter = buildMatchFilterQuery(filters);

    // Get filtered match IDs
    const matches = await Match.find(matchFilter).lean();
    const matchIds = matches.map((m) => m._id);

    if (matchIds.length === 0) {
        return getEmptyCareerSummary();
    }

    // Aggregate performance data
    const result = await Performance.aggregate([
        { $match: { match: { $in: matchIds } } },
        {
            $lookup: {
                from: "matches",
                localField: "match",
                foreignField: "_id",
                as: "matchData",
            },
        },
        { $unwind: "$matchData" },
        {
            $group: {
                _id: null,
                matches: { $sum: 1 },

                // Batting aggregates
                totalRuns: { $sum: "$matchRuns" },
                totalBallsFaced: { $sum: "$matchBallsFaced" },

                // Count innings (excluding DNB)
                battingInnings: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $and: [{ $ifNull: ["$batting", false] }, { $ne: ["$batting.didNotBat", true] }] },
                                    { $and: [{ $ifNull: ["$firstInningsBatting", false] }, { $ne: ["$firstInningsBatting.didNotBat", true] }] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },

                // Milestones
                fifties: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$batting.isFifty", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBatting.isFifty", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBatting.isFifty", true] }, 1, 0] },
                        ],
                    },
                },
                centuries: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$batting.isCentury", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBatting.isCentury", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBatting.isCentury", true] }, 1, 0] },
                        ],
                    },
                },
                ducks: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$batting.isDuck", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBatting.isDuck", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBatting.isDuck", true] }, 1, 0] },
                        ],
                    },
                },
                notOuts: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$batting.isNotOut", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBatting.isNotOut", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBatting.isNotOut", true] }, 1, 0] },
                        ],
                    },
                },

                // Boundaries
                totalFours: {
                    $sum: {
                        $add: [
                            { $ifNull: ["$batting.fours", 0] },
                            { $ifNull: ["$firstInningsBatting.fours", 0] },
                            { $ifNull: ["$secondInningsBatting.fours", 0] },
                        ],
                    },
                },
                totalSixes: {
                    $sum: {
                        $add: [
                            { $ifNull: ["$batting.sixes", 0] },
                            { $ifNull: ["$firstInningsBatting.sixes", 0] },
                            { $ifNull: ["$secondInningsBatting.sixes", 0] },
                        ],
                    },
                },

                // Bowling aggregates
                totalWickets: { $sum: "$matchWickets" },
                totalOvers: { $sum: "$matchOvers" },
                totalRunsConceded: {
                    $sum: {
                        $add: [
                            { $ifNull: ["$bowling.runsConceded", 0] },
                            { $ifNull: ["$firstInningsBowling.runsConceded", 0] },
                            { $ifNull: ["$secondInningsBowling.runsConceded", 0] },
                        ],
                    },
                },

                // Wicket hauls
                threeWicketHauls: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$bowling.isThreeWicketHaul", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBowling.isThreeWicketHaul", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBowling.isThreeWicketHaul", true] }, 1, 0] },
                        ],
                    },
                },
                fiveWicketHauls: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$bowling.isFiveWicketHaul", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBowling.isFiveWicketHaul", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBowling.isFiveWicketHaul", true] }, 1, 0] },
                        ],
                    },
                },

                // Fielding
                totalCatches: { $sum: "$fielding.catches" },
                totalRunOuts: { $sum: "$fielding.runOuts" },
                totalStumpings: { $sum: "$fielding.stumpings" },

                // Results
                matchesWon: {
                    $sum: { $cond: [{ $eq: ["$matchData.result", "won"] }, 1, 0] },
                },
                matchesLost: {
                    $sum: { $cond: [{ $eq: ["$matchData.result", "lost"] }, 1, 0] },
                },
                matchesDrawn: {
                    $sum: { $cond: [{ $eq: ["$matchData.result", "draw"] }, 1, 0] },
                },

                // For highest score and best bowling
                allBattingScores: {
                    $push: {
                        $concatArrays: [
                            {
                                $cond: [
                                    { $ifNull: ["$batting", false] },
                                    [{ runs: "$batting.runs", isNotOut: "$batting.isNotOut" }],
                                    [],
                                ],
                            },
                            {
                                $cond: [
                                    { $ifNull: ["$firstInningsBatting", false] },
                                    [{ runs: "$firstInningsBatting.runs", isNotOut: "$firstInningsBatting.isNotOut" }],
                                    [],
                                ],
                            },
                            {
                                $cond: [
                                    { $ifNull: ["$secondInningsBatting", false] },
                                    [{ runs: "$secondInningsBatting.runs", isNotOut: "$secondInningsBatting.isNotOut" }],
                                    [],
                                ],
                            },
                        ],
                    },
                },
                allBowlingFigures: {
                    $push: {
                        $concatArrays: [
                            {
                                $cond: [
                                    { $ifNull: ["$bowling", false] },
                                    [{ wickets: "$bowling.wickets", runs: "$bowling.runsConceded" }],
                                    [],
                                ],
                            },
                            {
                                $cond: [
                                    { $ifNull: ["$firstInningsBowling", false] },
                                    [{ wickets: "$firstInningsBowling.wickets", runs: "$firstInningsBowling.runsConceded" }],
                                    [],
                                ],
                            },
                            {
                                $cond: [
                                    { $ifNull: ["$secondInningsBowling", false] },
                                    [{ wickets: "$secondInningsBowling.wickets", runs: "$secondInningsBowling.runsConceded" }],
                                    [],
                                ],
                            },
                        ],
                    },
                },
            },
        },
    ]);

    if (result.length === 0) {
        return getEmptyCareerSummary();
    }

    const stats = result[0];

    // Calculate highest score
    const allScores = stats.allBattingScores.flat().filter((s: { runs: number }) => s.runs !== undefined);
    const highestScore = allScores.reduce(
        (max: { runs: number; isNotOut: boolean }, curr: { runs: number; isNotOut: boolean }) =>
            curr.runs > max.runs ? curr : max,
        { runs: 0, isNotOut: false }
    );

    // Calculate best bowling
    const allBowling = stats.allBowlingFigures.flat().filter((b: { wickets: number }) => b.wickets !== undefined);
    const bestBowling = allBowling.reduce(
        (best: { wickets: number; runs: number }, curr: { wickets: number; runs: number }) => {
            if (curr.wickets > best.wickets) return curr;
            if (curr.wickets === best.wickets && curr.runs < best.runs) return curr;
            return best;
        },
        { wickets: 0, runs: 0 }
    );

    // Calculate averages
    const dismissals = stats.battingInnings - stats.notOuts;
    const battingAverage = dismissals > 0 ? parseFloat((stats.totalRuns / dismissals).toFixed(2)) : null;
    const strikeRate = stats.totalBallsFaced > 0
        ? parseFloat(((stats.totalRuns / stats.totalBallsFaced) * 100).toFixed(2))
        : 0;
    const bowlingAverage = stats.totalWickets > 0
        ? parseFloat((stats.totalRunsConceded / stats.totalWickets).toFixed(2))
        : null;
    const economy = stats.totalOvers > 0
        ? parseFloat((stats.totalRunsConceded / stats.totalOvers).toFixed(2))
        : 0;
    const bowlingStrikeRate = stats.totalWickets > 0
        ? parseFloat(((stats.totalOvers * 6) / stats.totalWickets).toFixed(2))
        : null;

    const winPercentage = stats.matches > 0
        ? parseFloat(((stats.matchesWon / stats.matches) * 100).toFixed(1))
        : 0;

    return {
        matches: stats.matches,
        innings: stats.battingInnings,
        runs: stats.totalRuns,
        highestScore: highestScore,
        battingAverage,
        strikeRate,
        fifties: stats.fifties,
        centuries: stats.centuries,
        ducks: stats.ducks,
        notOuts: stats.notOuts,
        fours: stats.totalFours,
        sixes: stats.totalSixes,
        wickets: stats.totalWickets,
        bowlingAverage,
        economy,
        bowlingStrikeRate,
        bestBowling,
        threeWicketHauls: stats.threeWicketHauls,
        fiveWicketHauls: stats.fiveWicketHauls,
        catches: stats.totalCatches,
        runOuts: stats.totalRunOuts,
        stumpings: stats.totalStumpings,
        matchesWon: stats.matchesWon,
        matchesLost: stats.matchesLost,
        matchesDrawn: stats.matchesDrawn,
        winPercentage,
    };
}

/**
 * Get format-wise breakdown
 */
export async function getFormatBreakdown(
    filters?: AnalyticsFilters
): Promise<FormatStats[]> {
    await connectDB();

    const matchFilter = buildMatchFilterQuery(filters);
    delete matchFilter.format; // Remove format filter for breakdown

    const result = await Performance.aggregate([
        {
            $lookup: {
                from: "matches",
                localField: "match",
                foreignField: "_id",
                as: "matchData",
            },
        },
        { $unwind: "$matchData" },
        { $match: { matchData: matchFilter } },
        {
            $group: {
                _id: "$matchData.format",
                matches: { $sum: 1 },
                innings: {
                    $sum: {
                        $cond: [
                            {
                                $or: [
                                    { $and: [{ $ifNull: ["$batting", false] }, { $ne: ["$batting.didNotBat", true] }] },
                                    { $and: [{ $ifNull: ["$firstInningsBatting", false] }, { $ne: ["$firstInningsBatting.didNotBat", true] }] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                runs: { $sum: "$matchRuns" },
                ballsFaced: { $sum: "$matchBallsFaced" },
                notOuts: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$batting.isNotOut", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBatting.isNotOut", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBatting.isNotOut", true] }, 1, 0] },
                        ],
                    },
                },
                fifties: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$batting.isFifty", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBatting.isFifty", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBatting.isFifty", true] }, 1, 0] },
                        ],
                    },
                },
                centuries: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$batting.isCentury", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBatting.isCentury", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBatting.isCentury", true] }, 1, 0] },
                        ],
                    },
                },
                wickets: { $sum: "$matchWickets" },
                overs: { $sum: "$matchOvers" },
                runsConceded: {
                    $sum: {
                        $add: [
                            { $ifNull: ["$bowling.runsConceded", 0] },
                            { $ifNull: ["$firstInningsBowling.runsConceded", 0] },
                            { $ifNull: ["$secondInningsBowling.runsConceded", 0] },
                        ],
                    },
                },
            },
        },
        { $sort: { matches: -1 } },
    ]);

    return result.map((r) => ({
        format: r._id as MatchFormat,
        matches: r.matches,
        innings: r.innings,
        runs: r.runs,
        battingAverage:
            r.innings - r.notOuts > 0
                ? parseFloat((r.runs / (r.innings - r.notOuts)).toFixed(2))
                : null,
        strikeRate:
            r.ballsFaced > 0
                ? parseFloat(((r.runs / r.ballsFaced) * 100).toFixed(2))
                : 0,
        fifties: r.fifties,
        centuries: r.centuries,
        wickets: r.wickets,
        bowlingAverage:
            r.wickets > 0 ? parseFloat((r.runsConceded / r.wickets).toFixed(2)) : null,
        economy: r.overs > 0 ? parseFloat((r.runsConceded / r.overs).toFixed(2)) : 0,
    }));
}

/**
 * Get trend data for charts
 */
export async function getTrendData(
    filters?: AnalyticsFilters
): Promise<TrendDataPoint[]> {
    await connectDB();

    const matchFilter = buildMatchFilterQuery(filters);

    const result = await Performance.aggregate([
        {
            $lookup: {
                from: "matches",
                localField: "match",
                foreignField: "_id",
                as: "matchData",
            },
        },
        { $unwind: "$matchData" },
        { $match: { matchData: matchFilter } },
        { $sort: { "matchData.date": 1 } },
        {
            $project: {
                matchId: "$match",
                date: "$matchData.date",
                opponent: "$matchData.opponent",
                format: "$matchData.format",
                runs: "$matchRuns",
                wickets: "$matchWickets",
                ballsFaced: "$matchBallsFaced",
                overs: "$matchOvers",
                runsConceded: {
                    $add: [
                        { $ifNull: ["$bowling.runsConceded", 0] },
                        { $ifNull: ["$firstInningsBowling.runsConceded", 0] },
                        { $ifNull: ["$secondInningsBowling.runsConceded", 0] },
                    ],
                },
                isNotOut: {
                    $or: [
                        { $eq: ["$batting.isNotOut", true] },
                        { $eq: ["$firstInningsBatting.isNotOut", true] },
                        { $eq: ["$secondInningsBatting.isNotOut", true] },
                    ],
                },
            },
        },
    ]);

    // Calculate cumulative and running stats
    let cumulativeRuns = 0;
    let cumulativeWickets = 0;
    let cumulativeBallsFaced = 0;
    let cumulativeOvers = 0;
    let cumulativeRunsConceded = 0;
    let cumulativeInnings = 0;
    let cumulativeNotOuts = 0;

    return result.map((r) => {
        cumulativeRuns += r.runs;
        cumulativeWickets += r.wickets;
        cumulativeBallsFaced += r.ballsFaced;
        cumulativeOvers += r.overs;
        cumulativeRunsConceded += r.runsConceded;
        cumulativeInnings += 1;
        if (r.isNotOut) cumulativeNotOuts += 1;

        const dismissals = cumulativeInnings - cumulativeNotOuts;

        return {
            matchId: r.matchId.toString(),
            date: r.date.toISOString(),
            opponent: r.opponent,
            format: r.format as MatchFormat,
            runs: r.runs,
            wickets: r.wickets,
            cumulativeRuns,
            cumulativeWickets,
            runningAverage:
                dismissals > 0
                    ? parseFloat((cumulativeRuns / dismissals).toFixed(2))
                    : 0,
            runningStrikeRate:
                cumulativeBallsFaced > 0
                    ? parseFloat(((cumulativeRuns / cumulativeBallsFaced) * 100).toFixed(2))
                    : 0,
            runningEconomy:
                cumulativeOvers > 0
                    ? parseFloat((cumulativeRunsConceded / cumulativeOvers).toFixed(2))
                    : 0,
        };
    });
}

/**
 * Get opponent-wise statistics
 */
export async function getOpponentStats(
    filters?: AnalyticsFilters
): Promise<OpponentStats[]> {
    await connectDB();

    const matchFilter = buildMatchFilterQuery(filters);
    delete matchFilter.opponent; // Remove opponent filter for breakdown

    const result = await Performance.aggregate([
        {
            $lookup: {
                from: "matches",
                localField: "match",
                foreignField: "_id",
                as: "matchData",
            },
        },
        { $unwind: "$matchData" },
        { $match: { matchData: matchFilter } },
        {
            $group: {
                _id: "$matchData.opponent",
                matches: { $sum: 1 },
                runs: { $sum: "$matchRuns" },
                ballsFaced: { $sum: "$matchBallsFaced" },
                notOuts: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$batting.isNotOut", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBatting.isNotOut", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBatting.isNotOut", true] }, 1, 0] },
                        ],
                    },
                },
                wickets: { $sum: "$matchWickets" },
                overs: { $sum: "$matchOvers" },
                runsConceded: {
                    $sum: {
                        $add: [
                            { $ifNull: ["$bowling.runsConceded", 0] },
                            { $ifNull: ["$firstInningsBowling.runsConceded", 0] },
                            { $ifNull: ["$secondInningsBowling.runsConceded", 0] },
                        ],
                    },
                },
            },
        },
        { $sort: { matches: -1 } },
    ]);

    return result.map((r) => ({
        opponent: r._id,
        matches: r.matches,
        runs: r.runs,
        battingAverage:
            r.matches - r.notOuts > 0
                ? parseFloat((r.runs / (r.matches - r.notOuts)).toFixed(2))
                : null,
        strikeRate:
            r.ballsFaced > 0
                ? parseFloat(((r.runs / r.ballsFaced) * 100).toFixed(2))
                : 0,
        wickets: r.wickets,
        bowlingAverage:
            r.wickets > 0 ? parseFloat((r.runsConceded / r.wickets).toFixed(2)) : null,
        economy: r.overs > 0 ? parseFloat((r.runsConceded / r.overs).toFixed(2)) : 0,
    }));
}

/**
 * Get venue-wise statistics
 */
export async function getVenueStats(
    filters?: AnalyticsFilters
): Promise<VenueStats[]> {
    await connectDB();

    const matchFilter = buildMatchFilterQuery(filters);
    delete matchFilter.venue; // Remove venue filter for breakdown

    const result = await Performance.aggregate([
        {
            $lookup: {
                from: "matches",
                localField: "match",
                foreignField: "_id",
                as: "matchData",
            },
        },
        { $unwind: "$matchData" },
        { $match: { matchData: matchFilter } },
        {
            $group: {
                _id: {
                    venue: "$matchData.venue",
                    city: "$matchData.city",
                    country: "$matchData.country",
                },
                matches: { $sum: 1 },
                runs: { $sum: "$matchRuns" },
                notOuts: {
                    $sum: {
                        $add: [
                            { $cond: [{ $eq: ["$batting.isNotOut", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$firstInningsBatting.isNotOut", true] }, 1, 0] },
                            { $cond: [{ $eq: ["$secondInningsBatting.isNotOut", true] }, 1, 0] },
                        ],
                    },
                },
                wickets: { $sum: "$matchWickets" },
                overs: { $sum: "$matchOvers" },
                runsConceded: {
                    $sum: {
                        $add: [
                            { $ifNull: ["$bowling.runsConceded", 0] },
                            { $ifNull: ["$firstInningsBowling.runsConceded", 0] },
                            { $ifNull: ["$secondInningsBowling.runsConceded", 0] },
                        ],
                    },
                },
            },
        },
        { $sort: { runs: -1 } },
    ]);

    return result.map((r) => ({
        venue: r._id.venue,
        city: r._id.city,
        country: r._id.country,
        matches: r.matches,
        runs: r.runs,
        battingAverage:
            r.matches - r.notOuts > 0
                ? parseFloat((r.runs / (r.matches - r.notOuts)).toFixed(2))
                : null,
        wickets: r.wickets,
        bowlingAverage:
            r.wickets > 0 ? parseFloat((r.runsConceded / r.wickets).toFixed(2)) : null,
    }));
}

/**
 * Helper: Empty career summary
 */
function getEmptyCareerSummary(): CareerSummary {
    return {
        matches: 0,
        innings: 0,
        runs: 0,
        highestScore: { runs: 0, isNotOut: false },
        battingAverage: null,
        strikeRate: 0,
        fifties: 0,
        centuries: 0,
        ducks: 0,
        notOuts: 0,
        fours: 0,
        sixes: 0,
        wickets: 0,
        bowlingAverage: null,
        economy: 0,
        bowlingStrikeRate: null,
        bestBowling: { wickets: 0, runs: 0 },
        threeWicketHauls: 0,
        fiveWicketHauls: 0,
        catches: 0,
        runOuts: 0,
        stumpings: 0,
        matchesWon: 0,
        matchesLost: 0,
        matchesDrawn: 0,
        winPercentage: 0,
    };
}
