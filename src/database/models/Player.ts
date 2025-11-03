import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
  fullName: string;
  dob: Date;
  country: string;
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
  battingStyle: string;
  bowlingStyle?: string;
  careerStart: Date;
  careerEnd?: Date;
  currentTeam?: string;
  teams: { name: string; level: string; from: Date; to?: Date }[];
  isActive: boolean;
  
  // Additional player details for analytics
  height?: number; // in cm
  weight?: number; // in kg
  birthPlace?: string;
  nickname?: string;
  education?: string;
  debut?: {
    international?: { Test?: Date; ODI?: Date; T20?: Date };
    domestic?: { firstClass?: Date; listA?: Date; t20?: Date };
    ipl?: Date;
  };
  
  // Career statistics summary (calculated fields)
  careerStats?: {
    matches: number;
    runs: number;
    wickets: number;
    catches: number;
    lastUpdated: Date;
  };
}

const PlayerSchema = new Schema<IPlayer>(
  {
    fullName: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    country: { type: String, required: true },
    role: { type: String, enum: ["batsman", "bowler", "allrounder", "wicketkeeper"], required: true },
    battingStyle: { type: String, required: true },
    bowlingStyle: { type: String },
    careerStart: { type: Date, required: true },
    careerEnd: { type: Date },
    currentTeam: { type: String },
    teams: [
      {
        name: String,
        level: { type: String, enum: ["under19-international", "domestic", "Ranji", "IPL", "List-A", "international"] },
        from: Date,
        to: Date,
      },
    ],
    isActive: { type: Boolean, default: true },
    
    // Additional player details
    height: Number,
    weight: Number,
    birthPlace: String,
    nickname: String,
    education: String,
    debut: {
      international: {
        Test: Date,
        ODI: Date,
        T20: Date,
      },
      domestic: {
        firstClass: Date,
        listA: Date,
        t20: Date,
      },
      ipl: Date,
    },
    
    // Career statistics summary
    careerStats: {
      matches: { type: Number, default: 0 },
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      catches: { type: Number, default: 0 },
      lastUpdated: Date,
    },
  },
  { timestamps: true }
);

// Ensure only one active player at a time
PlayerSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);
