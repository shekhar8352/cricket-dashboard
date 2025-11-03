import mongoose, { Schema, Document } from "mongoose";

export interface IBattingAnalytics extends Document {
  // Format-wise batting stats
  formatStats: {
    format: string;
    matches: number;
    innings: number;
    runs: number;
    average: number;
    strikeRate: number;
    hundreds: number;
    fifties: number;
    thirties: number;
    ducks: number;
    notOuts: number;
    highestScore: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    boundaryPercentage: number;
    dotBallPercentage: number;
  }[];
  
  // Batting position analysis
  positionStats: {
    position: number;
    innings: number;
    runs: number;
    average: number;
    strikeRate: number;
    hundreds: number;
    fifties: number;
  }[];
  
  // Dismissal analysis
  dismissalTypes: {
    caught: number;
    bowled: number;
    lbw: number;
    runOut: number;
    stumped: number;
    hitWicket: number;
    notOut: number;
  };
  
  // Performance in different match situations
  situationalStats: {
    firstInnings: {
      matches: number;
      runs: number;
      average: number;
      strikeRate: number;
    };
    chasing: {
      matches: number;
      runs: number;
      average: number;
      strikeRate: number;
      successRate: number; // % of successful chases
    };
    pressure: {
      matches: number; // When team in trouble
      runs: number;
      average: number;
      strikeRate: number;
    };
  };
  
  // Partnership analysis
  partnerships: {
    partner: string;
    partnerships: number;
    runs: number;
    averagePartnership: number;
    highestPartnership: number;
    strikeRotation: number;
  }[];
  
  // Conversion rates
  conversionRates: {
    thirtyToFifty: number; // %
    fiftyToHundred: number; // %
    startToThirty: number; // %
  };
  
  // Opposition analysis
  vsOpposition: {
    opponent: string;
    matches: number;
    runs: number;
    average: number;
    strikeRate: number;
    hundreds: number;
    fifties: number;
    highestScore: number;
  }[];
  
  // Venue analysis
  vsVenues: {
    venue: string;
    matches: number;
    runs: number;
    average: number;
    strikeRate: number;
    hundreds: number;
    fifties: number;
    highestScore: number;
  }[];
  
  // Home vs Away
  homeAwayStats: {
    home: {
      matches: number;
      runs: number;
      average: number;
      strikeRate: number;
      hundreds: number;
      fifties: number;
    };
    away: {
      matches: number;
      runs: number;
      average: number;
      strikeRate: number;
      hundreds: number;
      fifties: number;
    };
  };
  
  // Wagon wheel analysis (shot distribution)
  shotAnalysis: {
    region: string;
    runs: number;
    balls: number;
    boundaries: number;
    percentage: number;
  }[];
  
  // Form analysis
  recentForm: {
    last5Matches: number[];
    last10Matches: number[];
    currentStreak: {
      type: "fifties" | "hundreds" | "ducks" | "runs";
      count: number;
      ongoing: boolean;
    };
    bestStreak: {
      type: "fifties" | "hundreds" | "consecutive_scores";
      count: number;
      period: string;
    };
  };
  
  lastUpdated: Date;
}

const BattingAnalyticsSchema = new Schema<IBattingAnalytics>(
  {
    formatStats: [{
      format: String,
      matches: Number,
      innings: Number,
      runs: Number,
      average: Number,
      strikeRate: Number,
      hundreds: Number,
      fifties: Number,
      thirties: Number,
      ducks: Number,
      notOuts: Number,
      highestScore: Number,
      ballsFaced: Number,
      fours: Number,
      sixes: Number,
      boundaryPercentage: Number,
      dotBallPercentage: Number,
    }],
    
    positionStats: [{
      position: Number,
      innings: Number,
      runs: Number,
      average: Number,
      strikeRate: Number,
      hundreds: Number,
      fifties: Number,
    }],
    
    dismissalTypes: {
      caught: { type: Number, default: 0 },
      bowled: { type: Number, default: 0 },
      lbw: { type: Number, default: 0 },
      runOut: { type: Number, default: 0 },
      stumped: { type: Number, default: 0 },
      hitWicket: { type: Number, default: 0 },
      notOut: { type: Number, default: 0 },
    },
    
    situationalStats: {
      firstInnings: {
        matches: Number,
        runs: Number,
        average: Number,
        strikeRate: Number,
      },
      chasing: {
        matches: Number,
        runs: Number,
        average: Number,
        strikeRate: Number,
        successRate: Number,
      },
      pressure: {
        matches: Number,
        runs: Number,
        average: Number,
        strikeRate: Number,
      },
    },
    
    partnerships: [{
      partner: String,
      partnerships: Number,
      runs: Number,
      averagePartnership: Number,
      highestPartnership: Number,
      strikeRotation: Number,
    }],
    
    conversionRates: {
      thirtyToFifty: Number,
      fiftyToHundred: Number,
      startToThirty: Number,
    },
    
    vsOpposition: [{
      opponent: String,
      matches: Number,
      runs: Number,
      average: Number,
      strikeRate: Number,
      hundreds: Number,
      fifties: Number,
      highestScore: Number,
    }],
    
    vsVenues: [{
      venue: String,
      matches: Number,
      runs: Number,
      average: Number,
      strikeRate: Number,
      hundreds: Number,
      fifties: Number,
      highestScore: Number,
    }],
    
    homeAwayStats: {
      home: {
        matches: Number,
        runs: Number,
        average: Number,
        strikeRate: Number,
        hundreds: Number,
        fifties: Number,
      },
      away: {
        matches: Number,
        runs: Number,
        average: Number,
        strikeRate: Number,
        hundreds: Number,
        fifties: Number,
      },
    },
    
    shotAnalysis: [{
      region: String,
      runs: Number,
      balls: Number,
      boundaries: Number,
      percentage: Number,
    }],
    
    recentForm: {
      last5Matches: [Number],
      last10Matches: [Number],
      currentStreak: {
        type: { type: String, enum: ["fifties", "hundreds", "ducks", "runs"] },
        count: Number,
        ongoing: Boolean,
      },
      bestStreak: {
        type: { type: String, enum: ["fifties", "hundreds", "consecutive_scores"] },
        count: Number,
        period: String,
      },
    },
    
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.BattingAnalytics || mongoose.model<IBattingAnalytics>("BattingAnalytics", BattingAnalyticsSchema);