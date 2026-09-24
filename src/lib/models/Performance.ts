import mongoose, { Schema, Document } from "mongoose";
import {
    BOWLER_TYPES,
    DELIVERY_LENGTHS,
    DELIVERY_LINES,
    DISMISSAL_TYPES,
    PHASE_IDS,
    SHOTS,
    type BowlerType,
    type DeliveryLength,
    type DeliveryLine,
    type DismissalType,
    type PhaseId,
    type ShotPlayed,
    type ShotZoneId,
} from "@/lib/constants";

export { DISMISSAL_TYPES };
export type { DismissalType };

export interface IPaceSpinSplit {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    dismissed: boolean;
}

export interface IBattingPhase {
    phase: PhaseId;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    dots: number;
}

export interface IPartnership {
    wicket: number;
    partner?: string;
    runs: number;
    balls: number;
    myRuns: number;
}

export interface IShotZones {
    fineLeg: number;
    squareLeg: number;
    midWicket: number;
    longOn: number;
    longOff: number;
    cover: number;
    point: number;
    thirdMan: number;
}

export interface IBattingDetail {
    dots?: number;
    singles?: number;
    twos?: number;
    threes?: number;
    minutesBatted?: number;
    ballsTo50?: number;
    ballsTo100?: number;
    entryTeamScore?: number;
    entryWickets?: number;
    entryOver?: number;
    vsPace?: IPaceSpinSplit;
    vsSpin?: IPaceSpinSplit;
    phases?: IBattingPhase[];
    zones?: Partial<IShotZones>;
    bowlerType?: BowlerType;
    deliveryLength?: DeliveryLength;
    deliveryLine?: DeliveryLine;
    shotPlayed?: ShotPlayed;
    dismissalPhase?: PhaseId;
    partnerships?: IPartnership[];
    dotPct?: number;
    scoringShotPct?: number;
    runsFromRunning?: number;
}

export interface IBowlingPhase {
    phase: PhaseId;
    balls: number;
    runs: number;
    wickets: number;
    dots: number;
}

export interface ISpell {
    overs: number;
    runs: number;
    wickets: number;
}

export interface IWicketDetail {
    batterPosition?: number;
    dismissalType?: DismissalType;
    deliveryLength?: DeliveryLength;
    bowlingPhase?: PhaseId;
}

export interface IBowlingDetail {
    dots?: number;
    foursConceded?: number;
    sixesConceded?: number;
    phases?: IBowlingPhase[];
    spells?: ISpell[];
    wicketsDetail?: IWicketDetail[];
    catchesDroppedOffBowling?: number;
    bowlingDotPct?: number;
}

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
    strikeRate: number;
    boundaryRuns: number;
    boundaryPercentage: number;
    ballsPerBoundary?: number;
    isFifty: boolean;
    isCentury: boolean;
    isDuck: boolean;
    isNotOut: boolean;
    hasDetail: boolean;
    detail?: IBattingDetail;
}

export interface IInningsBowling {
    didNotBowl: boolean;
    overs: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    wides: number;
    noBalls: number;
    ballsBowled: number;
    economy: number;
    extrasPerOver?: number;
    bowlingStrikeRate?: number;
    bowlingAverage?: number;
    isThreeWicketHaul: boolean;
    isFourWicketHaul: boolean;
    isFiveWicketHaul: boolean;
    hasDetail: boolean;
    detail?: IBowlingDetail;
}

export interface IFielding {
    catches: number;
    runOuts: number;
    stumpings: number;
    totalDismissals: number;
    dropped: number;
    directHits: number;
    runsSavedEstimate: number;
    misfields: number;
}

export interface IPerformance extends Document {
    match: mongoose.Types.ObjectId;
    batting?: IInningsBatting;
    bowling?: IInningsBowling;
    firstInningsBatting?: IInningsBatting;
    secondInningsBatting?: IInningsBatting;
    firstInningsBowling?: IInningsBowling;
    secondInningsBowling?: IInningsBowling;
    fielding: IFielding;
    isCaptain: boolean;
    isWicketkeeper: boolean;
    playerOfMatch: boolean;
    matchRuns: number;
    matchWickets: number;
    matchBallsFaced: number;
    matchOvers: number;
    createdAt: Date;
    updatedAt: Date;
}

const PaceSpinSchema = new Schema<IPaceSpinSplit>(
    {
        runs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        fours: { type: Number, default: 0 },
        sixes: { type: Number, default: 0 },
        dismissed: { type: Boolean, default: false },
    },
    { _id: false }
);

const BattingPhaseSchema = new Schema<IBattingPhase>(
    {
        phase: { type: String, enum: PHASE_IDS, required: true },
        runs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        fours: { type: Number, default: 0 },
        sixes: { type: Number, default: 0 },
        dots: { type: Number, default: 0 },
    },
    { _id: false }
);

