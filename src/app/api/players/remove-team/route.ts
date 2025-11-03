import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Player from '@/database/models/Player';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { teamName, teamLevel } = await request.json();

    // Get the active player
    const activePlayer = await Player.findOne({ isActive: true });
    if (!activePlayer) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active player found' 
      }, { status: 404 });
    }

    if (teamName && teamLevel) {
      // Remove specific team
      activePlayer.teams = activePlayer.teams.filter(
        team => !(team.name === teamName && team.level === teamLevel)
      );
    } else {
      // Remove all teams
      activePlayer.teams = [];
    }

    // Clear current team if it was removed
    if (!teamName || activePlayer.currentTeam === teamName) {
      activePlayer.currentTeam = undefined;
    }

    await activePlayer.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Team(s) removed successfully',
      player: activePlayer 
    });

  } catch (error) {
    console.error('Error removing player team:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to remove player team' 
    }, { status: 500 });
  }
}