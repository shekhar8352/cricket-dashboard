import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Player from '@/database/models/Player.model';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Check if there's already an active player
    const existingPlayer = await Player.findOne({ isActive: true });
    if (existingPlayer) {
      return NextResponse.json(
        { success: false, error: 'A player already exists. Only one player is allowed in this system.' },
        { status: 400 }
      );
    }

    // Create new player
    const player = new Player({
      ...body,
      dob: new Date(body.dob),
      careerStart: new Date(body.careerStart),
      careerEnd: body.careerEnd ? new Date(body.careerEnd) : undefined,
      isActive: true,
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

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { playerId, ...updateData } = body;

    // Only allow updates to specific fields (minor changes)
    const allowedUpdates = ['currentTeam', 'careerEnd', 'teams'];
    const updates: Record<string, unknown> = {};

    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = updateData[key];
      }
    });

    if (updates.careerEnd && typeof updates.careerEnd === 'string') {
      updates.careerEnd = new Date(updates.careerEnd);
    }

    const player = await Player.findByIdAndUpdate(
      playerId,
      updates,
      { new: true, runValidators: true }
    );

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, player });
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update player' },
      { status: 500 }
    );
  }
}