const PartnershipSchema = new Schema<IPartnership>(
    {
        wicket: { type: Number, min: 1, max: 10 },
        partner: { type: String },
        runs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        myRuns: { type: Number, default: 0 },
    },
    { _id: false }
);

const ZonesSchema = new Schema(
    {
        fineLeg: { type: Number, default: 0 },
        squareLeg: { type: Number, default: 0 },
        midWicket: { type: Number, default: 0 },
        longOn: { type: Number, default: 0 },
        longOff: { type: Number, default: 0 },
        cover: { type: Number, default: 0 },
        point: { type: Number, default: 0 },
        thirdMan: { type: Number, default: 0 },
    },
    { _id: false }
);

const BattingDetailSchema = new Schema<IBattingDetail>(
    {
        dots: { type: Number },
        singles: { type: Number },
        twos: { type: Number },
        threes: { type: Number },
        minutesBatted: { type: Number },
        ballsTo50: { type: Number },
        ballsTo100: { type: Number },
        entryTeamScore: { type: Number },
        entryWickets: { type: Number },
        entryOver: { type: Number },
        vsPace: { type: PaceSpinSchema },
        vsSpin: { type: PaceSpinSchema },
        phases: { type: [BattingPhaseSchema], default: undefined },
        zones: { type: ZonesSchema },
        bowlerType: { type: String, enum: BOWLER_TYPES },
        deliveryLength: { type: String, enum: DELIVERY_LENGTHS },
        deliveryLine: { type: String, enum: DELIVERY_LINES },
        shotPlayed: { type: String, enum: SHOTS },
        dismissalPhase: { type: String, enum: PHASE_IDS },
        partnerships: { type: [PartnershipSchema], default: undefined },
        dotPct: { type: Number },
        scoringShotPct: { type: Number },
        runsFromRunning: { type: Number },
    },
    { _id: false }
);

const BowlingPhaseSchema = new Schema<IBowlingPhase>(
    {
        phase: { type: String, enum: PHASE_IDS, required: true },
        balls: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        dots: { type: Number, default: 0 },
    },
    { _id: false }
);

const SpellSchema = new Schema<ISpell>(
    {
        overs: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
    },
    { _id: false }
);

const WicketDetailSchema = new Schema<IWicketDetail>(
    {
        batterPosition: { type: Number, min: 1, max: 11 },
        dismissalType: { type: String, enum: DISMISSAL_TYPES },
        deliveryLength: { type: String, enum: DELIVERY_LENGTHS },
        bowlingPhase: { type: String, enum: PHASE_IDS },
    },
    { _id: false }
);

const BowlingDetailSchema = new Schema<IBowlingDetail>(
    {
        dots: { type: Number },
        foursConceded: { type: Number },
        sixesConceded: { type: Number },
        phases: { type: [BowlingPhaseSchema], default: undefined },
        spells: { type: [SpellSchema], default: undefined },
        wicketsDetail: { type: [WicketDetailSchema], default: undefined },
        catchesDroppedOffBowling: { type: Number },
        bowlingDotPct: { type: Number },
    },
    { _id: false }
);

const InningsBattingSchema = new Schema<IInningsBatting>(
    {
        didNotBat: { type: Boolean, default: false },
        runs: { type: Number, default: 0 },
        ballsFaced: { type: Number, default: 0 },
        fours: { type: Number, default: 0 },
        sixes: { type: Number, default: 0 },
        dismissalType: { type: String, enum: DISMISSAL_TYPES },
        dismissalBowler: { type: String },
        dismissalFielder: { type: String },
        battingPosition: { type: Number, min: 1, max: 11 },
        strikeRate: { type: Number, default: 0 },
        boundaryRuns: { type: Number, default: 0 },
        boundaryPercentage: { type: Number, default: 0 },
        ballsPerBoundary: { type: Number },
        isFifty: { type: Boolean, default: false },
        isCentury: { type: Boolean, default: false },
        isDuck: { type: Boolean, default: false },
        isNotOut: { type: Boolean, default: false },
        hasDetail: { type: Boolean, default: false },
        detail: { type: BattingDetailSchema },
    },
    { _id: false }
);

const InningsBowlingSchema = new Schema<IInningsBowling>(
    {
        didNotBowl: { type: Boolean, default: false },
        overs: { type: Number, default: 0 },
        maidens: { type: Number, default: 0 },
        runsConceded: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        wides: { type: Number, default: 0 },
        noBalls: { type: Number, default: 0 },
        ballsBowled: { type: Number, default: 0 },
        economy: { type: Number, default: 0 },
        extrasPerOver: { type: Number },
        bowlingStrikeRate: { type: Number },
        bowlingAverage: { type: Number },
        isThreeWicketHaul: { type: Boolean, default: false },
        isFourWicketHaul: { type: Boolean, default: false },
        isFiveWicketHaul: { type: Boolean, default: false },
        hasDetail: { type: Boolean, default: false },
        detail: { type: BowlingDetailSchema },
    },
    { _id: false }
);

