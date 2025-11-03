import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Venue from '@/database/models/Venue';

export async function GET() {
  try {
    await connectDB();
    const venues = await Venue.find().sort({ country: 1, city: 1, name: 1 });
    return NextResponse.json({ success: true, venues });
  } catch (error) {
    console.error('Error fetching venues:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch venues' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();
    
    const venue = new Venue(data);
    await venue.save();
    
    return NextResponse.json({ success: true, venue });
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json({ success: false, error: 'Failed to create venue' }, { status: 500 });
  }
}