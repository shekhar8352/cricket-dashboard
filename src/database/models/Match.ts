import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
  level: "under19-international" | "domestic" | "Ranji" | "IPL" | "List-A" | "international";
  format: "Test" | "ODI" | "T20" | "First-class" | "List-A" | "T20-domestic";
  date: Date;
  venue: string;
  opponent: string;
  result?: string;

  // Match details for comprehensive analytics
  tossWinner?: string;
  tossDecision?: "bat" | "bowl";
  umpires?: string[];
  referee?: string;
  series?: string;
  seriesType?: "bilateral" | "triangular" | "tournament" | "league";
  tournament?: string;
  manOfTheMatch?: string;
  
  // Match conditions
  weather?: "sunny" | "cloudy" | "overcast" | "drizzle" | "rain";
  pitchCondition?: "green" | "dry" | "dusty" | "flat" | "two-paced";
  pitchType?: "batting" | "bowling" | "balanced";
  
  // Match context
  homeAway?: "home" | "away" | "neutral";
  dayNight?: boolean;
  matchNumber?: number; // in series/tournament
  totalMatches?: number; // in series/tournament
  
  // Team composition
  playingXI?: string[];
  captain?: string;
  wicketKeeper?: string;
  
  // Match timing
  startTime?: string;
  endTime?: string;
  
  // Stadium details
  city?: string;
  country?: string;
  stadiumCapacity?: number;
  
  // Match importance
  importance?: "high" | "medium" | "low";
  matchType?: "debut" | "milestone" | "final" | "knockout" | "regular";
}

const MatchSchema = new Schema<IMatch>(
  {
    level: { type: String, enum: ["school", "domestic", "Ranji", "IPL", "international"], required: true },
    format: { type: String, enum: ["Test", "ODI", "T20", "First-class", "List-A", "T20-domestic"], required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    opponent: { type: String, required: true },
    result: String,

    tossWinner: String,
    tossDecision: { type: String, enum: ["bat", "bowl"] },
    umpires: [String],
    referee: String,
    series: String,
    manOfTheMatch: String,
  },
  { timestamps: true }
);

export default mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);
