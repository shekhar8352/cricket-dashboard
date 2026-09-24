import type { MatchFormat, MatchLevel, MatchResult, VenueType } from "@/lib/constants";
import type {
    CareerSummary,
    FormatStats,
    TrendDataPoint,
    OpponentStats,
    VenueStats,
    RecordCoverageStats,
    VenueTypeOutcomeRow,
    MonthlyMatchVolume,
    DismissalBreakdownItem,
    TossCorrelationStats,
} from "@/types";

export interface Coverage {
    total: number;
    withDetail: number;
    pct: number;
}

export interface MatchContext {
    matchId: string;
    date: string;
    format: MatchFormat;
    level: MatchLevel;
    opponent: string;
    venue: string;
    city: string;
    country: string;
    venueType?: VenueType;
    result?: MatchResult;
    pitchType?: string;
    weatherCondition?: string;
    tossDecision?: "bat" | "bowl";
    matchType?: string;
    teamRepresented?: string;
    seriesId?: string;
    seriesName?: string;
    battedFirst?: boolean;
    dayNight?: boolean;
    teamScore?: { runs: number; wickets: number; overs: number };
    isCaptain: boolean;
    isWicketkeeper: boolean;
    playerOfMatch: boolean;
    userWonToss: boolean | null;
    tier: "international" | "domestic" | "ipl";
}

export interface BattingRow extends MatchContext {
    inningsSlot: "single" | "first" | "second";
    matchInnings: number | null;
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    dismissalType?: string;
    dismissalBowler?: string;
    battingPosition?: number;
    isNotOut: boolean;
    hasDetail: boolean;
    dots?: number;
    singles?: number;
    twos?: number;
    threes?: number;
    minutesBatted?: number;
    ballsTo50?: number;
    ballsTo100?: number;
    entryWickets?: number;
    vsPace?: { runs: number; balls: number; fours: number; sixes: number; dismissed: boolean };
    vsSpin?: { runs: number; balls: number; fours: number; sixes: number; dismissed: boolean };
    phases?: { phase: string; runs: number; balls: number; fours: number; sixes: number; dots: number }[];
    zones?: Partial<Record<string, number>>;
    bowlerType?: string;
    deliveryLength?: string;
    shotPlayed?: string;
    partnerships?: { wicket: number; partner?: string; runs: number; balls: number; myRuns: number }[];
}

export interface BowlingRow extends MatchContext {
    inningsSlot: "single" | "first" | "second";
    overs: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    wides: number;
    noBalls: number;
    ballsBowled: number;
    hasDetail: boolean;
    dots?: number;
    foursConceded?: number;
    sixesConceded?: number;
    phases?: { phase: string; balls: number; runs: number; wickets: number; dots: number }[];
    spells?: { overs: number; runs: number; wickets: number }[];
    wicketsDetail?: { batterPosition?: number; dismissalType?: string; deliveryLength?: string; bowlingPhase?: string }[];
    catchesDroppedOffBowling?: number;
}

export interface FieldingRow extends MatchContext {
    catches: number;
    runOuts: number;
    stumpings: number;
    dropped: number;
    directHits: number;
    runsSavedEstimate: number;
    misfields: number;
}

export interface CareerDataset {
    /** Every match matching the filter, including those without a performance card. */
    matches: MatchContext[];
    batting: BattingRow[];
    bowling: BowlingRow[];
    fielding: FieldingRow[];
}

export interface BattingAggregate {
    innings: number;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    notOuts: number;
    dismissals: number;
    average: number | null;
    strikeRate: number;
    fifties: number;
    centuries: number;
    thirties: number;
    ducks: number;
    goldenDucks: number;
    highest: { runs: number; isNotOut: boolean };
    boundaryRuns: number;
    boundaryPercentage: number;
    ballsPerBoundary: number | null;
    ballsPerDismissal: number | null;
    notOutPercentage: number;
    runsPerInnings: number;
    innings20PlusPct: number;
    standardDeviation: number;
    conversion30to50: number | null;
    conversion50to100: number | null;
    reached30: number;
    reached50: number;
    reached100: number;
}

export interface BowlingAggregate {
    innings: number;
    overs: number;
    balls: number;
    maidens: number;
    runs: number;
    wickets: number;
    wides: number;
    noBalls: number;
    average: number | null;
    economy: number;
    strikeRate: number | null;
    maidensPercentage: number;
    extrasPerOver: number;
    threeWicketHauls: number;
    fourWicketHauls: number;
    fiveWicketHauls: number;
    best: { wickets: number; runs: number };
}

export interface FieldingAggregate {
    matches: number;
    catches: number;
    runOuts: number;
    stumpings: number;
    dismissals: number;
    dropped: number;
    directHits: number;
    runsSaved: number;
    misfields: number;
    catchEfficiency: number | null;
    dismissalsPerMatch: number;
}

export interface SplitStatRow {
    key: string;
    label: string;
    matches: number;
    innings: number;
    runs: number;
    battingAverage: number | null;
    strikeRate: number;
    fifties: number;
    centuries: number;
    wickets: number;
    bowlingAverage: number | null;
    economy: number;
    bowlingStrikeRate: number | null;
    catches: number;
    winPercentage: number;
}

export interface FormIndex {
    careerAverage: number | null;
    careerStrikeRate: number;
    last5: { innings: number; runs: number; average: number | null; strikeRate: number };
    last10: { innings: number; runs: number; average: number | null; strikeRate: number };
}

export interface RadarAxis {
    key: string;
    label: string;
    raw: string;
    score: number;
}

export interface Milestone {
    label: string;
    date: string;
    detail: string;
}

