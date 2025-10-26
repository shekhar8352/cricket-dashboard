import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Player from '@/database/models/Player.model';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Create new player
    const player = new Player({
      ...body,
      dob: new Date(body.dob),
      careerStart: new Date(body.careerStart),
      careerEnd: body.careerEnd ? new Date(body.careerEnd) : undefined,
    });
    
    await player.save();
    
    return NextResponse.json({ success: true, player }, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    
    const players = await Player.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, players });
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}