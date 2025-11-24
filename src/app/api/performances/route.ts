import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Performance from '@/database/models/Performance';
import Player from '@/database/models/Player';
import Match from '@/database/models/Match';
import Series from '@/database/models/Series';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // 1. Get the active player
    const activePlayer = await Player.findOne({ isActive: true });
    if (!activePlayer) {
      return NextResponse.json(
        { success: false, error: 'No active player found. Please create a player first.' },
        { status: 400 }
      );
    }

    // 2. Validate Match
    if (!body.matchId) {
      return NextResponse.json(
        { success: false, error: 'Match ID is required' },
        { status: 400 }
      );
    }

    const match = await Match.findById(body.matchId);
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    // 3. Determine Team Represented and Level
    let teamRepresented = body.teamRepresented;
    let teamLevel = body.teamLevel || match.level;

    if (!teamRepresented) {
      // Try to derive from Series if match has one
      if (match.series) {
        // Find series by name (since match stores series name)
        const series = await Series.findOne({ name: match.series });
        if (series && series.teams) {
          // Assuming the player's team is the one that is NOT the opponent
          const opponentName = match.opponent;
          const playerTeam = series.teams.find((t: any) => t.name !== opponentName);
          if (playerTeam) {
            teamRepresented = playerTeam.name;
          }
        }
      }

      // Fallback: use player's current team or country if international
      if (!teamRepresented) {
        if (match.level === 'international') {
          teamRepresented = activePlayer.country;
        } else {
          teamRepresented = activePlayer.currentTeam || 'Unknown Team';
        }
      }
    }

    // Build comprehensive performance object
    const performance: Record<string, unknown> = {
      match: body.matchId,
      player: activePlayer._id,
      teamRepresented,
      teamLevel,
    };

    // Match context
    if (body.battingPosition !== undefined) performance.battingPosition = body.battingPosition;
    if (body.bowlingPosition !== undefined) performance.bowlingPosition = body.bowlingPosition;
    if (body.innings !== undefined) performance.innings = body.innings;
    if (body.isChasing !== undefined) performance.isChasing = body.isChasing;
    if (body.target !== undefined) performance.target = body.target;
    if (body.requiredRunRate !== undefined) performance.requiredRunRate = body.requiredRunRate;
    if (body.isCaptain !== undefined) performance.isCaptain = body.isCaptain;
    if (body.isWicketKeeper !== undefined) performance.isWicketKeeper = body.isWicketKeeper;
    if (body.fieldingPosition !== undefined) performance.fieldingPosition = body.fieldingPosition;

    // Batting performance
    if (body.runs !== undefined) performance.runs = body.runs;
    if (body.ballsFaced !== undefined) performance.ballsFaced = body.ballsFaced;
    if (body.fours !== undefined) performance.fours = body.fours;
    if (body.sixes !== undefined) performance.sixes = body.sixes;
    if (body.singles !== undefined) performance.singles = body.singles;
    if (body.twos !== undefined) performance.twos = body.twos;
    if (body.threes !== undefined) performance.threes = body.threes;
    if (body.dotBalls !== undefined) performance.dotBalls = body.dotBalls;

    // Batting phases
    if (body.powerplayRuns !== undefined) performance.powerplayRuns = body.powerplayRuns;
    if (body.powerplayBalls !== undefined) performance.powerplayBalls = body.powerplayBalls;
    if (body.middleOversRuns !== undefined) performance.middleOversRuns = body.middleOversRuns;
    if (body.middleOversBalls !== undefined) performance.middleOversBalls = body.middleOversBalls;
    if (body.deathOversRuns !== undefined) performance.deathOversRuns = body.deathOversRuns;
    if (body.deathOversBalls !== undefined) performance.deathOversBalls = body.deathOversBalls;

    // Calculate strike rate
    if (performance.ballsFaced && (performance.ballsFaced as number) > 0 && performance.runs !== undefined) {
      performance.strikeRate = ((performance.runs as number) / (performance.ballsFaced as number)) * 100;
    }

    // Dismissal details
    if (body.dismissalType || body.dismissalBowler || body.dismissalFielder) {
      performance.dismissal = {
        type: body.dismissalType,
        bowler: body.dismissalBowler,
        fielder: body.dismissalFielder,
        overNumber: body.dismissalOver,
        ballNumber: body.dismissalBall,
      };
    }

    // Bowling performance
    if (body.overs !== undefined) performance.overs = body.overs;
    if (body.maidens !== undefined) performance.maidens = body.maidens;
    if (body.runsConceded !== undefined) performance.runsConceded = body.runsConceded;
    if (body.wickets !== undefined) performance.wickets = body.wickets;
    if (body.dotBallsBowled !== undefined) performance.dotBallsBowled = body.dotBallsBowled;
    if (body.wides !== undefined) performance.wides = body.wides;
    if (body.noBalls !== undefined) performance.noBalls = body.noBalls;

    // Calculate bowling metrics
    if (performance.overs && (performance.overs as number) > 0) {
      if (performance.runsConceded !== undefined) {
        performance.economy = (performance.runsConceded as number) / (performance.overs as number);
      }
      if (performance.wickets !== undefined && (performance.wickets as number) > 0) {
        performance.bowlingAverage = (performance.runsConceded as number) / (performance.wickets as number);
        // Calculate balls bowled (assuming complete overs for simplicity)
        const overs = performance.overs as number;
        const ballsBowled = Math.floor(overs) * 6 + (overs % 1) * 10;
        performance.bowlingStrikeRate = ballsBowled / (performance.wickets as number);
      }
    }

    // Wicket types
    if (body.caughtWickets !== undefined || body.bowledWickets !== undefined ||
      body.lbwWickets !== undefined || body.stumpedWickets !== undefined) {
      performance.wicketTypes = {
        caught: body.caughtWickets || 0,
        bowled: body.bowledWickets || 0,
        lbw: body.lbwWickets || 0,
        stumped: body.stumpedWickets || 0,
        hitWicket: 0,
      };
    }

    // Fielding performance
    if (body.catches !== undefined) performance.catches = body.catches;
    if (body.stumpings !== undefined) performance.stumpings = body.stumpings;
    if (body.runOuts !== undefined) performance.runOuts = body.runOuts;

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