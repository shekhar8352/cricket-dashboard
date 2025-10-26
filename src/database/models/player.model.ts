import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
  fullName: string;
  dob: Date;
  country: string;
  role: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
  battingStyle: string;
  bowlingStyle?: string;
  careerStart: Date;
  careerEnd?: Date;
  currentTeam?: string;
  teams: { name: string; level: string; from: Date; to?: Date }[];
  isActive: boolean;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    fullName: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    country: { type: String, required: true },
    role: { type: String, enum: ["batsman", "bowler", "allrounder", "wicketkeeper"], required: true },
    battingStyle: { type: String, required: true },
    bowlingStyle: { type: String },
    careerStart: { type: Date, required: true },
    careerEnd: { type: Date },
    currentTeam: { type: String },
    teams: [
      {
        name: String,
        level: { type: String, enum: ["school", "domestic", "Ranji", "IPL", "international"] },
        from: Date,
        to: Date,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Ensure only one active player at a time
PlayerSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);
