import mongoose, { Schema, Document } from "mongoose";

export interface IFieldingAnalytics extends Document {
  // Overall fielding stats
  totalCatches: number;
  totalStumpings: number;
  totalRunOuts: number;
  totalFieldingDismissals: number;
  fieldingSuccessRate: number; // catches taken / chances
  
  // Format-wise fielding stats
  formatStats: {
    format: string;
    matches: number;
    catches: number;
    stumpings: number;
    runOuts: number;
    chances: number;
    successRate: number;
    dismissalsPerMatch: number;
  }[];
  
  // Position-wise fielding analysis
  positionStats: {
    position: string; // slip, gully, point, cover, mid-wicket, etc.
    matches: number;
    catches: number;
    runOuts: number;
    chances: number;
    successRate: number;
  }[];
  
  // Opposition analysis
  vsOpposition: {
    opponent: string;
    matches: number;
    catches: number;
    stumpings: number;
    runOuts: number;
    totalDismissals: number;
    dismissalsPerMatch: number;
  }[];
  
  // Venue analysis
  vsVenues: {
    venue: string;
    matches: number;
    catches: number;
    stumpings: number;
    runOuts: number;
    totalDismissals: number;
    dismissalsPerMatch: number;
  }[];
  
  // Best fielding performances
  bestPerformances: {
    match: mongoose.Types.ObjectId;
    date: Date;
    opponent: string;
    venue: string;
    catches: number;
    stumpings: number;
    runOuts: number;
    totalDismissals: number;
    matchSituation: string;
  }[];
  
  // Fielding impact analysis
  impactStats: {
    matchWinningFielding: number; // crucial catches/runouts that led to wins
    pressureCatches: number; // catches under pressure
    droppedCatches: number;
    missedRunOutChances: number;
    directHits: number;
    assistedRunOuts: number;
  };
  
  // Recent form
  recentForm: {
    last5Matches: {
      catches: number;
      stumpings: number;
      runOuts: number;
      chances: number;
    }[];
    last10Matches: {
      catches: number;
      stumpings: number;
      runOuts: number;
      chances: number;
    }[];
    currentStreak: {
      type: "catches" | "clean_matches" | "dismissals";
      count: number;
      ongoing: boolean;
    };
  };
  
  lastUpdated: Date;
}

const FieldingAnalyticsSchema = new Schema<IFieldingAnalytics>(
  {
    totalCatches: { type: Number, default: 0 },
    totalStumpings: { type: Number, default: 0 },
    totalRunOuts: { type: Number, default: 0 },
    totalFieldingDismissals: { type: Number, default: 0 },
    fieldingSuccessRate: { type: Number, default: 0 },
    
    formatStats: [{
      format: String,
      matches: Number,
      catches: Number,
      stumpings: Number,
      runOuts: Number,
      chances: Number,
      successRate: Number,
      dismissalsPerMatch: Number,
    }],
    
    positionStats: [{
      position: String,
      matches: Number,
      catches: Number,
      runOuts: Number,
      chances: Number,
      successRate: Number,
    }],
    
    vsOpposition: [{
      opponent: String,
      matches: Number,
      catches: Number,
      stumpings: Number,
      runOuts: Number,
      totalDismissals: Number,
      dismissalsPerMatch: Number,
    }],
    
    vsVenues: [{
      venue: String,
      matches: Number,
      catches: Number,
      stumpings: Number,
      runOuts: Number,
      totalDismissals: Number,
      dismissalsPerMatch: Number,
    }],
    
    bestPerformances: [{
      match: { type: Schema.Types.ObjectId, ref: "Match" },
      date: Date,
      opponent: String,
      venue: String,
      catches: Number,
      stumpings: Number,
      runOuts: Number,
      totalDismissals: Number,
      matchSituation: String,
    }],
    
    impactStats: {
      matchWinningFielding: { type: Number, default: 0 },
      pressureCatches: { type: Number, default: 0 },
      droppedCatches: { type: Number, default: 0 },
      missedRunOutChances: { type: Number, default: 0 },
      directHits: { type: Number, default: 0 },
      assistedRunOuts: { type: Number, default: 0 },
    },
    
    recentForm: {
      last5Matches: [{
        catches: Number,
        stumpings: Number,
        runOuts: Number,
        chances: Number,
      }],
      last10Matches: [{
        catches: Number,
        stumpings: Number,
        runOuts: Number,
        chances: Number,
      }],
      currentStreak: {
        type: { type: String, enum: ["catches", "clean_matches", "dismissals"] },
        count: Number,
        ongoing: Boolean,
      },
    },
    
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.FieldingAnalytics || mongoose.model<IFieldingAnalytics>("FieldingAnalytics", FieldingAnalyticsSchema);