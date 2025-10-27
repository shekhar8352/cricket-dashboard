import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Match from '@/database/models/Match.model';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Create new match
    const match = new Match({
      ...body,
      date: new Date(body.date),
    });
    
    await match.save();
    
    return NextResponse.json({ success: true, match }, { status: 201 });
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create match' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    const matches = await Match.find({}).sort({ date: -1 });
    
    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}