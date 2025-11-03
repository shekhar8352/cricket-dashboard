import mongoose from 'mongoose';
import Performance from '@/database/models/Performance';
import Match from '@/database/models/Match';
import CareerAnalytics from '@/database/models/CareerAnalytics';
import BattingAnalytics from '@/database/models/BattingAnalytics';
import BowlingAnalytics from '@/database/models/BowlingAnalytics';
import FieldingAnalytics from '@/database/models/FieldingAnalytics';
import AdvancedMetrics from '@/database/models/AdvancedMetrics';

export class AnalyticsCalculator {
  
  /**
   * Calculate comprehensive career analytics
   */
  static async calculateCareerAnalytics(): Promise<any> {
    try {
      // Get all performances with match data
      const performances = await Performance.find({})
        .populate('match')
        .sort({ 'match.date': 1 });

      if (performances.length === 0) {
        return null;
      }

      const careerStats = this.processCareerStats(performances);
      
      // Update or create career analytics
      const analytics = await CareerAnalytics.findOneAndUpdate(
        {},
        careerStats,
        { upsert: true, new: true }
      );

      return analytics;
    } catch (error) {
      console.error('Error calculating career analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate batting analytics
   */
  static async calculateBattingAnalytics(): Promise<any> {
    try {
      const performances = await Performance.find({ runs: { $exists: true } })
        .populate('match')
        .sort({ 'match.date': 1 });

      const battingStats = this.processBattingStats(performances);
      
      const analytics = await BattingAnalytics.findOneAndUpdate(
        {},
        battingStats,
        { upsert: true, new: true }
      );

      return analytics;
    } catch (error) {
      console.error('Error calculating batting analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate bowling analytics
   */
  static async calculateBowlingAnalytics(): Promise<any> {
    try {
      const performances = await Performance.find({ overs: { $exists: true } })
        .populate('match')
        .sort({ 'match.date': 1 });

      const bowlingStats = this.processBowlingStats(performances);
      
      const analytics = await BowlingAnalytics.findOneAndUpdate(
        {},
        bowlingStats,
        { upsert: true, new: true }
      );

      return analytics;
    } catch (error) {
      console.error('Error calculating bowling analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate fielding analytics
   */
  static async calculateFieldingAnalytics(): Promise<any> {
    try {
      const performances = await Performance.find({
        $or: [
          { catches: { $exists: true } },
          { stumpings: { $exists: true } },
          { runOuts: { $exists: true } }
        ]
      }).populate('match').sort({ 'match.date': 1 });

      const fieldingStats = this.processFieldingStats(performances);
      
      const analytics = await FieldingAnalytics.findOneAndUpdate(
        {},
        fieldingStats,
        { upsert: true, new: true }
      );

      return analytics;
    } catch (error) {
      console.error('Error calculating fielding analytics:', error);
      throw error;
    }
  }

  /**
   * Calculate advanced metrics
   */
  static async calculateAdvancedMetrics(): Promise<any> {
    try {
      const performances = await Performance.find({})
        .populate('match')
        .sort({ 'match.date': 1 });

      const advancedStats = this.processAdvancedMetrics(performances);
      
      const analytics = await AdvancedMetrics.findOneAndUpdate(
        {},
        advancedStats,
        { upsert: true, new: true }
      );

      return analytics;
    } catch (error) {
      console.error('Error calculating advanced metrics:', error);
      throw error;
    }
  }

  /**
   * Process career statistics
   */
  private static processCareerStats(performances: any[]): any {
    const stats = {
      totalMatches: { overall: 0, test: 0, odi: 0, t20: 0, firstClass: 0, listA: 0, t20Domestic: 0 },
      totalRuns: 0,
      totalWickets: 0,
      battingAverage: 0,
      bowlingAverage: 0,
      battingStrikeRate: 0,
      bowlingStrikeRate: 0,
      centuries: 0,
      halfCenturies: 0,
      thirties: 0,
      bestBowlingFigures: '',
      fiveWicketHauls: 0,
      tenWicketHauls: 0,
      totalCatches: 0,
      totalStumpings: 0,
      totalRunOuts: 0,
      notOuts: 0,
      highestScore: 0,
      totalBallsFaced: 0,
      totalBallsBowled: 0,
      careerSpan: { startYear: 0, endYear: 0, duration: 0 },
      formatStats: [] as any[],
      yearlyStats: [] as any[],
      milestones: [] as any[],
      lastUpdated: new Date()
    };

    // Group by format
    const formatGroups: { [key: string]: any[] } = {};
    const yearGroups: { [key: number]: any[] } = {};
    
    let totalBattingInnings = 0;
    let totalBowlingInnings = 0;
    let totalRunsConceded = 0;
    let bestBowlingWickets = 0;
    let bestBowlingRuns = 999;

    performances.forEach(perf => {
      const match = perf.match;
      const format = match.format;
      const year = new Date(match.date).getFullYear();

      // Initialize format group
      if (!formatGroups[format]) {
        formatGroups[format] = [];
      }
      formatGroups[format].push(perf);

      // Initialize year group
      if (!yearGroups[year]) {
        yearGroups[year] = [];
      }
      yearGroups[year].push(perf);

      // Update match counts
      stats.totalMatches.overall++;
      switch (format) {
        case 'Test': stats.totalMatches.test++; break;
        case 'ODI': stats.totalMatches.odi++; break;
        case 'T20': stats.totalMatches.t20++; break;
        case 'First-class': stats.totalMatches.firstClass++; break;
        case 'List-A': stats.totalMatches.listA++; break;
        case 'T20-domestic': stats.totalMatches.t20Domestic++; break;
      }

      // Batting stats
      if (perf.runs !== undefined) {
        stats.totalRuns += perf.runs;
        totalBattingInnings++;
        
        if (perf.runs >= 100) stats.centuries++;
        else if (perf.runs >= 50) stats.halfCenturies++;
        else if (perf.runs >= 30) stats.thirties++;
        
        if (perf.runs > stats.highestScore) {
          stats.highestScore = perf.runs;
        }
        
        if (perf.dismissal?.type === 'not_out') {
          stats.notOuts++;
        }
        
        if (perf.ballsFaced) {
          stats.totalBallsFaced += perf.ballsFaced;
        }
      }

      // Bowling stats
      if (perf.wickets !== undefined) {
        stats.totalWickets += perf.wickets;
        totalBowlingInnings++;
        
        if (perf.runsConceded !== undefined) {
          totalRunsConceded += perf.runsConceded;
        }
        
        if (perf.overs) {
          stats.totalBallsBowled += perf.overs * 6;
        }
        
        if (perf.wickets >= 5) {
          stats.fiveWicketHauls++;
          if (perf.wickets >= 10) {
            stats.tenWicketHauls++;
          }
        }
        
        // Best bowling figures
        if (perf.wickets > bestBowlingWickets || 
            (perf.wickets === bestBowlingWickets && perf.runsConceded < bestBowlingRuns)) {
          bestBowlingWickets = perf.wickets;
          bestBowlingRuns = perf.runsConceded || 0;
          stats.bestBowlingFigures = `${perf.wickets}/${perf.runsConceded || 0}`;
        }
      }

      // Fielding stats
      if (perf.catches) stats.totalCatches += perf.catches;
      if (perf.stumpings) stats.totalStumpings += perf.stumpings;
      if (perf.runOuts) stats.totalRunOuts += perf.runOuts;
    });

    // Calculate averages
    if (totalBattingInnings > 0) {
      const dismissedInnings = totalBattingInnings - stats.notOuts;
      stats.battingAverage = dismissedInnings > 0 ? stats.totalRuns / dismissedInnings : stats.totalRuns;
      stats.battingStrikeRate = stats.totalBallsFaced > 0 ? (stats.totalRuns / stats.totalBallsFaced) * 100 : 0;
    }

    if (totalBowlingInnings > 0 && stats.totalWickets > 0) {
      stats.bowlingAverage = totalRunsConceded / stats.totalWickets;
      stats.bowlingStrikeRate = stats.totalBallsBowled / stats.totalWickets;
    }

    // Career span
    if (performances.length > 0) {
      const firstMatch = performances[0].match;
      const lastMatch = performances[performances.length - 1].match;
      stats.careerSpan.startYear = new Date(firstMatch.date).getFullYear();
      stats.careerSpan.endYear = new Date(lastMatch.date).getFullYear();
      stats.careerSpan.duration = stats.careerSpan.endYear - stats.careerSpan.startYear + 1;
    }

    // Format stats
    stats.formatStats = Object.entries(formatGroups).map(([format, perfs]) => {
      return this.calculateFormatStats(format, perfs);
    });

    // Yearly stats
    stats.yearlyStats = Object.entries(yearGroups).map(([year, perfs]) => {
      return this.calculateYearlyStats(parseInt(year), perfs);
    });

    return stats;
  }

  /**
   * Process batting statistics
   */
  private static processBattingStats(performances: any[]): any {
    // Implementation for detailed batting analytics
    // This would include format-wise stats, position analysis, dismissal types, etc.
    return {
      formatStats: [],
      positionStats: [],
      dismissalTypes: { caught: 0, bowled: 0, lbw: 0, runOut: 0, stumped: 0, hitWicket: 0, notOut: 0 },
      situationalStats: {
        firstInnings: { matches: 0, runs: 0, average: 0, strikeRate: 0 },
        chasing: { matches: 0, runs: 0, average: 0, strikeRate: 0, successRate: 0 },
        pressure: { matches: 0, runs: 0, average: 0, strikeRate: 0 }
      },
      partnerships: [],
      conversionRates: {
        startToThirty: 0,
        thirtyToFifty: 0,
        fiftyToHundred: 0
      },
      vsOpposition: [],
      vsVenues: [],
      homeAwayStats: {
        home: { matches: 0, runs: 0, average: 0, strikeRate: 0, hundreds: 0, fifties: 0 },
        away: { matches: 0, runs: 0, average: 0, strikeRate: 0, hundreds: 0, fifties: 0 }
      },
      shotAnalysis: [],
      recentForm: {},
      lastUpdated: new Date()
    };
  }

  /**
   * Process bowling statistics
   */
  private static processBowlingStats(performances: any[]): any {
    // Implementation for detailed bowling analytics
    return {
      formatStats: [],
      positionStats: {
        opening: { matches: 0, overs: 0, wickets: 0, economy: 0, average: 0, strikeRate: 0 },
        middle: { matches: 0, overs: 0, wickets: 0, economy: 0, average: 0, strikeRate: 0 },
        death: { matches: 0, overs: 0, wickets: 0, economy: 0, average: 0, strikeRate: 0 }
      },
      phaseAnalysis: {
        powerplay: { overs: 0, runs: 0, wickets: 0, economy: 0, dotBallPercentage: 0 },
        middleOvers: { overs: 0, runs: 0, wickets: 0, economy: 0, dotBallPercentage: 0 },
        deathOvers: { overs: 0, runs: 0, wickets: 0, economy: 0, dotBallPercentage: 0 }
      },
      dismissalTypes: { caught: 0, bowled: 0, lbw: 0, stumped: 0, hitWicket: 0 },
      vsOpposition: [],
      vsVenues: [],
      homeAwayStats: {
        home: { matches: 0, overs: 0, wickets: 0, runs: 0, average: 0, economy: 0, strikeRate: 0 },
        away: { matches: 0, overs: 0, wickets: 0, runs: 0, average: 0, economy: 0, strikeRate: 0 }
      },
      deliveryAnalysis: {},
      situationalStats: {},
      wicketDistribution: [],
      recentForm: {},
      lastUpdated: new Date()
    };
  }

  /**
   * Process fielding statistics
   */
  private static processFieldingStats(performances: any[]): any {
    // Implementation for detailed fielding analytics
    return {
      totalCatches: 0,
      totalStumpings: 0,
      totalRunOuts: 0,
      totalFieldingDismissals: 0,
      fieldingSuccessRate: 0,
      formatStats: [],
      positionStats: [],
      vsOpposition: [],
      vsVenues: [],
      bestPerformances: [],
      impactStats: {},
      recentForm: {},
      lastUpdated: new Date()
    };
  }

  /**
   * Process advanced metrics
   */
  private static processAdvancedMetrics(performances: any[]): any {
    // Implementation for advanced metrics calculation
    return {
      consistencyIndex: {
        batting: 0,
        bowling: 0,
        overall: 0,
        calculation: { battingVariance: 0, bowlingVariance: 0, matchCount: 0 }
      },
      impactIndex: { batting: 0, bowling: 0, fielding: 0, overall: 0 },
      clutchScore: { batting: 0, bowling: 0, overall: 0, pressureMatches: 0 },
      playerValueIndex: { total: 0, battingContribution: 0, bowlingContribution: 0, fieldingContribution: 0 },
      formCurve: {
        current: 0,
        trend: "stable" as const,
        last5Average: 0,
        last10Average: 0,
        careerAverage: 0,
        peakForm: { rating: 0, period: "", matches: 0 }
      },
      matchImpact: {
        winContribution: 0,
        matchWinningPerformances: 0,
        matchLosingPerformances: 0,
        drawSavingPerformances: 0,
        averageImpactScore: 0,
        highImpactMatches: []
      },
      situationalMetrics: {
        homeAdvantage: { homePerformance: 0, awayPerformance: 0, advantage: 0 },
        formatAdaptability: { testRating: 0, odiRating: 0, t20Rating: 0, adaptabilityScore: 0 },
        oppositionStrength: { vsStrongTeams: 0, vsWeakTeams: 0, strengthIndex: 0 },
        matchPhase: { earlyCareer: 0, midCareer: 0, lateCareer: 0, careerProgression: 0 }
      },
      peerComparison: {},
      predictiveMetrics: {
        formMomentum: 0,
        injuryRisk: 0,
        careerTrajectory: "stable" as const,
        expectedPerformance: {
          nextMatch: { battingScore: 0, bowlingScore: 0, confidence: 0 },
          next5Matches: { averageBattingScore: 0, averageBowlingScore: 0, confidence: 0 }
        }
      },
      milestonePredictions: {
        nextMilestone: { type: "", target: 0, current: 0, estimatedMatches: 0, probability: 0 },
        careerProjections: { totalRuns: 0, totalWickets: 0, totalMatches: 0, confidence: 0 }
      },
      lastCalculated: new Date(),
      calculationVersion: "1.0"
    };
  }

  /**
   * Calculate format-specific stats
   */
  private static calculateFormatStats(format: string, performances: any[]): any {
    let runs = 0, wickets = 0, matches = 0;
    let totalBallsFaced = 0, totalBallsBowled = 0, totalRunsConceded = 0;
    let battingInnings = 0, bowlingInnings = 0, notOuts = 0;

    performances.forEach(perf => {
      matches++;
      if (perf.runs !== undefined) {
        runs += perf.runs;
        battingInnings++;
        if (perf.dismissal?.type === 'not_out') notOuts++;
        if (perf.ballsFaced) totalBallsFaced += perf.ballsFaced;
      }
      if (perf.wickets !== undefined) {
        wickets += perf.wickets;
        bowlingInnings++;
        if (perf.runsConceded) totalRunsConceded += perf.runsConceded;
        if (perf.overs) totalBallsBowled += perf.overs * 6;
      }
    });

    const dismissedInnings = battingInnings - notOuts;
    const average = dismissedInnings > 0 ? runs / dismissedInnings : runs;
    const strikeRate = totalBallsFaced > 0 ? (runs / totalBallsFaced) * 100 : 0;
    const economy = totalBallsBowled > 0 ? (totalRunsConceded / (totalBallsBowled / 6)) : 0;

    return {
      format,
      matches,
      runs,
      wickets,
      average: Math.round(average * 100) / 100,
      strikeRate: Math.round(strikeRate * 100) / 100,
      economy: Math.round(economy * 100) / 100
    };
  }

  /**
   * Calculate yearly stats
   */
  private static calculateYearlyStats(year: number, performances: any[]): any {
    let runs = 0, wickets = 0, matches = 0;
    let impactScore = 0;

    performances.forEach(perf => {
      matches++;
      if (perf.runs !== undefined) runs += perf.runs;
      if (perf.wickets !== undefined) wickets += perf.wickets;
      if (perf.impactScore) impactScore += perf.impactScore;
    });

    return {
      year,
      matches,
      runs,
      wickets,
      average: 0, // Calculate based on detailed logic
      strikeRate: 0,
      economy: 0,
      impactScore: matches > 0 ? impactScore / matches : 0
    };
  }

  /**
   * Recalculate all analytics
   */
  static async recalculateAllAnalytics(): Promise<void> {
    try {
      await Promise.all([
        this.calculateCareerAnalytics(),
        this.calculateBattingAnalytics(),
        this.calculateBowlingAnalytics(),
        this.calculateFieldingAnalytics(),
        this.calculateAdvancedMetrics()
      ]);
    } catch (error) {
      console.error('Error recalculating analytics:', error);
      throw error;
    }
  }
}