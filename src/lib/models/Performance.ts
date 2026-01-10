import mongoose, { Schema, Document } from "mongoose";

// Dismissal types enum
export const DISMISSAL_TYPES = [
    "caught",
    "bowled",
    "lbw",
    "run_out",
    "stumped",
    "hit_wicket",
    "not_out",
    "retired_hurt",
] as const;

export type DismissalType = (typeof DISMISSAL_TYPES)[number];

// Innings batting interface
export interface IInningsBatting {
    didNotBat: boolean;
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    dismissalType?: DismissalType;
    dismissalBowler?: string;
    dismissalFielder?: string;
    battingPosition?: number;
    // Derived fields (calculated on save)
    strikeRate: number;
    boundaryRuns: number;
    boundaryPercentage: number;
    isFifty: boolean;
    isCentury: boolean;
    isDuck: boolean;
    isNotOut: boolean;
}

// Innings bowling interface
export interface IInningsBowling {
    didNotBowl: boolean;
    overs: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    wides: number;
    noBalls: number;
    // Derived fields (calculated on save)
    ballsBowled: number;
    economy: number;
    bowlingStrikeRate?: number;
    bowlingAverage?: number;
    isThreeWicketHaul: boolean;
    isFourWicketHaul: boolean;
    isFiveWicketHaul: boolean;
}

// Fielding interface
export interface IFielding {
    catches: number;
    runOuts: number;
    stumpings: number;
    totalDismissals: number;
}

// Main performance interface
export interface IPerformance extends Document {
    match: mongoose.Types.ObjectId;
    // For T20/ODI/List-A (single innings)
    batting?: IInningsBatting;
    bowling?: IInningsBowling;
    // For Test/First-class (two innings)
    firstInningsBatting?: IInningsBatting;
    secondInningsBatting?: IInningsBatting;
    firstInningsBowling?: IInningsBowling;
    secondInningsBowling?: IInningsBowling;
    // Fielding (per match)
    fielding: IFielding;
    // Context
    isCaptain: boolean;
    isWicketkeeper: boolean;
    // Match-level aggregates (for Test: sum of innings)
    matchRuns: number;
    matchWickets: number;
    matchBallsFaced: number;
    matchOvers: number;
    createdAt: Date;
    updatedAt: Date;
}

// Sub-schema for innings batting
const InningsBattingSchema = new Schema<IInningsBatting>(
    {
        didNotBat: { type: Boolean, default: false },
        runs: { type: Number, default: 0 },
        ballsFaced: { type: Number, default: 0 },
        fours: { type: Number, default: 0 },
        sixes: { type: Number, default: 0 },
        dismissalType: {
            type: String,
            enum: DISMISSAL_TYPES,
        },
        dismissalBowler: { type: String },
        dismissalFielder: { type: String },
        battingPosition: { type: Number, min: 1, max: 11 },
        // Derived
        strikeRate: { type: Number, default: 0 },
        boundaryRuns: { type: Number, default: 0 },
        boundaryPercentage: { type: Number, default: 0 },
        isFifty: { type: Boolean, default: false },
        isCentury: { type: Boolean, default: false },
        isDuck: { type: Boolean, default: false },
        isNotOut: { type: Boolean, default: false },
    },
    { _id: false }
);

// Sub-schema for innings bowling
const InningsBowlingSchema = new Schema<IInningsBowling>(
    {
        didNotBowl: { type: Boolean, default: false },
        overs: { type: Number, default: 0 },
        maidens: { type: Number, default: 0 },
        runsConceded: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        wides: { type: Number, default: 0 },
        noBalls: { type: Number, default: 0 },
        // Derived
        ballsBowled: { type: Number, default: 0 },
        economy: { type: Number, default: 0 },
        bowlingStrikeRate: { type: Number },
        bowlingAverage: { type: Number },
        isThreeWicketHaul: { type: Boolean, default: false },
        isFourWicketHaul: { type: Boolean, default: false },
        isFiveWicketHaul: { type: Boolean, default: false },
    },
    { _id: false }
);

// Sub-schema for fielding
const FieldingSchema = new Schema<IFielding>(
    {
        catches: { type: Number, default: 0 },
        runOuts: { type: Number, default: 0 },
        stumpings: { type: Number, default: 0 },
        totalDismissals: { type: Number, default: 0 },
    },
    { _id: false }
);

