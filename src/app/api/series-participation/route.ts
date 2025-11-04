import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import SeriesParticipation from '@/database/models/SeriesParticipation';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    const seriesId = searchParams.get('seriesId');
    
    let query = {};
    if (playerId) query = { ...query, player: playerId };
    if (seriesId) query = { ...query, series: seriesId };
    
    const participations = await SeriesParticipation.find(query)
      .populate('player', 'fullName country role')
      .populate('series', 'name type format level')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, participations });
  } catch (error) {
    console.error('Error fetching series participations:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch participations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Check if participation already exists
    const existingParticipation = await SeriesParticipation.findOne({
      player: data.playerId,
      series: data.seriesId
    });
    
    if (existingParticipation) {
      // Update existing participation
      Object.assign(existingParticipation, {
        teamRepresented: data.teamRepresented,
        teamLevel: data.teamLevel,
        role: data.role,
        isCaptain: data.isCaptain,
        isViceCaptain: data.isViceCaptain,
        jerseyNumber: data.jerseyNumber,
        contractType: data.contractType,
        status: data.status || 'selected',
        notes: data.notes
      });
      
      await existingParticipation.save();
      return NextResponse.json({ success: true, participation: existingParticipation });
    } else {
      // Create new participation
      const participation = new SeriesParticipation({
        player: data.playerId,
        series: data.seriesId,
        teamRepresented: data.teamRepresented,
        teamLevel: data.teamLevel,
        role: data.role,
        isCaptain: data.isCaptain || false,
        isViceCaptain: data.isViceCaptain || false,
        jerseyNumber: data.jerseyNumber,
        contractType: data.contractType,
        status: data.status || 'selected',
        selectionDate: new Date(),
        notes: data.notes
      });
      
      await participation.save();
      return NextResponse.json({ success: true, participation });
    }
  } catch (error) {
    console.error('Error creating/updating series participation:', error);
    return NextResponse.json({ success: false, error: 'Failed to save participation' }, { status: 500 });
  }
}