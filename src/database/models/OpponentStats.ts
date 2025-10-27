import mongoose, { Schema, Document } from "mongoose";

export interface IOpponentStats extends Document {
  opponent: string; // e.g. "Australia"
  level: "school" | "domestic" | "Ranji" | "IPL" | "international";
  format: "Test" | "ODI" | "T20" | "First-class" | "List-A" | "T20-domestic";

  matches: number;
  runs: number;
  hundreds: number;
  fifties: number;
  averageBatting: number;
  strikeRateBatting: number;

  wickets: number;
  bestBowling?: string;
  averageBowling: number;
  economy: number;
}

const OpponentStatsSchema = new Schema<IOpponentStats>(
  {
    opponent: { type: String, required: true },
    level: { type: String, enum: ["school", "domestic", "Ranji", "IPL", "international"], required: true },
    format: { type: String, enum: ["Test", "ODI", "T20", "First-class", "List-A", "T20-domestic"], required: true },

    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    hundreds: { type: Number, default: 0 },
    fifties: { type: Number, default: 0 },
    averageBatting: { type: Number, default: 0 },
    strikeRateBatting: { type: Number, default: 0 },

    wickets: { type: Number, default: 0 },
    bestBowling: String,
    averageBowling: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
  },
  { timestamps: true }
);

OpponentStatsSchema.index({ opponent: 1, level: 1, format: 1 }, { unique: true });

export default mongoose.models.OpponentStats || mongoose.model<IOpponentStats>("OpponentStats", OpponentStatsSchema);