// Main performance schema
const PerformanceSchema = new Schema<IPerformance>(
    {
        match: { type: Schema.Types.ObjectId, ref: "Match", required: true },
        // Single innings (T20/ODI)
        batting: InningsBattingSchema,
        bowling: InningsBowlingSchema,
        // Multi innings (Test/First-class)
        firstInningsBatting: InningsBattingSchema,
        secondInningsBatting: InningsBattingSchema,
        firstInningsBowling: InningsBowlingSchema,
        secondInningsBowling: InningsBowlingSchema,
        // Fielding
        fielding: {
            type: FieldingSchema,
            default: { catches: 0, runOuts: 0, stumpings: 0, totalDismissals: 0 },
        },
        // Context
        isCaptain: { type: Boolean, default: false },
        isWicketkeeper: { type: Boolean, default: false },
        // Match aggregates
        matchRuns: { type: Number, default: 0 },
        matchWickets: { type: Number, default: 0 },
        matchBallsFaced: { type: Number, default: 0 },
        matchOvers: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Index for match lookup
PerformanceSchema.index({ match: 1 }, { unique: true });

// Pre-save middleware to calculate derived fields
PerformanceSchema.pre("save", function (next) {
    // Helper to calculate batting derived fields
    const calculateBattingDerived = (batting: IInningsBatting) => {
        if (batting.didNotBat) return;

        // Strike Rate
        batting.strikeRate =
            batting.ballsFaced > 0
                ? parseFloat(((batting.runs / batting.ballsFaced) * 100).toFixed(2))
                : 0;

        // Boundary calculations
        batting.boundaryRuns = batting.fours * 4 + batting.sixes * 6;
        batting.boundaryPercentage =
            batting.runs > 0
                ? parseFloat(((batting.boundaryRuns / batting.runs) * 100).toFixed(2))
                : 0;

        // Milestone flags
        batting.isFifty = batting.runs >= 50 && batting.runs < 100;
        batting.isCentury = batting.runs >= 100;
        batting.isNotOut = batting.dismissalType === "not_out";
        batting.isDuck =
            batting.runs === 0 && !batting.isNotOut && !batting.didNotBat;
    };

    // Helper to calculate bowling derived fields
    const calculateBowlingDerived = (bowling: IInningsBowling) => {
        if (bowling.didNotBowl) return;

        // Balls bowled (handle partial overs like 3.2)
        const fullOvers = Math.floor(bowling.overs);
        const partialBalls = Math.round((bowling.overs - fullOvers) * 10);
        bowling.ballsBowled = fullOvers * 6 + partialBalls;

        // Economy
        bowling.economy =
            bowling.overs > 0
                ? parseFloat((bowling.runsConceded / bowling.overs).toFixed(2))
                : 0;

        // Strike rate and average (only if wickets > 0)
        if (bowling.wickets > 0) {
            bowling.bowlingStrikeRate = parseFloat(
                (bowling.ballsBowled / bowling.wickets).toFixed(2)
            );
            bowling.bowlingAverage = parseFloat(
                (bowling.runsConceded / bowling.wickets).toFixed(2)
            );
        } else {
            bowling.bowlingStrikeRate = undefined;
            bowling.bowlingAverage = undefined;
        }

        // Wicket haul flags
        bowling.isThreeWicketHaul = bowling.wickets >= 3;
        bowling.isFourWicketHaul = bowling.wickets >= 4;
        bowling.isFiveWicketHaul = bowling.wickets >= 5;
    };

    // Calculate for single innings
    if (this.batting) calculateBattingDerived(this.batting);
    if (this.bowling) calculateBowlingDerived(this.bowling);

    // Calculate for multi innings
    if (this.firstInningsBatting) calculateBattingDerived(this.firstInningsBatting);
    if (this.secondInningsBatting) calculateBattingDerived(this.secondInningsBatting);
    if (this.firstInningsBowling) calculateBowlingDerived(this.firstInningsBowling);
    if (this.secondInningsBowling) calculateBowlingDerived(this.secondInningsBowling);

    // Calculate fielding total dismissals
    if (this.fielding) {
        this.fielding.totalDismissals =
            this.fielding.catches + this.fielding.runOuts + this.fielding.stumpings;
    }

    // Calculate match-level aggregates
    let totalRuns = 0;
    let totalWickets = 0;
    let totalBallsFaced = 0;
    let totalOvers = 0;

    // Single innings
    if (this.batting && !this.batting.didNotBat) {
        totalRuns += this.batting.runs;
        totalBallsFaced += this.batting.ballsFaced;
    }
    if (this.bowling && !this.bowling.didNotBowl) {
        totalWickets += this.bowling.wickets;
        totalOvers += this.bowling.overs;
    }

    // Multi innings
    if (this.firstInningsBatting && !this.firstInningsBatting.didNotBat) {
        totalRuns += this.firstInningsBatting.runs;
        totalBallsFaced += this.firstInningsBatting.ballsFaced;
    }
    if (this.secondInningsBatting && !this.secondInningsBatting.didNotBat) {
        totalRuns += this.secondInningsBatting.runs;
        totalBallsFaced += this.secondInningsBatting.ballsFaced;
    }
    if (this.firstInningsBowling && !this.firstInningsBowling.didNotBowl) {
        totalWickets += this.firstInningsBowling.wickets;
        totalOvers += this.firstInningsBowling.overs;
    }
    if (this.secondInningsBowling && !this.secondInningsBowling.didNotBowl) {
        totalWickets += this.secondInningsBowling.wickets;
        totalOvers += this.secondInningsBowling.overs;
    }

    this.matchRuns = totalRuns;
    this.matchWickets = totalWickets;
    this.matchBallsFaced = totalBallsFaced;
    this.matchOvers = totalOvers;

    next();
});

export default mongoose.models.Performance ||
    mongoose.model<IPerformance>("Performance", PerformanceSchema);
