import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Match from '@/database/models/Match';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { id: matchId } = await params;
    
    // Update match
    const updatedMatch = await Match.findByIdAndUpdate(
      matchId,
      {
        ...body,
        date: new Date(body.date),
      },
      { new: true }
    );
    
    if (!updatedMatch) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, match: updatedMatch });
  } catch (error) {
    console.error('Error updating match:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update match' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: matchId } = await params;
    
    const deletedMatch = await Match.findByIdAndDelete(matchId);
    
    if (!deletedMatch) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Match deleted successfully' });
  } catch (error) {
    console.error('Error deleting match:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete match' },
      { status: 500 }
    );
  }
}