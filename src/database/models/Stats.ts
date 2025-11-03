import mongoose, { Schema, Document } from "mongoose";

export interface IStats extends Document {
  level: "under19-international" | "domestic" | "Ranji" | "IPL" | "List-A" | "international";
  format: "Test" | "ODI" | "T20" | "First-class" | "List-A" | "T20-domestic";

  matches: number;
  innings: number;

  // batting
  runs: number;
  ballsFaced: number;
  hundreds: number;
  fifties: number;
  ducks: number;
  highestScore: number;
  notOuts: number;
  average: number;
  strikeRate: number;

  // bowling
  ballsBowled: number;
  runsConceded: number;
  wickets: number;
  bestBowling?: string;
  economy: number;
  averageBowling: number;
  strikeRateBowling: number;
  fiveWickets: number;
  tenWickets: number;

  // fielding
  catches: number;
  stumpings: number;
  runOuts: number;
}

const StatsSchema = new Schema<IStats>(
  {
    level: { type: String, enum: ["under19-international", "domestic", "Ranji", "IPL", "List-A", "international"], required: true },
    format: { type: String, enum: ["Test", "ODI", "T20", "First-class", "List-A", "T20-domestic"], required: true },

    matches: { type: Number, default: 0 },
    innings: { type: Number, default: 0 },

    runs: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    hundreds: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    ducks: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    notOuts: { type: Number, default: 0 },
    average: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },

    ballsBowled: { type: Number, default: 0 },
    runsConceded: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    bestBowling: { type: String },
    economy: { type: Number, default: 0 },
    averageBowling: { type: Number, default: 0 },
    strikeRateBowling: { type: Number, default: 0 },
    fiveWickets: { type: Number, default: 0 },
    tenWickets: { type: Number, default: 0 },

    catches: { type: Number, default: 0 },
    stumpings: { type: Number, default: 0 },
    runOuts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// prevent duplicates for same level+format
StatsSchema.index({ level: 1, format: 1 }, { unique: true });

export default mongoose.models.Stats || mongoose.model<IStats>("Stats", StatsSchema);
