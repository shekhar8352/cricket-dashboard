import mongoose, { Schema, Document } from "mongoose";

export interface IAdvancedMetrics extends Document {
  // Consistency and Performance Indices
  consistencyIndex: {
    batting: number; // Lower variance = higher consistency
    bowling: number;
    overall: number;
    calculation: {
      battingVariance: number;
      bowlingVariance: number;
      matchCount: number;
    };
  };
  
  impactIndex: {
    batting: number; // Weighted by match importance and situation
    bowling: number;
    fielding: number;
    overall: number;
    calculation: {
      matchImportanceWeights: number[];
      situationWeights: number[];
      performanceScores: number[];
    };
  };
  
  clutchScore: {
    batting: number; // Performance in pressure situations
    bowling: number;
    overall: number;
    pressureMatches: number;
    calculation: {
      pressureThreshold: number;
      pressurePerformances: number[];
      normalPerformances: number[];
    };
  };
  
  playerValueIndex: {
    total: number; // Combined contribution across all skills
    battingContribution: number;
    bowlingContribution: number;
    fieldingContribution: number;
    calculation: {
      battingWeight: number;
      bowlingWeight: number;
      fieldingWeight: number;
      roleMultiplier: number;
    };
  };
  
  // Form and Momentum Analysis
  formCurve: {
    current: number; // Current form rating (0-100)
    trend: "improving" | "declining" | "stable";
    last5Average: number;
    last10Average: number;
    careerAverage: number;
    peakForm: {
      rating: number;
      period: string;
      matches: number;
    };
    calculation: {
      recentWeights: number[];
      performanceScores: number[];
      trendSlope: number;
    };
  };
  
  // Match Impact Analysis
  matchImpact: {
    winContribution: number; // % contribution to team wins
    matchWinningPerformances: number;
    matchLosingPerformances: number;
    drawSavingPerformances: number;
    averageImpactScore: number;
    highImpactMatches: {
      match: mongoose.Types.ObjectId;
      date: Date;
      opponent: string;
      impactScore: number;
      description: string;
    }[];
  };
  
  // Situational Performance Metrics
  situationalMetrics: {
    homeAdvantage: {
      homePerformance: number;
      awayPerformance: number;
      advantage: number; // % better at home
    };
    formatAdaptability: {
      testRating: number;
      odiRating: number;
      t20Rating: number;
      adaptabilityScore: number; // How well adapts across formats
    };
    oppositionStrength: {
      vsStrongTeams: number; // Performance vs top-tier opposition
      vsWeakTeams: number;
      strengthIndex: number; // Ability to perform vs strong opposition
    };
    matchPhase: {
      earlyCareer: number; // First 25% of matches
      midCareer: number; // Middle 50% of matches
      lateCareer: number; // Last 25% of matches
      careerProgression: number; // Improvement over time
    };
  };
  
  // Comparison Metrics
  peerComparison: {
    battingPercentile: number; // Among players of same role/era
    bowlingPercentile: number;
    fieldingPercentile: number;
    overallPercentile: number;
    roleRanking: number; // Ranking among similar role players
    eraAdjustedRating: number; // Performance adjusted for era
  };
  
  // Predictive Metrics
  predictiveMetrics: {
    formMomentum: number; // Likelihood of continued good form
    injuryRisk: number; // Based on workload and age
    careerTrajectory: "ascending" | "peak" | "declining";
    expectedPerformance: {
      nextMatch: {
        battingScore: number;
        bowlingScore: number;
        confidence: number;
      };
      next5Matches: {
        averageBattingScore: number;
        averageBowlingScore: number;
        confidence: number;
      };
    };
  };
  
  // Milestone Predictions
  milestonePredictions: {
    nextMilestone: {
      type: string;
      target: number;
      current: number;
      estimatedMatches: number;
      probability: number;
    };
    careerProjections: {
      totalRuns: number;
      totalWickets: number;
      totalMatches: number;
      confidence: number;
    };
  };
  