export interface ScoreRow {
    matchId: string;
    date: string;
    opponent: string;
    format: string;
    runs: number;
    balls: number;
    isNotOut: boolean;
    strikeRate: number;
}

export interface BowlingFigureRow {
    matchId: string;
    date: string;
    opponent: string;
    format: string;
    wickets: number;
    runs: number;
    overs: number;
    economy: number;
}

export interface NamedCount {
    key: string;
    label: string;
    count: number;
}

export interface PhaseStat {
    phase: string;
    label: string;
    runs: number;
    balls: number;
    wickets: number;
    dots: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    economy: number;
    average: number | null;
    boundaryPercentage: number;
}

export interface PaceSpinStat {
    side: "pace" | "spin";
    label: string;
    runs: number;
    balls: number;
    dismissals: number;
    average: number | null;
    strikeRate: number;
    fours: number;
    sixes: number;
}

export interface PartnershipAgg {
    wicket: number;
    count: number;
    runs: number;
    balls: number;
    myRuns: number;
    average: number;
    best: number;
}

export interface ImpactPoint {
    matchId: string;
    date: string;
    opponent: string;
    impact: number;
    runs: number;
    wickets: number;
}

export interface RollingPoint {
    date: string;
    label: string;
    average5: number | null;
    average10: number | null;
    strikeRate5: number;
    strikeRate10: number;
}

export interface YearBar {
    year: string;
    matches: number;
    runs: number;
    wickets: number;
    average: number | null;
    strikeRate: number;
}

export interface ScatterPoint {
    x: number;
    y: number;
    opponent: string;
    date: string;
    format: string;
}

export interface CalendarCell {
    key: string;
    label: string;
    year: string;
    month: number;
    runs: number;
    matches: number;
}

export interface OverviewData {
    summary: CareerSummary;
    form: FormIndex;
    radar: RadarAxis[];
    milestones: Milestone[];
    formats: FormatStats[];
    results: { won: number; lost: number; draw: number; tie: number; noResult: number };
    recordCoverage: RecordCoverageStats;
    venueTypeOutcomes: VenueTypeOutcomeRow[];
    monthlyVolume: MonthlyMatchVolume[];
    toss: TossCorrelationStats;
    tierSplit: SplitStatRow[];
    dismissalBreakdown: DismissalBreakdownItem[];
}

export interface BattingTabData {
    core: BattingAggregate;
    distribution: NamedCount[];
    positions: SplitStatRow[];
    inningsSplit: SplitStatRow[];
    chaseSplit: SplitStatRow[];
    dismissals: DismissalBreakdownItem[];
    bowlers: NamedCount[];
    topScores: ScoreRow[];
    detailCoverage: Coverage;
    dotPct: number | null;
    scoringShotPct: number | null;
    strikeRotationPct: number | null;
    phases: PhaseStat[];
    phaseCoverage: Coverage;
    paceSpin: PaceSpinStat[];
    paceSpinCoverage: Coverage;
    bowlerTypes: NamedCount[];
    lengths: NamedCount[];
    shots: NamedCount[];
    zones: NamedCount[];
    zoneCoverage: Coverage;
    avgBallsTo50: number | null;
    avgBallsTo100: number | null;
    samples50: number;
    samples100: number;
    milestoneCoverage: Coverage;
    entryPressure: BattingAggregate;
    entrySettled: BattingAggregate;
    entryCoverage: Coverage;
    teamShare: number | null;
    teamShareSamples: number;
    teamShareCoverage: Coverage;
    partnerships: PartnershipAgg[];
    partnershipCoverage: Coverage;
}

export interface WicketHistogramBin {
    label: string;
    count: number;
}

export interface BowlingTabData {
    core: BowlingAggregate;
    histogram: WicketHistogramBin[];
    bestFigures: BowlingFigureRow[];
    detailCoverage: Coverage;
    dotPct: number | null;
    boundaryBallPct: number | null;
    phases: PhaseStat[];
    phaseCoverage: Coverage;
    topOrderWicketPct: number | null;
    wicketQualitySamples: number;
    wicketQualityCoverage: Coverage;
    wicketTypes: NamedCount[];
    wicketLengths: NamedCount[];
    firstSpell: { spells: number; overs: number; runs: number; wickets: number; economy: number };
    laterSpells: { spells: number; overs: number; runs: number; wickets: number; economy: number };
    spellCoverage: Coverage;
    dropped: number;
    droppedCoverage: Coverage;
}

export interface FieldingTabData {
    core: FieldingAggregate;
    detailCoverage: Coverage;
}

export interface AllroundTabData {
    battingAverage: number | null;
    bowlingAverage: number | null;
    index: number | null;
    captain: SplitStatRow[];
    keeper: SplitStatRow[];
    results: SplitStatRow[];
    impact: ImpactPoint[];
}

export interface SplitsTabData {
    dimension: string;
    rows: SplitStatRow[];
}

export interface H2HTabData {
    opponents: OpponentStats[];
    selected: string | null;
    profile: {
        batting: BattingAggregate;
        bowling: BowlingAggregate;
        fielding: FieldingAggregate;
        venues: VenueStats[];
        timeline: TrendDataPoint[];
        topScores: ScoreRow[];
    } | null;
}

export interface TrendsTabData {
    trends: TrendDataPoint[];
    rolling: RollingPoint[];
    years: YearBar[];
    scatter: ScatterPoint[];
    calendar: CalendarCell[];
}

export type AnalyticsTabId =
    | "overview"
    | "batting"
    | "bowling"
    | "fielding"
    | "allround"
    | "splits"
    | "h2h"
    | "trends";
