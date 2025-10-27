import mongoose, { Schema, Document } from "mongoose";

export interface ISeasonStats extends Document {
  season: string; // e.g. "2011", "2020/21"
  format: string;
  matches: number;
  runs: number;
  wickets: number;
  averageBatting: number;
  strikeRateBatting: number;
  averageBowling: number;
  economy: number;
}

const SeasonStatsSchema = new Schema<ISeasonStats>(
  {
    season: { type: String, required: true },
    format: { type: String, required: true },
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    averageBatting: { type: Number, default: 0 },
    strikeRateBatting: { type: Number, default: 0 },
    averageBowling: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SeasonStatsSchema.index({ season: 1, format: 1 }, { unique: true });

export default mongoose.models.SeasonStats || mongoose.model<ISeasonStats>("SeasonStats", SeasonStatsSchema);