  lastCalculated: Date;
  calculationVersion: string; // For tracking algorithm changes
}

const AdvancedMetricsSchema = new Schema<IAdvancedMetrics>(
  {
    consistencyIndex: {
      batting: Number,
      bowling: Number,
      overall: Number,
      calculation: {
        battingVariance: Number,
        bowlingVariance: Number,
        matchCount: Number,
      },
    },
    
    impactIndex: {
      batting: Number,
      bowling: Number,
      fielding: Number,
      overall: Number,
      calculation: {
        matchImportanceWeights: [Number],
        situationWeights: [Number],
        performanceScores: [Number],
      },
    },
    
    clutchScore: {
      batting: Number,
      bowling: Number,
      overall: Number,
      pressureMatches: Number,
      calculation: {
        pressureThreshold: Number,
        pressurePerformances: [Number],
        normalPerformances: [Number],
      },
    },
    
    playerValueIndex: {
      total: Number,
      battingContribution: Number,
      bowlingContribution: Number,
      fieldingContribution: Number,
      calculation: {
        battingWeight: Number,
        bowlingWeight: Number,
        fieldingWeight: Number,
        roleMultiplier: Number,
      },
    },
    
    formCurve: {
      current: Number,
      trend: { type: String, enum: ["improving", "declining", "stable"] },
      last5Average: Number,
      last10Average: Number,
      careerAverage: Number,
      peakForm: {
        rating: Number,
        period: String,
        matches: Number,
      },
      calculation: {
        recentWeights: [Number],
        performanceScores: [Number],
        trendSlope: Number,
      },
    },
    
    matchImpact: {
      winContribution: Number,
      matchWinningPerformances: Number,
      matchLosingPerformances: Number,
      drawSavingPerformances: Number,
      averageImpactScore: Number,
      highImpactMatches: [{
        match: { type: Schema.Types.ObjectId, ref: "Match" },
        date: Date,
        opponent: String,
        impactScore: Number,
        description: String,
      }],
    },
    
    situationalMetrics: {
      homeAdvantage: {
        homePerformance: Number,
        awayPerformance: Number,
        advantage: Number,
      },
      formatAdaptability: {
        testRating: Number,
        odiRating: Number,
        t20Rating: Number,
        adaptabilityScore: Number,
      },
      oppositionStrength: {
        vsStrongTeams: Number,
        vsWeakTeams: Number,
        strengthIndex: Number,
      },
      matchPhase: {
        earlyCareer: Number,
        midCareer: Number,
        lateCareer: Number,
        careerProgression: Number,
      },
    },
    
    peerComparison: {
      battingPercentile: Number,
      bowlingPercentile: Number,
      fieldingPercentile: Number,
      overallPercentile: Number,
      roleRanking: Number,
      eraAdjustedRating: Number,
    },
    
    predictiveMetrics: {
      formMomentum: Number,
      injuryRisk: Number,
      careerTrajectory: { type: String, enum: ["ascending", "peak", "declining"] },
      expectedPerformance: {
        nextMatch: {
          battingScore: Number,
          bowlingScore: Number,
          confidence: Number,
        },
        next5Matches: {
          averageBattingScore: Number,
          averageBowlingScore: Number,
          confidence: Number,
        },
      },
    },
    
    milestonePredictions: {
      nextMilestone: {
        type: String,
        target: Number,
        current: Number,
        estimatedMatches: Number,
        probability: Number,
      },
      careerProjections: {
        totalRuns: Number,
        totalWickets: Number,
        totalMatches: Number,
        confidence: Number,
      },
    },
    
    lastCalculated: { type: Date, default: Date.now },
    calculationVersion: { type: String, default: "1.0" },
  },
  { timestamps: true }
);

export default mongoose.models.AdvancedMetrics || mongoose.model<IAdvancedMetrics>("AdvancedMetrics", AdvancedMetricsSchema);