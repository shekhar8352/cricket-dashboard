import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Player from '@/database/models/Player';

export async function POST(request: NextRequest) {
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

    const currentDate = new Date();

    // Close all existing active teams
    activePlayer.teams.forEach(team => {
      if (!team.to) {
        team.to = currentDate;
      }
    });

    // Clear current team
    activePlayer.currentTeam = undefined;

    await activePlayer.save();

    return NextResponse.json({ 
      success: true, 
      message: 'All teams cleared successfully',
      player: activePlayer 
    });

  } catch (error) {
    console.error('Error clearing player teams:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear player teams',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}