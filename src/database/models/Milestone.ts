import mongoose, { Schema, Document } from "mongoose";

export interface IMilestone extends Document {
  title: string; // e.g. "Test Debut", "100th ODI", "First 200"
  description?: string;
  date: Date;
  match?: mongoose.Types.ObjectId; // optional link to Match
  type: "debut" | "record" | "award" | "achievement";
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    title: { type: String, required: true },
    description: String,
    date: { type: Date, required: true },
    match: { type: Schema.Types.ObjectId, ref: "Match" },
    type: { type: String, enum: ["debut", "record", "award", "achievement"], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Milestone || mongoose.model<IMilestone>("Milestone", MilestoneSchema);
