import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Performance from '@/database/models/Performance.model';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Calculate derived stats
    const performance: {
      match: string;
      runs?: number;
      ballsFaced?: number;
      fours?: number;
      sixes?: number;
      strikeRate?: number;
      dismissal?: {
        type: string;
        bowler?: string;
        fielder?: string;
      };
      overs?: number;
      maidens?: number;
      runsConceded?: number;
      wickets?: number;
      economy?: number;
      catches?: number;
      stumpings?: number;
      runOuts?: number;
    } = {
      match: body.matchId,
    };

    // Add batting stats if provided
    if (body.runs !== undefined || body.ballsFaced !== undefined) {
      performance.runs = body.runs || 0;
      performance.ballsFaced = body.ballsFaced || 0;
      performance.fours = body.fours || 0;
      performance.sixes = body.sixes || 0;
      
      // Calculate strike rate
      if (performance.ballsFaced && performance.ballsFaced > 0 && performance.runs !== undefined) {
        performance.strikeRate = (performance.runs / performance.ballsFaced) * 100;
      }
      
      // Add dismissal info if provided
      if (body.dismissalType) {
        performance.dismissal = {
          type: body.dismissalType,
          bowler: body.dismissalBowler,
          fielder: body.dismissalFielder,
        };
      }
    }

    // Add bowling stats if provided
    if (body.overs !== undefined || body.wickets !== undefined) {
      performance.overs = body.overs || 0;
      performance.maidens = body.maidens || 0;
      performance.runsConceded = body.runsConceded || 0;
      performance.wickets = body.wickets || 0;
      
      // Calculate economy rate
      if (performance.overs && performance.overs > 0 && performance.runsConceded !== undefined) {
        performance.economy = performance.runsConceded / performance.overs;
      }
    }

    // Add fielding stats if provided
    if (body.catches !== undefined || body.stumpings !== undefined || body.runOuts !== undefined) {
      performance.catches = body.catches || 0;
      performance.stumpings = body.stumpings || 0;
      performance.runOuts = body.runOuts || 0;
    }
    
    const newPerformance = new Performance(performance);
    await newPerformance.save();
    
    return NextResponse.json({ success: true, performance: newPerformance }, { status: 201 });
  } catch (error) {
    console.error('Error creating performance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create performance' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    const performances = await Performance.find({})
      .populate('match')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, performances });
  } catch (error) {
    console.error('Error fetching performances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performances' },
      { status: 500 }
    );
  }
}