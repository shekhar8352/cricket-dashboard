import mongoose, { Schema, Document } from "mongoose";

export interface ISeries extends Document {
  name: string;
  type: "bilateral" | "triangular" | "tournament" | "league";
  format: "Test" | "ODI" | "T20" | "First-class" | "List-A" | "T20-domestic" | "mixed";
  level: "under19-international" | "domestic" | "Ranji" | "IPL" | "List-A" | "international";
  
  // Series details
  startDate: Date;
  endDate: Date;
  hostCountry: string;
  
  // Participating teams
  teams: {
    name: string;
    isHome: boolean;
  }[];
  
  // Match structure
  totalMatches: number;
  matchesPlayed?: number;
  
  // Series context
  description?: string;
  trophy?: string;
  sponsor?: string;
  
  // Tournament specific (if type is tournament)
  tournamentStructure?: {
    groupStage?: boolean;
    knockoutStage?: boolean;
    finalStage?: boolean;
    groups?: {
      name: string;
      teams: string[];
    }[];
  };
  
  // Status
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  winner?: string;
  
  // Associated matches
  matches: mongoose.Types.ObjectId[];
}

const SeriesSchema = new Schema<ISeries>(
  {
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["bilateral", "triangular", "tournament", "league"], 
      required: true 
    },
    format: { 
      type: String, 
      enum: ["Test", "ODI", "T20", "First-class", "List-A", "T20-domestic", "mixed"], 
      required: true 
    },
    level: { 
      type: String, 
      enum: ["under19-international", "domestic", "Ranji", "IPL", "List-A", "international"], 
      required: true 
    },
    
    // Series details
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    hostCountry: { type: String, required: true },
    
    // Participating teams
    teams: [{
      name: { type: String, required: true },
      isHome: { type: Boolean, default: false }
    }],
    
    // Match structure
    totalMatches: { type: Number, required: true },
    matchesPlayed: { type: Number, default: 0 },
    
    // Series context
    description: String,
    trophy: String,
    sponsor: String,
    
    // Tournament structure
    tournamentStructure: {
      groupStage: Boolean,
      knockoutStage: Boolean,
      finalStage: Boolean,
      groups: [{
        name: String,
        teams: [String]
      }]
    },
    
    // Status
    status: { 
      type: String, 
      enum: ["upcoming", "ongoing", "completed", "cancelled"], 
      default: "upcoming" 
    },
    winner: String,
    
    // Associated matches
    matches: [{ type: Schema.Types.ObjectId, ref: "Match" }]
  },
  { timestamps: true }
);

export default mongoose.models.Series || mongoose.model<ISeries>("Series", SeriesSchema);