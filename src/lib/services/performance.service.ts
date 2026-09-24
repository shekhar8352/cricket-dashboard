import { connectDB } from "@/database/mongoose";
import Performance, { IInningsBatting, IPerformance } from "@/lib/models/Performance";
import Match, { IMatch } from "@/lib/models/Match";
import {
    BowlingDetailFormData,
    BattingDetailFormData,
    InningsBattingFormData,
    InningsBowlingFormData,
    PerformanceFormData,
} from "@/types";
import {
    BOWLER_TYPES,
    DELIVERY_LENGTHS,
    DELIVERY_LINES,
    DISMISSAL_TYPES,
    PHASE_IDS,
    SHOTS,
    SHOT_ZONES,
    BowlerType,
    DeliveryLength,
    DeliveryLine,
    DismissalType,
    PhaseId,
    ShotPlayed,
    ShotZoneId,
    isMultiInningsFormat,
    MatchFormat,
} from "@/lib/constants";
import { IBowlingDetail, IInningsBowling } from "@/lib/models/Performance";
import mongoose from "mongoose";

const VALID_DISMISSAL_TYPES = new Set<string>(DISMISSAL_TYPES);
const VALID_PHASES = new Set<string>(PHASE_IDS);
const VALID_BOWLERS = new Set<string>(BOWLER_TYPES);
const VALID_LENGTHS = new Set<string>(DELIVERY_LENGTHS);
const VALID_LINES = new Set<string>(DELIVERY_LINES);
const VALID_SHOTS = new Set<string>(SHOTS);

function num(value: unknown): number | undefined {
    if (value == null || value === "") return undefined;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : undefined;
}

function numOrZero(value: unknown): number {
    return num(value) ?? 0;
}

function oneOf<T extends string>(value: unknown, allowed: Set<string>): T | undefined {
    return typeof value === "string" && allowed.has(value) ? (value as T) : undefined;
}

function cleanBattingDetail(detail?: BattingDetailFormData) {
    if (!detail) return undefined;
    const phases = (detail.phases || [])
        .map((phase) => {
            const id = oneOf<PhaseId>(phase.phase, VALID_PHASES);
            if (!id) return null;
            return {
                phase: id,
                runs: numOrZero(phase.runs),
                balls: numOrZero(phase.balls),
                fours: numOrZero(phase.fours),
                sixes: numOrZero(phase.sixes),
                dots: numOrZero(phase.dots),
            };
        })
        .filter((phase): phase is NonNullable<typeof phase> => phase != null);
    const phaseSignal = phases.some((phase) => phase.runs || phase.balls || phase.fours || phase.sixes || phase.dots);

    const zones: Partial<Record<ShotZoneId, number>> = {};
    let zoneSignal = false;
    for (const zone of SHOT_ZONES) {
        const value = num(detail.zones?.[zone.id]);
        if (value && value > 0) {
            zones[zone.id] = value;
            zoneSignal = true;
        }
    }

    const paceBalls = num(detail.vsPace?.balls) || 0;
    const spinBalls = num(detail.vsSpin?.balls) || 0;
    const partnerships = (detail.partnerships || [])
        .map((row) => ({
            wicket: num(row.wicket) || 0,
            partner: row.partner?.trim() || undefined,
            runs: numOrZero(row.runs),
            balls: numOrZero(row.balls),
            myRuns: numOrZero(row.myRuns),
        }))
        .filter((row) => row.partner || row.runs || row.balls || row.myRuns);

    const meaningful =
        (num(detail.dots) || 0) + (num(detail.singles) || 0) + (num(detail.twos) || 0) + (num(detail.threes) || 0) > 0 ||
        (num(detail.minutesBatted) || 0) > 0 ||
        (num(detail.ballsTo50) || 0) > 0 ||
        (num(detail.ballsTo100) || 0) > 0 ||
        (num(detail.entryTeamScore) || 0) > 0 ||
        (num(detail.entryWickets) || 0) > 0 ||
        (num(detail.entryOver) || 0) > 0 ||
        paceBalls + spinBalls > 0 ||
        phaseSignal ||
        zoneSignal ||
        !!oneOf(detail.bowlerType, VALID_BOWLERS) ||
        !!oneOf(detail.deliveryLength, VALID_LENGTHS) ||
        !!oneOf(detail.deliveryLine, VALID_LINES) ||
        !!oneOf(detail.shotPlayed, VALID_SHOTS) ||
        !!oneOf(detail.dismissalPhase, VALID_PHASES) ||
        partnerships.length > 0;

    if (!meaningful) return undefined;

    const paceSplit = (split: BattingDetailFormData["vsPace"]) =>
        split && (num(split.balls) || 0) > 0
            ? {
                  runs: numOrZero(split.runs),
                  balls: numOrZero(split.balls),
                  fours: numOrZero(split.fours),
                  sixes: numOrZero(split.sixes),
                  dismissed: !!split.dismissed,
              }
            : undefined;

    return {
        dots: num(detail.dots),
        singles: num(detail.singles),
        twos: num(detail.twos),
        threes: num(detail.threes),
        minutesBatted: num(detail.minutesBatted),
        ballsTo50: num(detail.ballsTo50),
        ballsTo100: num(detail.ballsTo100),
        entryTeamScore: num(detail.entryTeamScore),
        entryWickets: num(detail.entryWickets),
        entryOver: num(detail.entryOver),
        vsPace: paceSplit(detail.vsPace),
        vsSpin: paceSplit(detail.vsSpin),
        phases: phaseSignal ? phases : undefined,
        zones: zoneSignal ? zones : undefined,
        bowlerType: oneOf<BowlerType>(detail.bowlerType, VALID_BOWLERS),
        deliveryLength: oneOf<DeliveryLength>(detail.deliveryLength, VALID_LENGTHS),
        deliveryLine: oneOf<DeliveryLine>(detail.deliveryLine, VALID_LINES),
        shotPlayed: oneOf<ShotPlayed>(detail.shotPlayed, VALID_SHOTS),
        dismissalPhase: oneOf<PhaseId>(detail.dismissalPhase, VALID_PHASES),
        partnerships: partnerships.length ? partnerships : undefined,
    };
}

