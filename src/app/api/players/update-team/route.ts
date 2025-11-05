import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Player from '@/database/models/Player';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { teamName, teamLevel, startDate } = await request.json();

    if (!teamName || !teamLevel) {
      return NextResponse.json({ 
        success: false, 
        error: 'Team name and level are required' 
      }, { status: 400 });
    }

    // Get the active player
    const activePlayer = await Player.findOne({ isActive: true });
    if (!activePlayer) {
      return NextResponse.json({ 
        success: false, 
        error: 'No active player found' 
      }, { status: 404 });
    }

    const currentDate = startDate ? new Date(startDate) : new Date();

    // Check if player is already in this team
    const existingTeamIndex = activePlayer.teams.findIndex(
      team => team.name === teamName && team.level === teamLevel && !team.to
    );

    if (existingTeamIndex !== -1) {
      // Player is already in this team and it's active
      return NextResponse.json({ 
        success: true, 
        message: 'Player is already in this team',
        player: activePlayer 
      });
    }

    // Clear ALL existing teams (close all active teams)
    activePlayer.teams.forEach(team => {
      if (!team.to) {
        team.to = currentDate;
      }
    });

    // Add the new team
    activePlayer.teams.push({
      name: teamName,
      level: teamLevel,
      from: currentDate,
      to: undefined
    });

    // Update current team
    activePlayer.currentTeam = teamName;

    await activePlayer.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Player team updated successfully',
      player: activePlayer 
    });

  } catch (error) {
    console.error('Error updating player team:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update player team',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}