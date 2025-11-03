import mongoose, { Schema, Document } from "mongoose";

export interface IPerformance extends Document {
  match: mongoose.Types.ObjectId;

  // Match context
  battingPosition?: number;
  bowlingPosition?: "opening" | "middle" | "death";
  innings?: 1 | 2; // First or second innings
  isChasing?: boolean;
  target?: number; // Target score when chasing
  requiredRunRate?: number;

  // Player role in match
  isCaptain?: boolean;
  isWicketKeeper?: boolean;

  // Batting performance
  runs?: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  dotBalls?: number;
  boundaryPercentage?: number;
  singles?: number;
  twos?: number;
  threes?: number;

  // Batting phases
  powerplayRuns?: number;
  powerplayBalls?: number;
  middleOversRuns?: number;
  middleOversBalls?: number;
  deathOversRuns?: number;
  deathOversBalls?: number;

  // Batting against different bowling types
  vsSeamers?: { runs: number; balls: number; dismissals: number };
  vsSpinners?: { runs: number; balls: number; dismissals: number };
  vsPace?: { runs: number; balls: number; dismissals: number };

  // Batting in different conditions
  newBallRuns?: number;
  newBallBalls?: number;
  oldBallRuns?: number;
  oldBallBalls?: number;

  dismissal?: {
    type: "caught" | "bowled" | "lbw" | "run_out" | "stumped" | "hit_wicket" | "not_out" | "retired" | "timed_out" | "obstructing_field" | "handled_ball";
    bowler?: string;
    fielder?: string;
    details?: string;
    overNumber?: number;
    ballNumber?: number;
  };

  // Bowling performance
  overs?: number;
  maidens?: number;
  runsConceded?: number;
  wickets?: number;
  economy?: number;
  dotBallsBowled?: number;
  wides?: number;
  noBalls?: number;
  byes?: number;
  legByes?: number;

  // Bowling analysis
  bowlingAverage?: number;
  bowlingStrikeRate?: number; // Bowling strike rate

  wicketTypes?: {
    caught: number;
    bowled: number;
    lbw: number;
    stumped: number;
    hitWicket: number;
  };

  // Bowling to different batsmen types
  vsRightHanders?: { overs: number; runs: number; wickets: number };
  vsLeftHanders?: { overs: number; runs: number; wickets: number };

  // Bowling in different phases
  withNewBall?: { overs: number; runs: number; wickets: number };
  withOldBall?: { overs: number; runs: number; wickets: number };

  // Phase-wise bowling (for limited overs)
  powerplayStats?: {
    overs: number;
    runs: number;
    wickets: number;
    economy: number;
  };
  middleOversStats?: {
    overs: number;
    runs: number;
    wickets: number;
    economy: number;
  };
  deathOversStats?: {
    overs: number;
    runs: number;
    wickets: number;
    economy: number;
  };

  // Fielding
  catches?: number;
  stumpings?: number;
  runOuts?: number;
  fieldingPosition?: string;

  // Advanced metrics
  impactScore?: number; // Weighted contribution to match
  pressureIndex?: number; // Performance under pressure
  matchSituation?: "comfortable" | "pressure" | "crisis";

  // Detailed data for analytics
  partnerships?: {
    partner: string;
    runs: number;
    balls: number;
    wicketNumber: number;
    strikeRotation: number;
  }[];

  wagonWheel?: {
    region: "fine_leg" | "square_leg" | "mid_wicket" | "long_on" | "long_off" | "cover" | "point" | "third_man";
    runs: number;
    balls: number;
    boundaries: number;
  }[];

  ballByBall?: {
    over: number;
    ball: number;
    bowler: string;
    runs: number;
    cumulative_runs: number;
    extras?: { type: "wide" | "no_ball" | "bye" | "leg_bye"; runs: number };
    wicket?: boolean;
    dismissalType?: string;
    fielder?: string;
    shotType?: string;
    region?: string;
    pitchMap?: { length: "short" | "good" | "full" | "yorker"; line: "off" | "middle" | "leg" };
  }[];
}

