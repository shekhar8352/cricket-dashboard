import mongoose, { Schema, Document } from "mongoose";

export interface IBowlingAnalytics extends Document {
  // Format-wise bowling stats
  formatStats: {
    format: string;
    matches: number;
    innings: number;
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
    average: number;
    economy: number;
    strikeRate: number;
    bestFigures: string;
    fiveWickets: number;
    tenWickets: number;
    dotBallPercentage: number;
  }[];
  
  // Bowling position analysis
  positionStats: {
    opening: {
      matches: number;
      overs: number;
      wickets: number;
      economy: number;
      average: number;
      strikeRate: number;
    };
    middle: {
      matches: number;
      overs: number;
      wickets: number;
      economy: number;
      average: number;
      strikeRate: number;
    };
    death: {
      matches: number;
      overs: number;
      wickets: number;
      economy: number;
      average: number;
      strikeRate: number;
    };
  };
  
  // Phase-wise analysis (for limited overs)
  phaseAnalysis: {
    powerplay: {
      overs: number;
      runs: number;
      wickets: number;
      economy: number;
      dotBallPercentage: number;
    };
    middleOvers: {
      overs: number;
      runs: number;
      wickets: number;
      economy: number;
      dotBallPercentage: number;
    };
    deathOvers: {
      overs: number;
      runs: number;
      wickets: number;
      economy: number;
      dotBallPercentage: number;
    };
  };
  
  // Dismissal types induced
  dismissalTypes: {
    caught: number;
    bowled: number;
    lbw: number;
    stumped: number;
    hitWicket: number;
  };
  
  // Opposition analysis
  vsOpposition: {
    opponent: string;
    matches: number;
    overs: number;
    wickets: number;
    runs: number;
    average: number;
    economy: number;
    strikeRate: number;
    bestFigures: string;
  }[];
  
  // Venue analysis
  vsVenues: {
    venue: string;
    matches: number;
    overs: number;
    wickets: number;
    runs: number;
    average: number;
    economy: number;
    strikeRate: number;
    bestFigures: string;
  }[];
  
  // Home vs Away
  homeAwayStats: {
    home: {
      matches: number;
      overs: number;
      wickets: number;
      runs: number;
      average: number;
      economy: number;
      strikeRate: number;
    };
    away: {
      matches: number;
      overs: number;
      wickets: number;
      runs: number;
      average: number;
      economy: number;
      strikeRate: number;
    };
  };
  
  // Bowling line and length analysis
  deliveryAnalysis: {
    length: {
      short: { balls: number; runs: number; wickets: number; };
      good: { balls: number; runs: number; wickets: number; };
      full: { balls: number; runs: number; wickets: number; };
      yorker: { balls: number; runs: number; wickets: number; };
    };
    line: {
      off: { balls: number; runs: number; wickets: number; };
      middle: { balls: number; runs: number; wickets: number; };
      leg: { balls: number; runs: number; wickets: number; };
    };
  };
  
  // Match situation performance
  situationalStats: {
    defendingTotal: {
      matches: number;
      overs: number;
      wickets: number;
      economy: number;
      successRate: number; // % of successful defenses
    };
    restrictingRuns: {
      matches: number;
      overs: number;
      wickets: number;
      economy: number;
    };
    breakingPartnerships: {
      partnerships: number;
      averagePartnershipBroken: number;
    };
  };
  
  // Wicket distribution by over (for limited overs)
  wicketDistribution: {
    over: number;
    wickets: number;
  }[];
  
  // Form analysis
  recentForm: {
    last5Matches: {
      wickets: number;
      economy: number;
      overs: number;
    }[];
    last10Matches: {
      wickets: number;
      economy: number;
      overs: number;
    }[];
    currentStreak: {
      type: "wickets" | "maidens" | "economical_spells";
      count: number;
      ongoing: boolean;
    };
    bestStreak: {
      type: "consecutive_wickets" | "economical_overs";
      count: number;
      period: string;
    };
  };
  
  lastUpdated: Date;
}

