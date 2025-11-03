import mongoose, { Schema, Document } from "mongoose";

export interface ISeriesParticipation extends Document {
  player: mongoose.Types.ObjectId;
  series: mongoose.Types.ObjectId;
  
  // Team representation in this series
  teamRepresented: string;
  teamLevel: "under19-international" | "domestic" | "Ranji" | "IPL" | "List-A" | "international";
  
  // Player role in the series
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  
  // Series context
  jerseyNumber?: number;
  contractType?: "central" | "state" | "franchise" | "guest";
  
  // Participation status
  status: "selected" | "playing" | "benched" | "injured" | "dropped";
  
  // Series-specific stats summary
  matchesPlayed?: number;
  matchesAvailable?: number;
  
  // Selection details
  selectionDate?: Date;
  debutInSeries?: boolean;
  
  // Notes
  notes?: string;
}

const SeriesParticipationSchema = new Schema<ISeriesParticipation>(
  {
    player: { type: Schema.Types.ObjectId, ref: "Player", required: true },
    series: { type: Schema.Types.ObjectId, ref: "Series", required: true },
    
    // Team representation
    teamRepresented: { type: String, required: true },
    teamLevel: { 
      type: String, 
      enum: ["under19-international", "domestic", "Ranji", "IPL", "List-A", "international"], 
      required: true 
    },
    
    // Player role
    role: { 
      type: String, 
      enum: ["batsman", "bowler", "allrounder", "wicketkeeper"], 
      required: true 
    },
    isCaptain: { type: Boolean, default: false },
    isViceCaptain: { type: Boolean, default: false },
    
    // Series context
    jerseyNumber: Number,
    contractType: { 
      type: String, 
      enum: ["central", "state", "franchise", "guest"] 
    },
    
    // Participation status
    status: { 
      type: String, 
      enum: ["selected", "playing", "benched", "injured", "dropped"], 
      default: "selected" 
    },
    
    // Series stats
    matchesPlayed: { type: Number, default: 0 },
    matchesAvailable: Number,
    
    // Selection details
    selectionDate: Date,
    debutInSeries: { type: Boolean, default: false },
    
    // Notes
    notes: String,
  },
  { timestamps: true }
);

// Ensure unique participation per player per series
SeriesParticipationSchema.index({ player: 1, series: 1 }, { unique: true });

export default mongoose.models.SeriesParticipation || mongoose.model<ISeriesParticipation>("SeriesParticipation", SeriesParticipationSchema);