import mongoose, { Schema, Document } from "mongoose";

export interface ITimeline extends Document {
  date: Date;
  event: string; // e.g. "Scored first Test century"
  match?: mongoose.Types.ObjectId;
  competition?: mongoose.Types.ObjectId;
}

const TimelineSchema = new Schema<ITimeline>(
  {
    date: { type: Date, required: true },
    event: { type: String, required: true },
    match: { type: Schema.Types.ObjectId, ref: "Match" },
    competition: { type: Schema.Types.ObjectId, ref: "Competition" },
  },
  { timestamps: true }
);

export default mongoose.models.Timeline || mongoose.model<ITimeline>("Timeline", TimelineSchema);
