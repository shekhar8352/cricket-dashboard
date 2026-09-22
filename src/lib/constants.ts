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
    "T20I",
    "First-class",
    "List-A",
    "T20-domestic",
    "Youth ODI",
    "Youth Test",
    "Youth T20",
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
    "club",
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
export const SERIES_FORMATS = ["Test", "ODI", "T20", "T20I", "First-class", "List-A", "mixed", "Youth ODI", "Youth Test", "Youth T20"] as const;

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
export const VENUE_TYPES = ["home", "away", "neutral"] as const;

export type VenueType = (typeof VENUE_TYPES)[number];

// Pitch types
export const PITCH_TYPES = ["green", "dusty", "hard", "flat", "dry", "damp"] as const;

export type PitchType = (typeof PITCH_TYPES)[number];

// Weather conditions
export const WEATHER_CONDITIONS = ["sunny", "overcast", "rainy", "humid", "windy"] as const;

export type WeatherCondition = (typeof WEATHER_CONDITIONS)[number];

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
    return format === "Test" || format === "First-class" || format === "Youth Test";
};

// Display labels for formats
export const FORMAT_LABELS: Record<MatchFormat, string> = {
    Test: "Test Match",
    ODI: "One Day International",
    T20: "T20 Match",
    T20I: "T20 International",
    "First-class": "First Class",
    "List-A": "List A",
    "T20-domestic": "T20 Domestic",
    "Youth ODI": "Youth ODI",
    "Youth Test": "Youth Test",
    "Youth T20": "Youth T20",
};

// Display labels for levels
export const LEVEL_LABELS: Record<MatchLevel, string> = {
    international: "International",
    ipl: "IPL",
    domestic: "Domestic",
    ranji: "Ranji Trophy",
    under19: "Under-19",
    "list-a": "List A",
    club: "Club Cricket",
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

/** Levels treated as domestic for the tier filter. IPL stays its own level. */
export const DOMESTIC_LEVELS: MatchLevel[] = [
    "domestic",
    "ranji",
    "under19",
    "list-a",
    "club",
];

export const PHASE_IDS = ["powerplay", "middle", "death", "new_ball", "second_new_ball"] as const;
export type PhaseId = (typeof PHASE_IDS)[number];

export interface PhaseDefinition {
    id: PhaseId;
    label: string;
    range: string;
}

const T20_PHASES: PhaseDefinition[] = [
    { id: "powerplay", label: "Powerplay", range: "1–6" },
    { id: "middle", label: "Middle", range: "7–15" },
    { id: "death", label: "Death", range: "16–20" },
];

const ODI_PHASES: PhaseDefinition[] = [
    { id: "powerplay", label: "Powerplay", range: "1–10" },
    { id: "middle", label: "Middle", range: "11–40" },
    { id: "death", label: "Death", range: "41–50" },
];

const FIRST_CLASS_PHASES: PhaseDefinition[] = [
    { id: "new_ball", label: "New ball", range: "1–30" },
    { id: "middle", label: "Middle", range: "31–80" },
    { id: "second_new_ball", label: "Second new ball", range: "81+" },
];

export function phasesForFormat(format: string): PhaseDefinition[] {
    if (format === "Test" || format === "First-class" || format === "Youth Test") {
        return FIRST_CLASS_PHASES;
    }
    if (format === "ODI" || format === "List-A" || format === "Youth ODI") {
        return ODI_PHASES;
    }
    return T20_PHASES;
}

export const PHASE_LABELS: Record<PhaseId, string> = {
    powerplay: "Powerplay",
    middle: "Middle",
    death: "Death",
    new_ball: "New ball",
    second_new_ball: "Second new ball",
};

export const BOWLER_TYPES = [
    "right_arm_pace",
    "left_arm_pace",
    "off_spin",
    "leg_spin",
    "left_arm_orthodox",
    "left_arm_wrist",
] as const;
export type BowlerType = (typeof BOWLER_TYPES)[number];

export const BOWLER_TYPE_LABELS: Record<BowlerType, string> = {
    right_arm_pace: "Right-arm pace",
    left_arm_pace: "Left-arm pace",
    off_spin: "Off spin",
    leg_spin: "Leg spin",
    left_arm_orthodox: "Left-arm orthodox",
    left_arm_wrist: "Left-arm wrist spin",
};

export const DELIVERY_LENGTHS = [
    "short",
    "back_of_length",
    "good",
    "full",
    "yorker",
    "full_toss",
] as const;
export type DeliveryLength = (typeof DELIVERY_LENGTHS)[number];

export const DELIVERY_LENGTH_LABELS: Record<DeliveryLength, string> = {
    short: "Short",
    back_of_length: "Back of a length",
    good: "Good length",
    full: "Full",
    yorker: "Yorker",
    full_toss: "Full toss",
};

export const DELIVERY_LINES = ["off", "middle", "leg", "wide_off", "wide_leg"] as const;
export type DeliveryLine = (typeof DELIVERY_LINES)[number];

export const DELIVERY_LINE_LABELS: Record<DeliveryLine, string> = {
    off: "Off",
    middle: "Middle",
    leg: "Leg",
    wide_off: "Wide outside off",
    wide_leg: "Wide on leg",
};

export const SHOTS = [
    "drive",
    "cut",
    "pull",
    "sweep",
    "defence",
    "loft",
    "flick",
    "leave",
    "hook",
    "glance",
    "reverse",
] as const;
export type ShotPlayed = (typeof SHOTS)[number];

export const SHOT_LABELS: Record<ShotPlayed, string> = {
    drive: "Drive",
    cut: "Cut",
    pull: "Pull",
    sweep: "Sweep",
    defence: "Defence",
    loft: "Loft",
    flick: "Flick",
    leave: "Leave",
    hook: "Hook",
    glance: "Glance",
    reverse: "Reverse",
};

export const SHOT_ZONES = [
    { id: "thirdMan", label: "Third man" },
    { id: "point", label: "Point" },
    { id: "cover", label: "Cover" },
    { id: "longOff", label: "Long-off" },
    { id: "longOn", label: "Long-on" },
    { id: "midWicket", label: "Midwicket" },
    { id: "squareLeg", label: "Square leg" },
    { id: "fineLeg", label: "Fine leg" },
] as const;

export type ShotZoneId = (typeof SHOT_ZONES)[number]["id"];

/** Levels that open the advanced scorecard by default. */
export function detailedIngestDefaultOpen(level: string): boolean {
    return level === "international" || level === "ipl";
}
