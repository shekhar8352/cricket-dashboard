import mongoose, { Schema, Document } from "mongoose";

export interface IPerformance extends Document {
  match: mongoose.Types.ObjectId;

  // batting
  runs?: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
  dismissal?: {
    type: string; // e.g. "caught"
    bowler?: string;
    fielder?: string;
    details?: string;
  };

  // bowling
  overs?: number;
  maidens?: number;
  runsConceded?: number;
  wickets?: number;
  economy?: number;

  // fielding
  catches?: number;
  stumpings?: number;
  runOuts?: number;

  // international-only
  partnerships?: { partner: string; runs: number; balls: number; wicketNumber: number }[];
  wagonWheel?: { region: string; runs: number; balls: number }[];
  ballByBall?: {
    over: number;
    ball: number;
    bowler: string;
    runs: number;
    extras?: { type: string; runs: number };
    wicket?: boolean;
    dismissalType?: string;
    fielder?: string;
  }[];
}

const PerformanceSchema = new Schema<IPerformance>(
  {
    match: { type: Schema.Types.ObjectId, ref: "Match", required: true },

    // batting
    runs: Number,
    ballsFaced: Number,
    fours: Number,
    sixes: Number,
    strikeRate: Number,
    dismissal: {
      type: { type: String },
      bowler: String,
      fielder: String,
      details: String,
    },

    // bowling
    overs: Number,
    maidens: Number,
    runsConceded: Number,
    wickets: Number,
    economy: Number,

    // fielding
    catches: Number,
    stumpings: Number,
    runOuts: Number,

    // international-only
    partnerships: [
      { partner: String, runs: Number, balls: Number, wicketNumber: Number }
    ],
    wagonWheel: [
      { region: String, runs: Number, balls: Number }
    ],
    ballByBall: [
      {
        over: Number,
        ball: Number,
        bowler: String,
        runs: Number,
        extras: { type: { type: String }, runs: Number },
        wicket: Boolean,
        dismissalType: String,
        fielder: String,
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Performance || mongoose.model<IPerformance>("Performance", PerformanceSchema);