function cleanBowlingDetail(detail?: BowlingDetailFormData): IBowlingDetail | undefined {
    if (!detail) return undefined;
    const phases = (detail.phases || [])
        .map((phase) => ({
            phase: oneOf<PhaseId>(phase.phase, VALID_PHASES)!,
            balls: numOrZero(phase.balls),
            runs: numOrZero(phase.runs),
            wickets: numOrZero(phase.wickets),
            dots: numOrZero(phase.dots),
        }))
        .filter((phase) => phase.phase);
    const phaseSignal = phases.some((phase) => phase.balls || phase.runs || phase.wickets || phase.dots);
    const spells = (detail.spells || [])
        .map((spell) => ({
            overs: numOrZero(spell.overs),
            runs: numOrZero(spell.runs),
            wickets: numOrZero(spell.wickets),
        }))
        .filter((spell) => spell.overs || spell.runs || spell.wickets);
    const wicketsDetail = (detail.wicketsDetail || [])
        .map((wicket) => ({
            batterPosition: num(wicket.batterPosition),
            dismissalType: oneOf<DismissalType>(wicket.dismissalType, VALID_DISMISSAL_TYPES),
            deliveryLength: oneOf<DeliveryLength>(wicket.deliveryLength, VALID_LENGTHS),
            bowlingPhase: oneOf<PhaseId>(wicket.bowlingPhase, VALID_PHASES),
        }))
        .filter((wicket) => wicket.batterPosition || wicket.dismissalType || wicket.deliveryLength || wicket.bowlingPhase);

    const meaningful =
        (num(detail.dots) || 0) > 0 ||
        (num(detail.foursConceded) || 0) > 0 ||
        (num(detail.sixesConceded) || 0) > 0 ||
        (num(detail.catchesDroppedOffBowling) || 0) > 0 ||
        phaseSignal ||
        spells.length > 0 ||
        wicketsDetail.length > 0;
    if (!meaningful) return undefined;

    return {
        dots: num(detail.dots),
        foursConceded: num(detail.foursConceded),
        sixesConceded: num(detail.sixesConceded),
        phases: phaseSignal ? phases : undefined,
        spells: spells.length ? spells : undefined,
        wicketsDetail: wicketsDetail.length ? wicketsDetail : undefined,
        catchesDroppedOffBowling: num(detail.catchesDroppedOffBowling),
    };
}

function inningsBowlingFromForm(data: InningsBowlingFormData): IInningsBowling {
    const didNotBowl = !!data.didNotBowl;
    return {
        didNotBowl,
        overs: didNotBowl ? 0 : numOrZero(data.overs),
        maidens: didNotBowl ? 0 : numOrZero(data.maidens),
        runsConceded: didNotBowl ? 0 : numOrZero(data.runsConceded),
        wickets: didNotBowl ? 0 : numOrZero(data.wickets),
        wides: didNotBowl ? 0 : numOrZero(data.wides),
        noBalls: didNotBowl ? 0 : numOrZero(data.noBalls),
        ballsBowled: 0,
        economy: 0,
        isThreeWicketHaul: false,
        isFourWicketHaul: false,
        isFiveWicketHaul: false,
        hasDetail: false,
        detail: didNotBowl ? undefined : cleanBowlingDetail(data.detail),
    };
}

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
        hasDetail: false,
    };

    if (didNotBat) {
        return out;
    }

    out.detail = cleanBattingDetail(data.detail);

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
            totalDismissals: 0,
            dropped: data.fielding.dropped || 0,
            directHits: data.fielding.directHits || 0,
            runsSavedEstimate: data.fielding.runsSavedEstimate || 0,
            misfields: data.fielding.misfields || 0,
        },
        isCaptain: data.isCaptain,
        isWicketkeeper: data.isWicketkeeper,
        playerOfMatch: !!data.playerOfMatch,
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
            performanceData.firstInningsBowling = inningsBowlingFromForm(data.firstInningsBowling);
        }

        if (data.secondInningsBowling) {
            performanceData.secondInningsBowling = inningsBowlingFromForm(data.secondInningsBowling);
        }
    } else {
        // T20/ODI: use single innings fields
        if (data.batting) {
            performanceData.batting = inningsBattingFromForm(data.batting);
        }

        if (data.bowling) {
            performanceData.bowling = inningsBowlingFromForm(data.bowling);
        }
    }

    const unset = isMultiInnings
        ? { batting: 1, bowling: 1 }
        : {
              firstInningsBatting: 1,
              secondInningsBatting: 1,
              firstInningsBowling: 1,
              secondInningsBowling: 1,
          };

    const performance = await Performance.findOneAndUpdate(
        { match: data.matchId },
        { $set: performanceData, $unset: unset },
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