const BowlingAnalyticsSchema = new Schema<IBowlingAnalytics>(
  {
    formatStats: [{
      format: String,
      matches: Number,
      innings: Number,
      overs: Number,
      maidens: Number,
      runs: Number,
      wickets: Number,
      average: Number,
      economy: Number,
      strikeRate: Number,
      bestFigures: String,
      fiveWickets: Number,
      tenWickets: Number,
      dotBallPercentage: Number,
    }],
    
    positionStats: {
      opening: {
        matches: Number,
        overs: Number,
        wickets: Number,
        economy: Number,
        average: Number,
        strikeRate: Number,
      },
      middle: {
        matches: Number,
        overs: Number,
        wickets: Number,
        economy: Number,
        average: Number,
        strikeRate: Number,
      },
      death: {
        matches: Number,
        overs: Number,
        wickets: Number,
        economy: Number,
        average: Number,
        strikeRate: Number,
      },
    },
    
    phaseAnalysis: {
      powerplay: {
        overs: Number,
        runs: Number,
        wickets: Number,
        economy: Number,
        dotBallPercentage: Number,
      },
      middleOvers: {
        overs: Number,
        runs: Number,
        wickets: Number,
        economy: Number,
        dotBallPercentage: Number,
      },
      deathOvers: {
        overs: Number,
        runs: Number,
        wickets: Number,
        economy: Number,
        dotBallPercentage: Number,
      },
    },
    
    dismissalTypes: {
      caught: { type: Number, default: 0 },
      bowled: { type: Number, default: 0 },
      lbw: { type: Number, default: 0 },
      stumped: { type: Number, default: 0 },
      hitWicket: { type: Number, default: 0 },
    },
    
    vsOpposition: [{
      opponent: String,
      matches: Number,
      overs: Number,
      wickets: Number,
      runs: Number,
      average: Number,
      economy: Number,
      strikeRate: Number,
      bestFigures: String,
    }],
    
    vsVenues: [{
      venue: String,
      matches: Number,
      overs: Number,
      wickets: Number,
      runs: Number,
      average: Number,
      economy: Number,
      strikeRate: Number,
      bestFigures: String,
    }],
    
    homeAwayStats: {
      home: {
        matches: Number,
        overs: Number,
        wickets: Number,
        runs: Number,
        average: Number,
        economy: Number,
        strikeRate: Number,
      },
      away: {
        matches: Number,
        overs: Number,
        wickets: Number,
        runs: Number,
        average: Number,
        economy: Number,
        strikeRate: Number,
      },
    },
    
    deliveryAnalysis: {
      length: {
        short: { balls: Number, runs: Number, wickets: Number },
        good: { balls: Number, runs: Number, wickets: Number },
        full: { balls: Number, runs: Number, wickets: Number },
        yorker: { balls: Number, runs: Number, wickets: Number },
      },
      line: {
        off: { balls: Number, runs: Number, wickets: Number },
        middle: { balls: Number, runs: Number, wickets: Number },
        leg: { balls: Number, runs: Number, wickets: Number },
      },
    },
    
    situationalStats: {
      defendingTotal: {
        matches: Number,
        overs: Number,
        wickets: Number,
        economy: Number,
        successRate: Number,
      },
      restrictingRuns: {
        matches: Number,
        overs: Number,
        wickets: Number,
        economy: Number,
      },
      breakingPartnerships: {
        partnerships: Number,
        averagePartnershipBroken: Number,
      },
    },
    
    wicketDistribution: [{
      over: Number,
      wickets: Number,
    }],
    
    recentForm: {
      last5Matches: [{
        wickets: Number,
        economy: Number,
        overs: Number,
      }],
      last10Matches: [{
        wickets: Number,
        economy: Number,
        overs: Number,
      }],
      currentStreak: {
        type: { type: String, enum: ["wickets", "maidens", "economical_spells"] },
        count: Number,
        ongoing: Boolean,
      },
      bestStreak: {
        type: { type: String, enum: ["consecutive_wickets", "economical_overs"] },
        count: Number,
        period: String,
      },
    },
    
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.BowlingAnalytics || mongoose.model<IBowlingAnalytics>("BowlingAnalytics", BowlingAnalyticsSchema);