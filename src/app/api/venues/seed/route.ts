import { NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Venue from '@/database/models/Venue';
import { worldCricketVenues } from '@/data/venues';

export async function POST() {
  try {
    await connectDB();
    
    // Clear existing venues
    await Venue.deleteMany({});
    
    // Insert all world cricket venues
    const venues = await Venue.insertMany(worldCricketVenues);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${venues.length} cricket venues`,
      count: venues.length 
    });
  } catch (error) {
    console.error('Error seeding venues:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed venues' 
    }, { status: 500 });
  }
}