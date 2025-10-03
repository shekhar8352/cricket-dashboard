import mongoose, { Schema, Document } from "mongoose";

export interface IVenueStats extends Document {
  venue: string; // e.g. "Eden Gardens"
  format: string;
  matches: number;
  runs: number;
  wickets: number;
  averageBatting: number;
  strikeRateBatting: number;
  averageBowling: number;
  economy: number;
}

const VenueStatsSchema = new Schema<IVenueStats>(
  {
    venue: { type: String, required: true },
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

VenueStatsSchema.index({ venue: 1, format: 1 }, { unique: true });

export default mongoose.models.VenueStats || mongoose.model<IVenueStats>("VenueStats", VenueStatsSchema);
