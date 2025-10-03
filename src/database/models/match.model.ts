import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
  level: "school" | "domestic" | "Ranji" | "IPL" | "international";
  format: "Test" | "ODI" | "T20" | "First-class" | "List-A" | "T20-domestic";
  date: Date;
  venue: string;
  opponent: string;
  result?: string;

  // International extras
  tossWinner?: string;
  tossDecision?: "bat" | "bowl";
  umpires?: string[];
  referee?: string;
  series?: string;
  manOfTheMatch?: string; // name
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
