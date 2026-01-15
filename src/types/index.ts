import {
    MatchFormat,
    MatchLevel,
    MatchResult,
    VenueType,
    PitchType,
    MatchTypeOption,
    DismissalType,
    SeriesType,
    SeriesFormat,
    SeriesStatus,
    WeatherCondition,
} from "@/lib/constants";

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ============================================
// Series Types
// ============================================

export interface SeriesFormData {
    name: string;
    type: SeriesType;
    format: SeriesFormat;
    level: MatchLevel;
    startDate: string;
    endDate?: string;
    hostCountry: string;
    teams: string[];
    totalMatches: number;
    status?: SeriesStatus;
    winner?: string;
    notes?: string;
    tournamentStructure?: {
        hasGroupStage: boolean;
        hasKnockout: boolean;
        groups?: { name: string; teams: string[] }[];
    };
}

export interface SeriesListItem {
    _id: string;
    name: string;
    type: SeriesType;
    format: SeriesFormat;
    level: MatchLevel;
    startDate: string;
    endDate?: string;
    hostCountry: string;
    teams: string[];
    totalMatches: number;
    status: SeriesStatus;
    winner?: string;
    notes?: string;
}

// ============================================
// Match Types
// ============================================

export interface MatchFormData {
    seriesId?: string;
    format: MatchFormat;
    level: MatchLevel;
    date: string;
    venue: string;
    city: string;
    country?: string;
    opponent: string;
    teamRepresented?: string;
    venueType?: VenueType;
    result?: MatchResult;
    resultMargin?: string;
    pitchType?: PitchType;
    weatherCondition?: WeatherCondition;
    tossWinner?: string;
    tossDecision?: "bat" | "bowl";
    matchType?: MatchTypeOption;
    notes?: string;
}

export interface MatchListItem {
    _id: string;
    seriesId?: string;
    series?: { _id: string; name: string };
    format: MatchFormat;
    level: MatchLevel;
    date: string;
    venue: string;
    city: string;
    country?: string;
    opponent: string;
    teamRepresented?: string;
    venueType?: VenueType;
    result?: MatchResult;
    resultMargin?: string;
    hasPerformance?: boolean;
    weatherCondition?: WeatherCondition;
    pitchType?: PitchType;
    notes?: string;
}

export interface MatchFilters {
    format?: MatchFormat;
    level?: MatchLevel;
    opponent?: string;
    series?: string;
    result?: MatchResult;
    startDate?: string;
    endDate?: string;
    venue?: string;
}

// ============================================
// Performance Types
// ============================================

export interface InningsBattingFormData {
    didNotBat: boolean;
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    dismissalType?: DismissalType;
    dismissalBowler?: string;
    dismissalFielder?: string;
    battingPosition?: number;
}

export interface InningsBowlingFormData {
    didNotBowl: boolean;
    overs: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    wides: number;
    noBalls: number;
}

export interface FieldingFormData {
    catches: number;
    runOuts: number;
    stumpings: number;
}

export interface PerformanceFormData {
    matchId: string;
    // Single innings (T20/ODI)
    batting?: InningsBattingFormData;
    bowling?: InningsBowlingFormData;
    // Multi innings (Test)
    firstInningsBatting?: InningsBattingFormData;
    secondInningsBatting?: InningsBattingFormData;
    firstInningsBowling?: InningsBowlingFormData;
    secondInningsBowling?: InningsBowlingFormData;
    // Fielding
    fielding: FieldingFormData;
    // Context
    isCaptain: boolean;
    isWicketkeeper: boolean;
}

// ============================================
// Analytics Types
// ============================================

export interface CareerSummary {
    matches: number;
    innings: number;
    runs: number;
    highestScore: { runs: number; isNotOut: boolean };
    battingAverage: number | null;
    strikeRate: number;
    fifties: number;
    centuries: number;
    ducks: number;
    notOuts: number;
    fours: number;
    sixes: number;
    wickets: number;
    bowlingAverage: number | null;
    economy: number;
    bowlingStrikeRate: number | null;
    bestBowling: { wickets: number; runs: number };
    threeWicketHauls: number;
    fiveWicketHauls: number;
    catches: number;
    runOuts: number;
    stumpings: number;
    matchesWon: number;
    matchesLost: number;
    matchesDrawn: number;
    winPercentage: number;
}

export interface FormatStats {
    format: MatchFormat;
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
}

export interface TrendDataPoint {
    matchId: string;
    date: string;
    opponent: string;
    format: MatchFormat;
    runs: number;
    wickets: number;
    cumulativeRuns: number;
    cumulativeWickets: number;
    runningAverage: number;
    runningStrikeRate: number;
    runningEconomy: number;
}

export interface OpponentStats {
    opponent: string;
    matches: number;
    runs: number;
    battingAverage: number | null;
    strikeRate: number;
    wickets: number;
    bowlingAverage: number | null;
    economy: number;
}

export interface VenueStats {
    venue: string;
    city: string;
    country: string;
    matches: number;
    runs: number;
    battingAverage: number | null;
    wickets: number;
    bowlingAverage: number | null;
}

export interface AnalyticsFilters {
    format?: MatchFormat;
    level?: MatchLevel;
    opponent?: string;
    series?: string;
    startDate?: string;
    endDate?: string;
    venue?: string;
    venueType?: VenueType;
}

// ============================================
// Chart Data Types
// ============================================

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

// ============================================
// UI State Types
// ============================================

export interface FormStep {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    isActive: boolean;
}

export interface SelectOption {
    value: string;
    label: string;
}

export interface ToastMessage {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
}
