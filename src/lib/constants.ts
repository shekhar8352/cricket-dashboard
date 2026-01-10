// Hardcoded player information
export const PLAYER = {
    name: "Sudhanshu Shekhar",
    battingStyle: "Right Hand Bat",
    bowlingStyle: "Right Arm Fast Medium",
} as const;

// Match formats
export const MATCH_FORMATS = [
    "Test",
    "ODI",
    "T20",
    "First-class",
    "List-A",
    "T20-domestic",
] as const;

export type MatchFormat = (typeof MATCH_FORMATS)[number];

// Match levels
export const MATCH_LEVELS = [
    "international",
    "ipl",
    "domestic",
    "ranji",
    "under19",
    "list-a",
] as const;

export type MatchLevel = (typeof MATCH_LEVELS)[number];

// Series types
export const SERIES_TYPES = [
    "bilateral",
    "tri-series",
    "tournament",
    "league",
] as const;

export type SeriesType = (typeof SERIES_TYPES)[number];

// Series formats
export const SERIES_FORMATS = ["Test", "ODI", "T20", "mixed"] as const;

export type SeriesFormat = (typeof SERIES_FORMATS)[number];

// Series status
export const SERIES_STATUSES = ["upcoming", "ongoing", "completed"] as const;

export type SeriesStatus = (typeof SERIES_STATUSES)[number];

// Match results
export const MATCH_RESULTS = [
    "won",
    "lost",
    "draw",
    "tie",
    "no_result",
] as const;

export type MatchResult = (typeof MATCH_RESULTS)[number];

// Home/Away types
export const HOME_AWAY_TYPES = ["home", "away", "neutral"] as const;

export type HomeAwayType = (typeof HOME_AWAY_TYPES)[number];

// Pitch types
export const PITCH_TYPES = ["batting", "bowling", "balanced"] as const;

export type PitchType = (typeof PITCH_TYPES)[number];

// Match types (tournament context)
export const MATCH_TYPE_OPTIONS = [
    "group",
    "knockout",
    "final",
    "regular",
] as const;

export type MatchTypeOption = (typeof MATCH_TYPE_OPTIONS)[number];

// Dismissal types
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

// Toss decisions
export const TOSS_DECISIONS = ["bat", "bowl"] as const;

export type TossDecision = (typeof TOSS_DECISIONS)[number];

// Helper to check if format supports multiple innings
export const isMultiInningsFormat = (format: MatchFormat): boolean => {
    return format === "Test" || format === "First-class";
};

// Display labels for formats
export const FORMAT_LABELS: Record<MatchFormat, string> = {
    Test: "Test Match",
    ODI: "One Day International",
    T20: "T20 International",
    "First-class": "First Class",
    "List-A": "List A",
    "T20-domestic": "T20 Domestic",
};

// Display labels for levels
export const LEVEL_LABELS: Record<MatchLevel, string> = {
    international: "International",
    ipl: "IPL",
    domestic: "Domestic",
    ranji: "Ranji Trophy",
    under19: "Under-19",
    "list-a": "List A",
};

// Display labels for dismissal types
export const DISMISSAL_LABELS: Record<DismissalType, string> = {
    caught: "Caught",
    bowled: "Bowled",
    lbw: "LBW",
    run_out: "Run Out",
    stumped: "Stumped",
    hit_wicket: "Hit Wicket",
    not_out: "Not Out",
    retired_hurt: "Retired Hurt",
};
