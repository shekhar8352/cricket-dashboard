import { connectDB } from "@/database/mongoose";
import Performance, { IInningsBatting, IPerformance } from "@/lib/models/Performance";
import Match, { IMatch } from "@/lib/models/Match";
import { InningsBattingFormData, PerformanceFormData } from "@/types";
import {
    DISMISSAL_TYPES,
    DismissalType,
    isMultiInningsFormat,
    MatchFormat,
} from "@/lib/constants";
import mongoose from "mongoose";

const VALID_DISMISSAL_TYPES = new Set<string>(DISMISSAL_TYPES);

/** Maps form batting to a Mongoose-safe innings object (no empty enum strings). */
function inningsBattingFromForm(data: InningsBattingFormData): IInningsBatting {
    const didNotBat = !!data.didNotBat;
    const out: IInningsBatting = {
        didNotBat,
        runs: didNotBat ? 0 : data.runs || 0,
        ballsFaced: didNotBat ? 0 : data.ballsFaced || 0,
        fours: didNotBat ? 0 : data.fours || 0,
        sixes: didNotBat ? 0 : data.sixes || 0,
        strikeRate: 0,
        boundaryRuns: 0,
        boundaryPercentage: 0,
        isFifty: false,
        isCentury: false,
        isDuck: false,
        isNotOut: false,
    };

    if (didNotBat) {
        return out;
    }

    const raw = data.dismissalType;
    if (raw && VALID_DISMISSAL_TYPES.has(raw)) {
        out.dismissalType = raw as DismissalType;
    }

    const bowler = data.dismissalBowler?.trim();
    if (bowler) out.dismissalBowler = bowler;

    const fielder = data.dismissalFielder?.trim();
    if (fielder) out.dismissalFielder = fielder;

    const pos = data.battingPosition;
    if (typeof pos === "number" && Number.isFinite(pos) && pos >= 1 && pos <= 11) {
        out.battingPosition = pos;
    }

    return out;
}

/**
 * Get performance for a specific match
 */
export async function getPerformanceByMatchId(
    matchId: string
): Promise<IPerformance | null> {
    await connectDB();

    const performance = await Performance.findOne({ match: matchId })
        .populate("match")
        .lean<IPerformance>();

    return performance;
}

/**
 * Create or update performance for a match
 */
export async function upsertPerformance(
    data: PerformanceFormData
): Promise<IPerformance> {
    await connectDB();

    // Get match to determine format
    const match = (await Match.findById(data.matchId).lean()) as IMatch | null;
    if (!match) {
        throw new Error("Match not found");
    }

    const isMultiInnings = isMultiInningsFormat(match.format as MatchFormat);

    // Build performance data based on format
    const performanceData: Partial<IPerformance> = {
        match: new mongoose.Types.ObjectId(data.matchId),
        fielding: {
            catches: data.fielding.catches || 0,
            runOuts: data.fielding.runOuts || 0,
            stumpings: data.fielding.stumpings || 0,
            totalDismissals: 0, // Will be calculated in pre-save
        },
        isCaptain: data.isCaptain,
        isWicketkeeper: data.isWicketkeeper,
    };

    if (isMultiInnings) {
        // Test/First-class: use multi-innings fields
        if (data.firstInningsBatting) {
            performanceData.firstInningsBatting = inningsBattingFromForm(
                data.firstInningsBatting
            );
        }

        if (data.secondInningsBatting) {
            performanceData.secondInningsBatting = inningsBattingFromForm(
                data.secondInningsBatting
            );
        }

        if (data.firstInningsBowling) {
            performanceData.firstInningsBowling = {
                didNotBowl: data.firstInningsBowling.didNotBowl,
                overs: data.firstInningsBowling.overs || 0,
                maidens: data.firstInningsBowling.maidens || 0,
                runsConceded: data.firstInningsBowling.runsConceded || 0,
                wickets: data.firstInningsBowling.wickets || 0,
                wides: data.firstInningsBowling.wides || 0,
                noBalls: data.firstInningsBowling.noBalls || 0,
                ballsBowled: 0,
                economy: 0,
                isThreeWicketHaul: false,
                isFourWicketHaul: false,
                isFiveWicketHaul: false,
            };
        }

        if (data.secondInningsBowling) {
            performanceData.secondInningsBowling = {
                didNotBowl: data.secondInningsBowling.didNotBowl,
                overs: data.secondInningsBowling.overs || 0,
                maidens: data.secondInningsBowling.maidens || 0,
                runsConceded: data.secondInningsBowling.runsConceded || 0,
                wickets: data.secondInningsBowling.wickets || 0,
                wides: data.secondInningsBowling.wides || 0,
                noBalls: data.secondInningsBowling.noBalls || 0,
                ballsBowled: 0,
                economy: 0,
                isThreeWicketHaul: false,
                isFourWicketHaul: false,
                isFiveWicketHaul: false,
            };
        }
    } else {
        // T20/ODI: use single innings fields
        if (data.batting) {
            performanceData.batting = inningsBattingFromForm(data.batting);
        }

        if (data.bowling) {
            performanceData.bowling = {
                didNotBowl: data.bowling.didNotBowl,
                overs: data.bowling.overs || 0,
                maidens: data.bowling.maidens || 0,
                runsConceded: data.bowling.runsConceded || 0,
                wickets: data.bowling.wickets || 0,
                wides: data.bowling.wides || 0,
                noBalls: data.bowling.noBalls || 0,
                ballsBowled: 0,
                economy: 0,
                isThreeWicketHaul: false,
                isFourWicketHaul: false,
                isFiveWicketHaul: false,
            };
        }
    }

    // Upsert: update if exists, create if not
    const performance = await Performance.findOneAndUpdate(
        { match: data.matchId },
        performanceData,
        { new: true, upsert: true, runValidators: true }
    );

    // Trigger pre-save hook by calling save
    await performance.save();

    return performance.toObject();
}

/**
 * Delete performance for a match
 */
export async function deletePerformance(matchId: string): Promise<boolean> {
    await connectDB();

    const result = await Performance.findOneAndDelete({ match: matchId });
    return !!result;
}

/**
 * Get all performances with match data (for analytics)
 */
export async function getAllPerformancesWithMatches(): Promise<
    (IPerformance & { matchData: unknown })[]
> {
    await connectDB();

    const performances = await Performance.aggregate([
        {
            $lookup: {
                from: "matches",
                localField: "match",
                foreignField: "_id",
                as: "matchData",
            },
        },
        {
            $unwind: "$matchData",
        },
        {
            $sort: { "matchData.date": 1 },
        },
    ]);

    return performances;
}
