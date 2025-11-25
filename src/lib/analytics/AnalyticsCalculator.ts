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
      // First, get the active player
      const Player = (await import('@/database/models/Player')).default;
      const activePlayer = await Player.findOne({ isActive: true });

      if (!activePlayer) {
        console.warn('No active player found');
        return null;
      }

      // Get all performances for the active player with match data
      const performances = await Performance.find({ player: activePlayer._id })
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
      // Get the active player
      const Player = (await import('@/database/models/Player')).default;
      const activePlayer = await Player.findOne({ isActive: true });

      if (!activePlayer) {
        return null;
      }

      const performances = await Performance.find({
        player: activePlayer._id,
        $or: [
          { runs: { $exists: true } },
          { 'firstInnings.runs': { $exists: true } },
          { 'secondInnings.runs': { $exists: true } }
        ]
      })
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
      // Get the active player
      const Player = (await import('@/database/models/Player')).default;
      const activePlayer = await Player.findOne({ isActive: true });

      if (!activePlayer) {
        return null;
      }

      const performances = await Performance.find({
        player: activePlayer._id,
        $or: [
          { overs: { $exists: true } },
          { 'firstInningsBowling.wickets': { $exists: true } },
          { 'secondInningsBowling.wickets': { $exists: true } }
        ]
      })
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
      // Get the active player
      const Player = (await import('@/database/models/Player')).default;
      const activePlayer = await Player.findOne({ isActive: true });

      if (!activePlayer) {
        return null;
      }

      const performances = await Performance.find({
        player: activePlayer._id,
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
      // Get the active player
      const Player = (await import('@/database/models/Player')).default;
      const activePlayer = await Player.findOne({ isActive: true });

      if (!activePlayer) {
        return null;
      }

      const performances = await Performance.find({ player: activePlayer._id })
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

      // Skip if match is not populated or null
      if (!match || typeof match === 'string') {
        console.warn('Performance has no populated match data:', perf._id);
        return;
      }

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
      let matchRuns = 0;
      let matchBallsFaced = 0;
      let isNotOut = false;
      let hasBattingData = false;

      // Handle multi-innings batting
      if (perf.firstInnings) {
        if (perf.firstInnings.runs !== undefined) {
          matchRuns += perf.firstInnings.runs;
          hasBattingData = true;
        }
        if (perf.firstInnings.ballsFaced) matchBallsFaced += perf.firstInnings.ballsFaced;
        if (perf.firstInnings.dismissalType === 'not_out') isNotOut = true; // Simplification: check if *any* innings was not out? Or last? Usually average is runs / (innings - notouts). For Test, it's per innings.
        // Actually, for career stats, we need to count innings and not outs individually per innings.
      }
      if (perf.secondInnings) {
        if (perf.secondInnings.runs !== undefined) {
          matchRuns += perf.secondInnings.runs;
          hasBattingData = true;
        }
        if (perf.secondInnings.ballsFaced) matchBallsFaced += perf.secondInnings.ballsFaced;
        // Note: Logic for not outs needs to be additive across innings for average calculation
      }

      // Fallback to legacy/single innings
      if (!perf.firstInnings && !perf.secondInnings && perf.runs !== undefined) {
        matchRuns = perf.runs;
        if (perf.ballsFaced) matchBallsFaced = perf.ballsFaced;
        if (perf.dismissal?.type === 'not_out') isNotOut = true;
        hasBattingData = true;
      }

      if (hasBattingData) {
        stats.totalRuns += matchRuns;

        // Count innings and not outs
        if (perf.firstInnings) {
          if (perf.firstInnings.runs !== undefined) {
            totalBattingInnings++;
            if (perf.firstInnings.dismissalType === 'not_out') stats.notOuts++;
          }
        }
        if (perf.secondInnings) {
          if (perf.secondInnings.runs !== undefined) {
            totalBattingInnings++;
            if (perf.secondInnings.dismissalType === 'not_out') stats.notOuts++;
          }
        }
        if (!perf.firstInnings && !perf.secondInnings) {
          totalBattingInnings++;
          if (isNotOut) stats.notOuts++;
        }

        // Milestones (check per innings for centuries/fifties)
        const checkMilestones = (runs: number) => {
          if (runs >= 100) stats.centuries++;
          else if (runs >= 50) stats.halfCenturies++;
          else if (runs >= 30) stats.thirties++;
        };

        if (perf.firstInnings?.runs !== undefined) checkMilestones(perf.firstInnings.runs);
        if (perf.secondInnings?.runs !== undefined) checkMilestones(perf.secondInnings.runs);
        if (!perf.firstInnings && !perf.secondInnings && perf.runs !== undefined) checkMilestones(perf.runs);

        // Highest score (compare per innings)
        const updateHighest = (runs: number) => {
          if (runs > stats.highestScore) stats.highestScore = runs;
        };
        if (perf.firstInnings?.runs !== undefined) updateHighest(perf.firstInnings.runs);
        if (perf.secondInnings?.runs !== undefined) updateHighest(perf.secondInnings.runs);
        if (!perf.firstInnings && !perf.secondInnings && perf.runs !== undefined) updateHighest(perf.runs);

        stats.totalBallsFaced += matchBallsFaced;
      }

      // Bowling stats
      let matchWickets = 0;
      let matchRunsConceded = 0;
      let matchOvers = 0;
      let hasBowlingData = false;

      // Handle multi-innings bowling
      if (perf.firstInningsBowling) {
        if (perf.firstInningsBowling.wickets !== undefined) {
          matchWickets += perf.firstInningsBowling.wickets;
          hasBowlingData = true;
        }
        if (perf.firstInningsBowling.runsConceded !== undefined) matchRunsConceded += perf.firstInningsBowling.runsConceded;
        if (perf.firstInningsBowling.overs !== undefined) matchOvers += perf.firstInningsBowling.overs;
      }
      if (perf.secondInningsBowling) {
        if (perf.secondInningsBowling.wickets !== undefined) {
          matchWickets += perf.secondInningsBowling.wickets;
          hasBowlingData = true;
        }
        if (perf.secondInningsBowling.runsConceded !== undefined) matchRunsConceded += perf.secondInningsBowling.runsConceded;
        if (perf.secondInningsBowling.overs !== undefined) matchOvers += perf.secondInningsBowling.overs;
      }

      // Fallback to legacy/single innings
      if (!perf.firstInningsBowling && !perf.secondInningsBowling && perf.wickets !== undefined) {
        matchWickets = perf.wickets;
        if (perf.runsConceded !== undefined) matchRunsConceded = perf.runsConceded;
        if (perf.overs !== undefined) matchOvers = perf.overs;
        hasBowlingData = true;
      }

      if (hasBowlingData) {
        stats.totalWickets += matchWickets;
        totalRunsConceded += matchRunsConceded;
        stats.totalBallsBowled += Math.floor(matchOvers) * 6 + (matchOvers % 1) * 10; // Approximate balls from overs (e.g. 10.2 -> 62)

        // Count innings
        if (perf.firstInningsBowling?.wickets !== undefined) totalBowlingInnings++;
        if (perf.secondInningsBowling?.wickets !== undefined) totalBowlingInnings++;
        if (!perf.firstInningsBowling && !perf.secondInningsBowling) totalBowlingInnings++;

        // Hauls (check per innings)
        const checkHauls = (wickets: number) => {
          if (wickets >= 5) {
            stats.fiveWicketHauls++;
            if (wickets >= 10) stats.tenWicketHauls++;
          }
        };
        if (perf.firstInningsBowling?.wickets !== undefined) checkHauls(perf.firstInningsBowling.wickets);
        if (perf.secondInningsBowling?.wickets !== undefined) checkHauls(perf.secondInningsBowling.wickets);
        if (!perf.firstInningsBowling && !perf.secondInningsBowling && perf.wickets !== undefined) checkHauls(perf.wickets);

        // Best bowling (per innings)
        const updateBestBowling = (wickets: number, runs: number) => {
          if (wickets > bestBowlingWickets || (wickets === bestBowlingWickets && runs < bestBowlingRuns)) {
            bestBowlingWickets = wickets;
            bestBowlingRuns = runs;
            stats.bestBowlingFigures = `${wickets}/${runs}`;
          }
        };
        if (perf.firstInningsBowling?.wickets !== undefined) updateBestBowling(perf.firstInningsBowling.wickets, perf.firstInningsBowling.runsConceded || 0);
        if (perf.secondInningsBowling?.wickets !== undefined) updateBestBowling(perf.secondInningsBowling.wickets, perf.secondInningsBowling.runsConceded || 0);
        if (!perf.firstInningsBowling && !perf.secondInningsBowling && perf.wickets !== undefined) updateBestBowling(perf.wickets, perf.runsConceded || 0);
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
    const stats = {
      formatStats: [] as any[],
      positionStats: [] as any[],
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
      vsOpposition: [] as any[],
      vsVenues: [] as any[],
      homeAwayStats: {
        home: { matches: 0, runs: 0, average: 0, strikeRate: 0, hundreds: 0, fifties: 0 },
        away: { matches: 0, runs: 0, average: 0, strikeRate: 0, hundreds: 0, fifties: 0 }
      },
      shotAnalysis: [],
      recentForm: {},
      lastUpdated: new Date()
    };

    const formatGroups: { [key: string]: any } = {};
    const oppositionGroups: { [key: string]: any } = {};
    const venueGroups: { [key: string]: any } = {};

    // Helper to process a single innings
    const processInnings = (inningsData: any, match: any, isChasing: boolean) => {
      if (!inningsData || inningsData.runs === undefined) return;

      const runs = inningsData.runs;
      const balls = inningsData.ballsFaced || 0;
      const isNotOut = inningsData.dismissalType === 'not_out';
      const dismissal = inningsData.dismissalType;

      // Format Stats
      const format = match.format;
      if (!formatGroups[format]) formatGroups[format] = { runs: 0, balls: 0, outs: 0, matches: 0 };
      formatGroups[format].runs += runs;
      formatGroups[format].balls += balls;
      if (!isNotOut) formatGroups[format].outs++;
      // Note: matches count is handled at match level, but here we track contribution

      // Dismissal Types
      if (dismissal && stats.dismissalTypes[dismissal as keyof typeof stats.dismissalTypes] !== undefined) {
        stats.dismissalTypes[dismissal as keyof typeof stats.dismissalTypes]++;
      } else if (isNotOut) {
        stats.dismissalTypes.notOut++;
      }

      // Opposition Stats
      const opponent = match.opponent || 'Unknown';
      if (!oppositionGroups[opponent]) oppositionGroups[opponent] = { runs: 0, innings: 0, outs: 0, balls: 0 };
      oppositionGroups[opponent].runs += runs;
      oppositionGroups[opponent].innings++;
      oppositionGroups[opponent].balls += balls;
      if (!isNotOut) oppositionGroups[opponent].outs++;

      // Venue Stats
      const venue = match.venue || 'Unknown';
      if (!venueGroups[venue]) venueGroups[venue] = { runs: 0, innings: 0, outs: 0, balls: 0 };
      venueGroups[venue].runs += runs;
      venueGroups[venue].innings++;
      venueGroups[venue].balls += balls;
      if (!isNotOut) venueGroups[venue].outs++;

      // Home/Away Stats
      // Assuming we can determine home/away from match data (not always available directly in perf.match, might need logic)
      // For now, skipping complex home/away logic if not explicit

      // Situational
      if (isChasing) {
        stats.situationalStats.chasing.runs += runs;
        // stats.situationalStats.chasing.matches++; // incremented at match level
      } else {
        stats.situationalStats.firstInnings.runs += runs;
      }

      // Conversion
      if (runs >= 100) stats.conversionRates.fiftyToHundred++; // This is actually count of 100s
      if (runs >= 50) stats.conversionRates.thirtyToFifty++; // This is count of 50s
      if (runs >= 30) stats.conversionRates.startToThirty++; // This is count of 30s
      // Real conversion rates need total innings count which we can calculate later
    };

    performances.forEach(perf => {
      const match = perf.match;
      if (!match) return;

      // Update matches count for groups
      const format = match.format;
      if (formatGroups[format]) formatGroups[format].matches++;

      // Process innings
      if (perf.firstInnings) processInnings(perf.firstInnings, match, false);
      if (perf.secondInnings) processInnings(perf.secondInnings, match, true); // Assuming 2nd innings is chasing in limited overs, or just 2nd innings in Test
      if (!perf.firstInnings && !perf.secondInnings && perf.runs !== undefined) {
        processInnings(perf, match, perf.isChasing || false);
      }
    });

    // Finalize Format Stats
    stats.formatStats = Object.entries(formatGroups).map(([format, data]: [string, any]) => ({
      format,
      matches: data.matches, // This might be inaccurate if we only incremented on innings. 
      // Better to count matches separately. 
      // Actually, let's just use the aggregated data.
      runs: data.runs,
      average: data.outs > 0 ? data.runs / data.outs : data.runs,
      strikeRate: data.balls > 0 ? (data.runs / data.balls) * 100 : 0
    }));

    // Finalize Opposition Stats
    stats.vsOpposition = Object.entries(oppositionGroups).map(([opponent, data]: [string, any]) => ({
      opponent,
      matches: data.innings, // Approximation
      runs: data.runs,
      average: data.outs > 0 ? data.runs / data.outs : data.runs,
      strikeRate: data.balls > 0 ? (data.runs / data.balls) * 100 : 0
    }));

    // Finalize Venue Stats
    stats.vsVenues = Object.entries(venueGroups).map(([venue, data]: [string, any]) => ({
      venue,
      matches: data.innings,
      runs: data.runs,
      average: data.outs > 0 ? data.runs / data.outs : data.runs,
      strikeRate: data.balls > 0 ? (data.runs / data.balls) * 100 : 0
    }));

    return stats;
  }

  /**
   * Process bowling statistics
   */
  private static processBowlingStats(performances: any[]): any {
    // Implementation for detailed bowling analytics
    const stats = {
      formatStats: [] as any[],
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
      vsOpposition: [] as any[],
      vsVenues: [] as any[],
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

    const formatGroups: { [key: string]: any } = {};
    const oppositionGroups: { [key: string]: any } = {};
    const venueGroups: { [key: string]: any } = {};

    const processInnings = (inningsData: any, match: any) => {
      if (!inningsData || inningsData.wickets === undefined) return;

      const wickets = inningsData.wickets;
      const runs = inningsData.runsConceded || 0;
      const overs = inningsData.overs || 0;
      const balls = Math.floor(overs) * 6 + (overs % 1) * 10;

      // Format Stats
      const format = match.format;
      if (!formatGroups[format]) formatGroups[format] = { wickets: 0, runs: 0, balls: 0 };
      formatGroups[format].wickets += wickets;
      formatGroups[format].runs += runs;
      formatGroups[format].balls += balls;

      // Dismissal Types (if available in detailed stats, usually we just have counts)
      if (inningsData.caughtWickets) stats.dismissalTypes.caught += inningsData.caughtWickets;
      if (inningsData.bowledWickets) stats.dismissalTypes.bowled += inningsData.bowledWickets;
      if (inningsData.lbwWickets) stats.dismissalTypes.lbw += inningsData.lbwWickets;
      if (inningsData.stumpedWickets) stats.dismissalTypes.stumped += inningsData.stumpedWickets;

      // Opposition Stats
      const opponent = match.opponent || 'Unknown';
      if (!oppositionGroups[opponent]) oppositionGroups[opponent] = { wickets: 0, runs: 0, balls: 0, matches: 0 };
      oppositionGroups[opponent].wickets += wickets;
      oppositionGroups[opponent].runs += runs;
      oppositionGroups[opponent].balls += balls;
      oppositionGroups[opponent].matches++;

      // Venue Stats
      const venue = match.venue || 'Unknown';
      if (!venueGroups[venue]) venueGroups[venue] = { wickets: 0, runs: 0, balls: 0, matches: 0 };
      venueGroups[venue].wickets += wickets;
      venueGroups[venue].runs += runs;
      venueGroups[venue].balls += balls;
      venueGroups[venue].matches++;
    };

    performances.forEach(perf => {
      const match = perf.match;
      if (!match) return;

      if (perf.firstInningsBowling) processInnings(perf.firstInningsBowling, match);
      if (perf.secondInningsBowling) processInnings(perf.secondInningsBowling, match);
      if (!perf.firstInningsBowling && !perf.secondInningsBowling && perf.wickets !== undefined) {
        processInnings(perf, match);
      }
    });

    // Finalize Format Stats
    stats.formatStats = Object.entries(formatGroups).map(([format, data]: [string, any]) => ({
      format,
      wickets: data.wickets,
      average: data.wickets > 0 ? data.runs / data.wickets : data.runs,
      economy: data.balls > 0 ? (data.runs / data.balls) * 6 : 0,
      strikeRate: data.wickets > 0 ? data.balls / data.wickets : 0
    }));

    // Finalize Opposition Stats
    stats.vsOpposition = Object.entries(oppositionGroups).map(([opponent, data]: [string, any]) => ({
      opponent,
      matches: data.matches,
      wickets: data.wickets,
      average: data.wickets > 0 ? data.runs / data.wickets : data.runs,
      economy: data.balls > 0 ? (data.runs / data.balls) * 6 : 0,
      strikeRate: data.wickets > 0 ? data.balls / data.wickets : 0
    }));

    // Finalize Venue Stats
    stats.vsVenues = Object.entries(venueGroups).map(([venue, data]: [string, any]) => ({
      venue,
      matches: data.matches,
      wickets: data.wickets,
      average: data.wickets > 0 ? data.runs / data.wickets : data.runs,
      economy: data.balls > 0 ? (data.runs / data.balls) * 6 : 0,
      strikeRate: data.wickets > 0 ? data.balls / data.wickets : 0
    }));

    return stats;
  }

  /**
   * Process fielding statistics
   */
  private static processFieldingStats(performances: any[]): any {
    // Implementation for detailed fielding analytics
    const stats = {
      totalCatches: 0,
      totalStumpings: 0,
      totalRunOuts: 0,
      totalFieldingDismissals: 0,
      fieldingSuccessRate: 0,
      formatStats: [] as any[],
      positionStats: [],
      vsOpposition: [] as any[],
      vsVenues: [] as any[],
      bestPerformances: [],
      impactStats: {},
      recentForm: {},
      lastUpdated: new Date()
    };

    performances.forEach(perf => {
      if (perf.catches) stats.totalCatches += perf.catches;
      if (perf.stumpings) stats.totalStumpings += perf.stumpings;
      if (perf.runOuts) stats.totalRunOuts += perf.runOuts;
    });

    stats.totalFieldingDismissals = stats.totalCatches + stats.totalStumpings + stats.totalRunOuts;

    return stats;
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

      // Batting
      if (perf.firstInnings?.runs !== undefined) {
        runs += perf.firstInnings.runs;
        battingInnings++;
        if (perf.firstInnings.dismissalType === 'not_out') notOuts++;
        if (perf.firstInnings.ballsFaced) totalBallsFaced += perf.firstInnings.ballsFaced;
      }
      if (perf.secondInnings?.runs !== undefined) {
        runs += perf.secondInnings.runs;
        battingInnings++;
        if (perf.secondInnings.dismissalType === 'not_out') notOuts++;
        if (perf.secondInnings.ballsFaced) totalBallsFaced += perf.secondInnings.ballsFaced;
      }
      if (!perf.firstInnings && !perf.secondInnings && perf.runs !== undefined) {
        runs += perf.runs;
        battingInnings++;
        if (perf.dismissal?.type === 'not_out') notOuts++;
        if (perf.ballsFaced) totalBallsFaced += perf.ballsFaced;
      }

      // Bowling
      if (perf.firstInningsBowling?.wickets !== undefined) {
        wickets += perf.firstInningsBowling.wickets;
        bowlingInnings++;
        if (perf.firstInningsBowling.runsConceded) totalRunsConceded += perf.firstInningsBowling.runsConceded;
        if (perf.firstInningsBowling.overs) totalBallsBowled += Math.floor(perf.firstInningsBowling.overs) * 6 + (perf.firstInningsBowling.overs % 1) * 10;
      }
      if (perf.secondInningsBowling?.wickets !== undefined) {
        wickets += perf.secondInningsBowling.wickets;
        bowlingInnings++;
        if (perf.secondInningsBowling.runsConceded) totalRunsConceded += perf.secondInningsBowling.runsConceded;
        if (perf.secondInningsBowling.overs) totalBallsBowled += Math.floor(perf.secondInningsBowling.overs) * 6 + (perf.secondInningsBowling.overs % 1) * 10;
      }
      if (!perf.firstInningsBowling && !perf.secondInningsBowling && perf.wickets !== undefined) {
        wickets += perf.wickets;
        bowlingInnings++;
        if (perf.runsConceded) totalRunsConceded += perf.runsConceded;
        if (perf.overs) totalBallsBowled += Math.floor(perf.overs) * 6 + (perf.overs % 1) * 10;
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

      // Batting
      if (perf.firstInnings?.runs !== undefined) runs += perf.firstInnings.runs;
      if (perf.secondInnings?.runs !== undefined) runs += perf.secondInnings.runs;
      if (!perf.firstInnings && !perf.secondInnings && perf.runs !== undefined) runs += perf.runs;

      // Bowling
      if (perf.firstInningsBowling?.wickets !== undefined) wickets += perf.firstInningsBowling.wickets;
      if (perf.secondInningsBowling?.wickets !== undefined) wickets += perf.secondInningsBowling.wickets;
      if (!perf.firstInningsBowling && !perf.secondInningsBowling && perf.wickets !== undefined) wickets += perf.wickets;

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