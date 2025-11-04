import { NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Performance from '@/database/models/Performance';
import Player from '@/database/models/Player';

export async function GET() {
  try {
    await connectDB();
    
    // Get the active player
    const activePlayer = await Player.findOne({ isActive: true });
    if (!activePlayer) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active player found' 
      }, { status: 404 });
    }

    // Get all performances for the active player
    const performances = await Performance.find({ player: activePlayer._id })
      .populate('match')
      .exec();

    if (performances.length === 0) {
      return NextResponse.json({ 
        success: true, 
        comparison: null,
        message: 'No performance data available' 
      });
    }

    // Calculate format-wise comparison
    const formatStats = {
      test: { matches: 0, runs: 0, wickets: 0, ballsFaced: 0, oversBowled: 0, runsConceded: 0 },
      odi: { matches: 0, runs: 0, wickets: 0, ballsFaced: 0, oversBowled: 0, runsConceded: 0 },
      t20: { matches: 0, runs: 0, wickets: 0, ballsFaced: 0, oversBowled: 0, runsConceded: 0 }
    };

    // Calculate home/away comparison
    const homeAwayStats = {
      home: { matches: 0, runs: 0, wickets: 0, ballsFaced: 0, oversBowled: 0, runsConceded: 0 },
      away: { matches: 0, runs: 0, wickets: 0, ballsFaced: 0, oversBowled: 0, runsConceded: 0 }
    };

    // Calculate innings comparison
    const inningsStats = {
      firstInnings: { matches: 0, runs: 0, wickets: 0, ballsFaced: 0, wins: 0 },
      chasing: { matches: 0, runs: 0, wickets: 0, ballsFaced: 0, wins: 0 }
    };

    // Calculate yearly comparison
    const yearlyStats: { [key: number]: { 
      year: number; matches: number; runs: number; wickets: number; ballsFaced: number; oversBowled: number; runsConceded: number 
    } } = {};

    // Calculate opposition comparison
    const oppositionStats: { [key: string]: { 
      opponent: string; matches: number; runs: number; wickets: number; ballsFaced: number; oversBowled: number; runsConceded: number; wins: number 
    } } = {};

    // Calculate day/night comparison
    const dayNightStats = {
      day: { matches: 0, runs: 0, wickets: 0, ballsFaced: 0 },
      dayNight: { matches: 0, runs: 0, wickets: 0, ballsFaced: 0 }
    };

    // Process each performance
    performances.forEach((perf) => {
      const match = perf.match as { date: Date; format: string; homeAway?: string; opponent: string; dayNight?: boolean };
      const year = new Date(match.date).getFullYear();
      const format = match.format.toLowerCase();
      const homeAway = match.homeAway || 'home';
      const opponent = match.opponent;
      const innings = perf.innings || 1;
      const isDayNight = match.dayNight || false;

      // Format stats
      if (formatStats[format as keyof typeof formatStats]) {
        const formatStat = formatStats[format as keyof typeof formatStats];
        formatStat.matches++;
        formatStat.runs += perf.runs || 0;
        formatStat.wickets += perf.wickets || 0;
        formatStat.ballsFaced += perf.ballsFaced || 0;
        formatStat.oversBowled += perf.overs || 0;
        formatStat.runsConceded += perf.runsConceded || 0;
      }

      // Home/Away stats
      const homeAwayStat = homeAwayStats[homeAway as keyof typeof homeAwayStats];
      if (homeAwayStat) {
        homeAwayStat.matches++;
        homeAwayStat.runs += perf.runs || 0;
        homeAwayStat.wickets += perf.wickets || 0;
        homeAwayStat.ballsFaced += perf.ballsFaced || 0;
        homeAwayStat.oversBowled += perf.overs || 0;
        homeAwayStat.runsConceded += perf.runsConceded || 0;
      }

      // Innings stats
      const inningsStat = innings === 1 ? inningsStats.firstInnings : inningsStats.chasing;
      inningsStat.matches++;
      inningsStat.runs += perf.runs || 0;
      inningsStat.wickets += perf.wickets || 0;
      inningsStat.ballsFaced += perf.ballsFaced || 0;
      // Note: Win/loss tracking would need match result data

      // Yearly stats
      if (!yearlyStats[year]) {
        yearlyStats[year] = { 
          year, matches: 0, runs: 0, wickets: 0, ballsFaced: 0, oversBowled: 0, runsConceded: 0 
        };
      }
      yearlyStats[year].matches++;
      yearlyStats[year].runs += perf.runs || 0;
      yearlyStats[year].wickets += perf.wickets || 0;
      yearlyStats[year].ballsFaced += perf.ballsFaced || 0;
      yearlyStats[year].oversBowled += perf.overs || 0;
      yearlyStats[year].runsConceded += perf.runsConceded || 0;

      // Opposition stats
      if (!oppositionStats[opponent]) {
        oppositionStats[opponent] = { 
          opponent, matches: 0, runs: 0, wickets: 0, ballsFaced: 0, oversBowled: 0, runsConceded: 0, wins: 0 
        };
      }
      oppositionStats[opponent].matches++;
      oppositionStats[opponent].runs += perf.runs || 0;
      oppositionStats[opponent].wickets += perf.wickets || 0;
      oppositionStats[opponent].ballsFaced += perf.ballsFaced || 0;
      oppositionStats[opponent].oversBowled += perf.overs || 0;
      oppositionStats[opponent].runsConceded += perf.runsConceded || 0;

      // Day/Night stats
      const dayNightStat = isDayNight ? dayNightStats.dayNight : dayNightStats.day;
      dayNightStat.matches++;
      dayNightStat.runs += perf.runs || 0;
      dayNightStat.wickets += perf.wickets || 0;
      dayNightStat.ballsFaced += perf.ballsFaced || 0;
    });

    // Calculate averages and rates
    const calculateStats = (stat: { matches: number; runs: number; wickets: number; ballsFaced: number; oversBowled: number; runsConceded: number }) => ({
      matches: stat.matches,
      runs: stat.runs,
      wickets: stat.wickets,
      average: stat.runs > 0 && stat.matches > 0 ? stat.runs / Math.max(stat.matches - (stat.wickets > 0 ? 0 : 0), 1) : 0,
      strikeRate: stat.ballsFaced > 0 ? (stat.runs / stat.ballsFaced) * 100 : 0,
      economy: stat.oversBowled > 0 ? stat.runsConceded / stat.oversBowled : 0
    });

    const comparison = {
      formatComparison: {
        test: calculateStats(formatStats.test),
        odi: calculateStats(formatStats.odi),
        t20: calculateStats(formatStats.t20)
      },
      homeAwayComparison: {
        home: calculateStats(homeAwayStats.home),
        away: calculateStats(homeAwayStats.away)
      },
      inningsComparison: {
        firstInnings: {
          ...calculateStats(inningsStats.firstInnings),
        },
        chasing: {
          ...calculateStats(inningsStats.chasing),
          successRate: inningsStats.chasing.matches > 0 ? (inningsStats.chasing.wins / inningsStats.chasing.matches) * 100 : 0
        }
      },
      yearlyComparison: Object.values(yearlyStats).map((year) => ({
        ...calculateStats(year),
        year: year.year
      })).sort((a, b) => a.year - b.year),
      oppositionComparison: Object.values(oppositionStats).map((opp) => ({
        ...calculateStats(opp),
        opponent: opp.opponent,
        winRate: opp.matches > 0 ? (opp.wins / opp.matches) * 100 : 0
      })).sort((a, b) => b.matches - a.matches),
      dayNightComparison: {
        day: calculateStats(dayNightStats.day),
        dayNight: calculateStats(dayNightStats.dayNight)
      }
    };

    return NextResponse.json({ success: true, comparison });
  } catch (error) {
    console.error('Error fetching comparison analytics:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch comparison analytics' 
    }, { status: 500 });
  }
}