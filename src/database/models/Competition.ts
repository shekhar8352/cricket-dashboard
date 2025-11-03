import mongoose, { Schema, Document } from "mongoose";

export interface ICompetition extends Document {
  name: string; // e.g. "ICC World Cup 2011", "India vs Australia Test Series 2008"
  type: "tournament" | "bilateral" | "domestic"; 
  level: "under19-international" | "domestic" | "Ranji" | "IPL" | "List-A" | "international";
  format: "Test" | "ODI" | "T20" | "First-class" | "List-A" | "T20-domestic";
  season?: string; // e.g. "2008/09", "2011"
  startDate: Date;
  endDate: Date;

  // Only for bilateral series
  homeTeam?: string; // e.g. "India"
  awayTeam?: string; // e.g. "Australia"

  matches: mongoose.Types.ObjectId[]; // refs Match

  // optional stats summary (cached for dashboards)
  stats?: {
    matches: number;
    runs: number;
    wickets: number;
    averageBatting: number;
    strikeRateBatting: number;
    averageBowling: number;
    economy: number;
  };
}

const CompetitionSchema = new Schema<ICompetition>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["tournament", "bilateral", "domestic"], required: true },
    level: { type: String, enum: ["under19-international", "domestic", "Ranji", "IPL", "List-A", "international"], required: true },
    format: { type: String, enum: ["Test", "ODI", "T20", "First-class", "List-A", "T20-domestic"], required: true },
    season: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    homeTeam: String,
    awayTeam: String,

    matches: [{ type: Schema.Types.ObjectId, ref: "Match" }],

    stats: {
      matches: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      averageBatting: { type: Number, default: 0 },
      strikeRateBatting: { type: Number, default: 0 },
      averageBowling: { type: Number, default: 0 },
      economy: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Competition || mongoose.model<ICompetition>("Competition", CompetitionSchema);
