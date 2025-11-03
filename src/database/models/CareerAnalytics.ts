import mongoose, { Schema, Document } from "mongoose";

export interface ICareerAnalytics extends Document {
  // Career Overview Stats
  totalMatches: {
    overall: number;
    test: number;
    odi: number;
    t20: number;
    firstClass: number;
    listA: number;
    t20Domestic: number;
  };
  
  totalRuns: number;
  totalWickets: number;
  battingAverage: number;
  bowlingAverage: number;
  battingStrikeRate: number;
  bowlingStrikeRate: number;
  
  centuries: number;
  halfCenturies: number;
  thirties: number;
  bestBowlingFigures: string;
  fiveWicketHauls: number;
  tenWicketHauls: number;
  
  totalCatches: number;
  totalStumpings: number;
  totalRunOuts: number;
  notOuts: number;
  highestScore: number;
  
  totalBallsFaced: number;
  totalBallsBowled: number;
  careerSpan: {
    startYear: number;
    endYear?: number;
    duration: number; // in years
  };
  
  // Advanced Career Metrics
  consistencyIndex: number; // Variance in performance
  impactIndex: number; // Weighted by match importance
  clutchScore: number; // Performance in pressure situations
  playerValueIndex: number; // Combined contribution score
  
  // Format-wise breakdown
  formatStats: {
    format: string;
    matches: number;
    runs: number;
    wickets: number;
    average: number;
    strikeRate: number;
    economy: number;
  }[];
  
  // Yearly progression
  yearlyStats: {
    year: number;
    matches: number;
    runs: number;
    wickets: number;
    average: number;
    strikeRate: number;
    economy: number;
    impactScore: number;
  }[];
  
  // Milestone tracking
  milestones: {
    type: "debut" | "50th_match" | "100th_match" | "1000_runs" | "5000_runs" | "10000_runs" | "50_wickets" | "100_wickets" | "200_wickets";
    date: Date;
    match: mongoose.Types.ObjectId;
    format: string;
    details: string;
  }[];
  
  lastUpdated: Date;
}

const CareerAnalyticsSchema = new Schema<ICareerAnalytics>(
  {
    totalMatches: {
      overall: { type: Number, default: 0 },
      test: { type: Number, default: 0 },
      odi: { type: Number, default: 0 },
      t20: { type: Number, default: 0 },
      firstClass: { type: Number, default: 0 },
      listA: { type: Number, default: 0 },
      t20Domestic: { type: Number, default: 0 },
    },
    
    totalRuns: { type: Number, default: 0 },
    totalWickets: { type: Number, default: 0 },
    battingAverage: { type: Number, default: 0 },
    bowlingAverage: { type: Number, default: 0 },
    battingStrikeRate: { type: Number, default: 0 },
    bowlingStrikeRate: { type: Number, default: 0 },
    
    centuries: { type: Number, default: 0 },
    halfCenturies: { type: Number, default: 0 },
    thirties: { type: Number, default: 0 },
    bestBowlingFigures: String,
    fiveWicketHauls: { type: Number, default: 0 },
    tenWicketHauls: { type: Number, default: 0 },
    
    totalCatches: { type: Number, default: 0 },
    totalStumpings: { type: Number, default: 0 },
    totalRunOuts: { type: Number, default: 0 },
    notOuts: { type: Number, default: 0 },
    highestScore: { type: Number, default: 0 },
    
    totalBallsFaced: { type: Number, default: 0 },
    totalBallsBowled: { type: Number, default: 0 },
    careerSpan: {
      startYear: Number,
      endYear: Number,
      duration: Number,
    },
    
    consistencyIndex: { type: Number, default: 0 },
    impactIndex: { type: Number, default: 0 },
    clutchScore: { type: Number, default: 0 },
    playerValueIndex: { type: Number, default: 0 },
    
    formatStats: [{
      format: String,
      matches: Number,
      runs: Number,
      wickets: Number,
      average: Number,
      strikeRate: Number,
      economy: Number,
    }],
    
    yearlyStats: [{
      year: Number,
      matches: Number,
      runs: Number,
      wickets: Number,
      average: Number,
      strikeRate: Number,
      economy: Number,
      impactScore: Number,
    }],
    
    milestones: [{
      type: { 
        type: String, 
        enum: ["debut", "50th_match", "100th_match", "1000_runs", "5000_runs", "10000_runs", "50_wickets", "100_wickets", "200_wickets"] 
      },
      date: Date,
      match: { type: Schema.Types.ObjectId, ref: "Match" },
      format: String,
      details: String,
    }],
    
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.CareerAnalytics || mongoose.model<ICareerAnalytics>("CareerAnalytics", CareerAnalyticsSchema);