const FieldingSchema = new Schema<IFielding>(
    {
        catches: { type: Number, default: 0 },
        runOuts: { type: Number, default: 0 },
        stumpings: { type: Number, default: 0 },
        totalDismissals: { type: Number, default: 0 },
        dropped: { type: Number, default: 0 },
        directHits: { type: Number, default: 0 },
        runsSavedEstimate: { type: Number, default: 0 },
        misfields: { type: Number, default: 0 },
    },
    { _id: false }
);

const PerformanceSchema = new Schema<IPerformance>(
    {
        match: { type: Schema.Types.ObjectId, ref: "Match", required: true },
        batting: InningsBattingSchema,
        bowling: InningsBowlingSchema,
        firstInningsBatting: InningsBattingSchema,
        secondInningsBatting: InningsBattingSchema,
        firstInningsBowling: InningsBowlingSchema,
        secondInningsBowling: InningsBowlingSchema,
        fielding: {
            type: FieldingSchema,
            default: () => ({
                catches: 0,
                runOuts: 0,
                stumpings: 0,
                totalDismissals: 0,
                dropped: 0,
                directHits: 0,
                runsSavedEstimate: 0,
                misfields: 0,
            }),
        },
        isCaptain: { type: Boolean, default: false },
        isWicketkeeper: { type: Boolean, default: false },
        playerOfMatch: { type: Boolean, default: false },
        matchRuns: { type: Number, default: 0 },
        matchWickets: { type: Number, default: 0 },
        matchBallsFaced: { type: Number, default: 0 },
        matchOvers: { type: Number, default: 0 },
    },
    { timestamps: true }
);

PerformanceSchema.index({ match: 1 }, { unique: true });

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

function zoneTotal(zones?: Partial<IShotZones>): number {
    if (!zones) return 0;
    return (Object.keys(zones) as ShotZoneId[]).reduce((sum, key) => sum + (Number(zones[key]) || 0), 0);
}

export function battingDetailIsMeaningful(detail?: IBattingDetail | null): boolean {
    if (!detail) return false;
    const runTypes = (detail.dots || 0) + (detail.singles || 0) + (detail.twos || 0) + (detail.threes || 0);
    if (runTypes > 0) return true;
    if ((detail.minutesBatted || 0) > 0 || (detail.ballsTo50 || 0) > 0 || (detail.ballsTo100 || 0) > 0) return true;
    if ((detail.entryTeamScore || 0) > 0 || (detail.entryWickets || 0) > 0 || (detail.entryOver || 0) > 0) return true;
    if ((detail.vsPace?.balls || 0) > 0 || (detail.vsSpin?.balls || 0) > 0) return true;
    if (detail.phases?.some((p) => (p.balls || 0) > 0 || (p.runs || 0) > 0 || (p.dots || 0) > 0)) return true;
    if (zoneTotal(detail.zones) > 0) return true;
    if (detail.bowlerType || detail.deliveryLength || detail.deliveryLine || detail.shotPlayed || detail.dismissalPhase) {
        return true;
    }
    if (detail.partnerships?.some((p) => (p.runs || 0) > 0 || (p.myRuns || 0) > 0 || (p.partner || "").trim())) {
        return true;
    }
    return false;
}

export function bowlingDetailIsMeaningful(detail?: IBowlingDetail | null): boolean {
    if (!detail) return false;
    if ((detail.dots || 0) > 0 || (detail.foursConceded || 0) > 0 || (detail.sixesConceded || 0) > 0) return true;
    if ((detail.catchesDroppedOffBowling || 0) > 0) return true;
    if (detail.phases?.some((p) => (p.balls || 0) > 0 || (p.runs || 0) > 0 || (p.wickets || 0) > 0 || (p.dots || 0) > 0)) {
        return true;
    }
    if (detail.spells?.some((s) => (s.overs || 0) > 0 || (s.runs || 0) > 0 || (s.wickets || 0) > 0)) return true;
    if (detail.wicketsDetail?.some((w) => w.batterPosition || w.dismissalType || w.deliveryLength || w.bowlingPhase)) {
        return true;
    }
    return false;
}

