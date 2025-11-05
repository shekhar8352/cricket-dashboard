import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/database/mongoose';
import Series from '@/database/models/Series';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const data = await request.json();
    const seriesId = params.id;
    
    const series = await Series.findByIdAndUpdate(seriesId, data, { new: true });
    
    if (!series) {
      return NextResponse.json({ success: false, error: 'Series not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, series });
  } catch (error) {
    console.error('Error updating series:', error);
    return NextResponse.json({ success: false, error: 'Failed to update series' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const seriesId = params.id;
    
    const series = await Series.findById(seriesId).populate('matches');
    
    if (!series) {
      return NextResponse.json({ success: false, error: 'Series not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, series });
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch series' }, { status: 500 });
  }
}