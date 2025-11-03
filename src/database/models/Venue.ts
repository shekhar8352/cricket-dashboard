import mongoose, { Schema, Document } from "mongoose";

export interface IVenue extends Document {
  name: string;
  city: string;
  country: string;
  capacity?: number;
  
  // Venue characteristics
  pitchType?: "batting" | "bowling" | "balanced";
  averageScore?: {
    Test?: { first: number; second: number };
    ODI?: number;
    T20?: number;
  };
  
  // Weather patterns
  typicalWeather?: "sunny" | "cloudy" | "overcast" | "drizzle" | "rain";
  
  // Venue history
  firstMatch?: Date;
  totalMatches?: number;
  
  // Facilities
  floodlights?: boolean;
  roofed?: boolean;
  
  // Location details
  timezone?: string;
  altitude?: number; // in meters
  
  // Ground dimensions
  boundaries?: {
    straight: number;
    square: number;
  };
}

const VenueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    capacity: Number,
    
    // Venue characteristics
    pitchType: { type: String, enum: ["batting", "bowling", "balanced"] },
    averageScore: {
      Test: {
        first: Number,
        second: Number
      },
      ODI: Number,
      T20: Number
    },
    
    // Weather patterns
    typicalWeather: { type: String, enum: ["sunny", "cloudy", "overcast", "drizzle", "rain"] },
    
    // Venue history
    firstMatch: Date,
    totalMatches: { type: Number, default: 0 },
    
    // Facilities
    floodlights: { type: Boolean, default: false },
    roofed: { type: Boolean, default: false },
    
    // Location details
    timezone: String,
    altitude: Number,
    
    // Ground dimensions
    boundaries: {
      straight: Number,
      square: Number
    }
  },
  { timestamps: true }
);

// Ensure unique venue names per city
VenueSchema.index({ name: 1, city: 1 }, { unique: true });

export default mongoose.models.Venue || mongoose.model<IVenue>("Venue", VenueSchema);