PerformanceSchema.pre("save", function (next) {
    const calculateBattingDerived = (batting: IInningsBatting) => {
        if (batting.didNotBat) {
            batting.hasDetail = false;
            return;
        }

        batting.strikeRate =
            batting.ballsFaced > 0 ? round2((batting.runs / batting.ballsFaced) * 100) : 0;
        batting.boundaryRuns = batting.fours * 4 + batting.sixes * 6;
        batting.boundaryPercentage =
            batting.runs > 0 ? round2((batting.boundaryRuns / batting.runs) * 100) : 0;
        const boundaries = batting.fours + batting.sixes;
        batting.ballsPerBoundary = boundaries > 0 ? round2(batting.ballsFaced / boundaries) : undefined;
        batting.isFifty = batting.runs >= 50 && batting.runs < 100;
        batting.isCentury = batting.runs >= 100;
        batting.isNotOut = batting.dismissalType === "not_out" || batting.dismissalType === "retired_hurt";
        batting.isDuck = batting.runs === 0 && !batting.isNotOut && !batting.didNotBat;
        batting.hasDetail = battingDetailIsMeaningful(batting.detail);

        if (batting.detail && batting.hasDetail) {
            const dots = batting.detail.dots || 0;
            const scoringShots =
                (batting.detail.singles || 0) +
                (batting.detail.twos || 0) +
                (batting.detail.threes || 0) +
                batting.fours +
                batting.sixes;
            batting.detail.dotPct = batting.ballsFaced > 0 ? round2((dots / batting.ballsFaced) * 100) : 0;
            batting.detail.scoringShotPct =
                batting.ballsFaced > 0 ? round2((scoringShots / batting.ballsFaced) * 100) : 0;
            batting.detail.runsFromRunning = Math.max(0, batting.runs - batting.boundaryRuns);
        }
    };

    const calculateBowlingDerived = (bowling: IInningsBowling) => {
        if (bowling.didNotBowl) {
            bowling.hasDetail = false;
            return;
        }

        const fullOvers = Math.floor(bowling.overs);
        const partialBalls = Math.round((bowling.overs - fullOvers) * 10);
        bowling.ballsBowled = fullOvers * 6 + partialBalls;
        const trueOvers = bowling.ballsBowled / 6;
        bowling.economy = trueOvers > 0 ? round2(bowling.runsConceded / trueOvers) : 0;
        const extras = (bowling.wides || 0) + (bowling.noBalls || 0);
        bowling.extrasPerOver = trueOvers > 0 ? round2(extras / trueOvers) : 0;

        if (bowling.wickets > 0) {
            bowling.bowlingStrikeRate = round2(bowling.ballsBowled / bowling.wickets);
            bowling.bowlingAverage = round2(bowling.runsConceded / bowling.wickets);
        } else {
            bowling.bowlingStrikeRate = undefined;
            bowling.bowlingAverage = undefined;
        }

        bowling.isThreeWicketHaul = bowling.wickets >= 3;
        bowling.isFourWicketHaul = bowling.wickets >= 4;
        bowling.isFiveWicketHaul = bowling.wickets >= 5;
        bowling.hasDetail = bowlingDetailIsMeaningful(bowling.detail);

        if (bowling.detail && bowling.hasDetail && bowling.ballsBowled > 0 && bowling.detail.dots != null) {
            bowling.detail.bowlingDotPct = round2((bowling.detail.dots / bowling.ballsBowled) * 100);
        }
    };

    if (this.batting) calculateBattingDerived(this.batting);
    if (this.bowling) calculateBowlingDerived(this.bowling);
    if (this.firstInningsBatting) calculateBattingDerived(this.firstInningsBatting);
    if (this.secondInningsBatting) calculateBattingDerived(this.secondInningsBatting);
    if (this.firstInningsBowling) calculateBowlingDerived(this.firstInningsBowling);
    if (this.secondInningsBowling) calculateBowlingDerived(this.secondInningsBowling);

    if (this.fielding) {
        this.fielding.totalDismissals =
            (this.fielding.catches || 0) + (this.fielding.runOuts || 0) + (this.fielding.stumpings || 0);
    }

    let totalRuns = 0;
    let totalWickets = 0;
    let totalBallsFaced = 0;
    let totalBallsBowled = 0;

    const addBat = (b?: IInningsBatting) => {
        if (b && !b.didNotBat) {
            totalRuns += b.runs || 0;
            totalBallsFaced += b.ballsFaced || 0;
        }
    };
    const addBowl = (b?: IInningsBowling) => {
        if (b && !b.didNotBowl) {
            totalWickets += b.wickets || 0;
            totalBallsBowled += b.ballsBowled || 0;
        }
    };

    addBat(this.batting);
    addBat(this.firstInningsBatting);
    addBat(this.secondInningsBatting);
    addBowl(this.bowling);
    addBowl(this.firstInningsBowling);
    addBowl(this.secondInningsBowling);

    this.matchRuns = totalRuns;
    this.matchWickets = totalWickets;
    this.matchBallsFaced = totalBallsFaced;
    const full = Math.floor(totalBallsBowled / 6);
    const rem = totalBallsBowled % 6;
    this.matchOvers = Number(`${full}.${rem}`);

    next();
});

export default mongoose.models.Performance ||
    mongoose.model<IPerformance>("Performance", PerformanceSchema);
