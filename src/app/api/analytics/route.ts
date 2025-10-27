import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Performance from '@/database/models/Performance.model';
import Match from '@/database/models/Match.model';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const level = searchParams.get('level');
    
    // Build match filter
    const matchFilter: Record<string, string> = {};
    if (format && format !== 'all') {
      matchFilter.format = format;
    }
    if (level && level !== 'all') {
      matchFilter.level = level;
    }
    
    // Get matching matches
    const matches = await Match.find(matchFilter);
    const matchIds = matches.map(match => match._id);
    
    // Get performances for these matches
    const performances = await Performance.find({
      match: { $in: matchIds }
    }).populate('match');
    
    // Calculate overall statistics
    const totalMatches = matches.length;
    const totalRuns = performances.reduce((sum, p) => sum + (p.runs || 0), 0);
    const totalWickets = performances.reduce((sum, p) => sum + (p.wickets || 0), 0);
    const totalBallsFaced = performances.reduce((sum, p) => sum + (p.ballsFaced || 0), 0);
    const totalRunsConceded = performances.reduce((sum, p) => sum + (p.runsConceded || 0), 0);
    const totalOvers = performances.reduce((sum, p) => sum + (p.overs || 0), 0);
    
    const battingInnings = performances.filter(p => p.runs !== undefined && p.runs !== null).length;
    // const bowlingInnings = performances.filter(p => p.wickets !== undefined && p.wickets !== null).length;
    
    const battingAverage = battingInnings > 0 ? totalRuns / battingInnings : 0;
    const bowlingAverage = totalWickets > 0 ? totalRunsConceded / totalWickets : 0;
    const strikeRate = totalBallsFaced > 0 ? (totalRuns / totalBallsFaced) * 100 : 0;
    const economy = totalOvers > 0 ? totalRunsConceded / totalOvers : 0;
    
    // Format-wise statistics
    const formatStats = await Match.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'performances',
          localField: '_id',
          foreignField: 'match',
          as: 'performances'
        }
      },
      {
        $group: {
          _id: '$format',
          matches: { $sum: 1 },
          totalRuns: { $sum: { $sum: '$performances.runs' } },
          totalWickets: { $sum: { $sum: '$performances.wickets' } },
          avgRuns: { $avg: { $sum: '$performances.runs' } }
        }
      }
    ]);
    
    // Level-wise statistics
    const levelStats = await Match.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$level',
          matches: { $sum: 1 }
        }
      }
    ]);
    
    // Performance over time
    const performanceOverTime = await Performance.aggregate([
      { $match: { match: { $in: matchIds } } },
      {
        $lookup: {
          from: 'matches',
          localField: 'match',
          foreignField: '_id',
          as: 'matchInfo'
        }
      },
      { $unwind: '$matchInfo' },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$matchInfo.date' }
          },
          runs: { $sum: '$runs' },
          ballsFaced: { $sum: '$ballsFaced' },
          wickets: { $sum: '$wickets' }
        }
      },
      {
        $addFields: {
          date: '$_id',
          strikeRate: {
            $cond: {
              if: { $gt: ['$ballsFaced', 0] },
              then: { $multiply: [{ $divide: ['$runs', '$ballsFaced'] }, 100] },
              else: 0
            }
          }
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // Venue statistics
    const venueStats = await Match.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'performances',
          localField: '_id',
          foreignField: 'match',
          as: 'performances'
        }
      },
      {
        $group: {
          _id: '$venue',
          matches: { $sum: 1 },
          totalRuns: { $sum: { $sum: '$performances.runs' } },
          avgRuns: { $avg: { $sum: '$performances.runs' } }
        }
      },
      { $sort: { avgRuns: -1 } }
    ]);
    
    // Opponent statistics
    const opponentStats = await Match.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'performances',
          localField: '_id',
          foreignField: 'match',
          as: 'performances'
        }
      },
      {
        $group: {
          _id: '$opponent',
          matches: { $sum: 1 },
          totalRuns: { $sum: { $sum: '$performances.runs' } },
          avgRuns: { $avg: { $sum: '$performances.runs' } }
        }
      },
      { $sort: { avgRuns: -1 } }
    ]);
    
    const analyticsData = {
      totalMatches,
      totalRuns,
      totalWickets,
      battingAverage,
      bowlingAverage,
      strikeRate,
      economy,
      formatStats,
      levelStats,
      performanceOverTime,
      venueStats,
      opponentStats,
    };
    
    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}