const PerformanceSchema = new Schema<IPerformance>(
  {
    match: { type: Schema.Types.ObjectId, ref: "Match", required: true },

    // Match context
    battingPosition: Number,
    bowlingPosition: { type: String, enum: ["opening", "middle", "death"] },
    innings: { type: Number, enum: [1, 2] },
    isChasing: Boolean,
    target: Number,
    requiredRunRate: Number,

    // Player role
    isCaptain: Boolean,
    isWicketKeeper: Boolean,

    // Batting performance
    runs: Number,
    ballsFaced: Number,
    fours: Number,
    sixes: Number,
    strikeRate: Number,
    dotBalls: Number,
    boundaryPercentage: Number,
    singles: Number,
    twos: Number,
    threes: Number,

    // Batting phases
    powerplayRuns: Number,
    powerplayBalls: Number,
    middleOversRuns: Number,
    middleOversBalls: Number,
    deathOversRuns: Number,
    deathOversBalls: Number,

    // Batting against different bowling
    vsSeamers: { runs: Number, balls: Number, dismissals: Number },
    vsSpinners: { runs: Number, balls: Number, dismissals: Number },
    vsPace: { runs: Number, balls: Number, dismissals: Number },

    // Batting conditions
    newBallRuns: Number,
    newBallBalls: Number,
    oldBallRuns: Number,
    oldBallBalls: Number,

    dismissal: {
      type: {
        type: String,
        enum: ["caught", "bowled", "lbw", "run_out", "stumped", "hit_wicket", "not_out", "retired", "timed_out", "obstructing_field", "handled_ball"]
      },
      bowler: String,
      fielder: String,
      details: String,
      overNumber: Number,
      ballNumber: Number,
    },

    // Bowling performance
    overs: Number,
    maidens: Number,
    runsConceded: Number,
    wickets: Number,
    economy: Number,
    dotBallsBowled: Number,
    wides: Number,
    noBalls: Number,
    byes: Number,
    legByes: Number,

    // Bowling analysis
    bowlingAverage: Number,
    bowlingStrikeRate: Number,

    wicketTypes: {
      caught: { type: Number, default: 0 },
      bowled: { type: Number, default: 0 },
      lbw: { type: Number, default: 0 },
      stumped: { type: Number, default: 0 },
      hitWicket: { type: Number, default: 0 },
    },

    // Bowling to different batsmen
    vsRightHanders: { overs: Number, runs: Number, wickets: Number },
    vsLeftHanders: { overs: Number, runs: Number, wickets: Number },

    // Bowling phases
    withNewBall: { overs: Number, runs: Number, wickets: Number },
    withOldBall: { overs: Number, runs: Number, wickets: Number },

    // Phase-wise bowling
    powerplayStats: {
      overs: Number,
      runs: Number,
      wickets: Number,
      economy: Number,
    },
    middleOversStats: {
      overs: Number,
      runs: Number,
      wickets: Number,
      economy: Number,
    },
    deathOversStats: {
      overs: Number,
      runs: Number,
      wickets: Number,
      economy: Number,
    },

    // Fielding
    catches: Number,
    stumpings: Number,
    runOuts: Number,
    fieldingPosition: String,

    // Advanced metrics
    impactScore: Number,
    pressureIndex: Number,
    matchSituation: { type: String, enum: ["comfortable", "pressure", "crisis"] },

    // Detailed analytics data
    partnerships: [{
      partner: String,
      runs: Number,
      balls: Number,
      wicketNumber: Number,
      strikeRotation: Number,
    }],

    wagonWheel: [{
      region: {
        type: String,
        enum: ["fine_leg", "square_leg", "mid_wicket", "long_on", "long_off", "cover", "point", "third_man"]
      },
      runs: Number,
      balls: Number,
      boundaries: Number,
    }],

    ballByBall: [{
      over: Number,
      ball: Number,
      bowler: String,
      runs: Number,
      cumulative_runs: Number,
      extras: { type: { type: String, enum: ["wide", "no_ball", "bye", "leg_bye"] }, runs: Number },
      wicket: Boolean,
      dismissalType: String,
      fielder: String,
      shotType: String,
      region: String,
      pitchMap: {
        length: { type: String, enum: ["short", "good", "full", "yorker"] },
        line: { type: String, enum: ["off", "middle", "leg"] }
      },
    }],
  },
  { timestamps: true }
);

export default mongoose.models.Performance || mongoose.model<IPerformance>("Performance", PerformanceSchema);

