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
  teams: { name: string; level: string; from: Date; to?: Date }[];
}

const PlayerSchema = new Schema<IPlayer>(
  {
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    country: { type: String, required: true },
    role: { type: String, enum: ["batsman", "bowler", "allrounder", "wicketkeeper"], required: true },
    battingStyle: { type: String, required: true },
    bowlingStyle: { type: String },
    careerStart: { type: Date, required: true },
    careerEnd: { type: Date },
    teams: [
      {
        name: String,
        level: { type: String, enum: ["school", "domestic", "IPL", "international"] },
        from: Date,
        to: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);
