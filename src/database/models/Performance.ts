import mongoose, { Schema, Document } from "mongoose";

export interface IPerformance extends Document {
  match: mongoose.Types.ObjectId;
  
  // Match context
  battingPosition?: number;
  bowlingPosition?: "opening" | "middle" | "death";
  innings?: 1 | 2; // First or second innings
  isChasing?: boolean;
  
  // Batting performance
  runs?: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  dotBalls?: number;
  boundaryPercentage?: number;
  dismissal?: {
    type: "caught" | "bowled" | "lbw" | "run_out" | "stumped" | "hit_wicket" | "not_out" | "retired";
    bowler?: string;
    fielder?: string;
    details?: string;
  };
  
  // Bowling performance
  overs?: number;
  maidens?: number;
  runsConceded?: number;
  wickets?: number;
  economy?: number;
  dotBallsBowled?: number;
  wicketTypes?: {
    caught: number;
    bowled: number;
    lbw: number;
    stumped: number;
    hitWicket: number;
  };
  
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
    
    // Batting performance
    runs: Number,
    ballsFaced: Number,
    fours: Number,
    sixes: Number,
    strikeRate: Number,
    dotBalls: Number,
    boundaryPercentage: Number,
    dismissal: {
      type: { 
        type: String, 
        enum: ["caught", "bowled", "lbw", "run_out", "stumped", "hit_wicket", "not_out", "retired"] 
      },
      bowler: String,
      fielder: String,
      details: String,
    },
    
    // Bowling performance
    overs: Number,
    maidens: Number,
    runsConceded: Number,
    wickets: Number,
    economy: Number,
    dotBallsBowled: Number,
    wicketTypes: {
      caught: { type: Number, default: 0 },
      bowled: { type: Number, default: 0 },
      lbw: { type: Number, default: 0 },
      stumped: { type: Number, default: 0 },
      hitWicket: { type: Number, default: 0 },
    },
    
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

