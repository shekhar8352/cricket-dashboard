import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
    series?: mongoose.Types.ObjectId;
    format: "Test" | "ODI" | "T20" | "First-class" | "List-A" | "T20-domestic";
    level: "international" | "ipl" | "domestic" | "ranji" | "under19" | "list-a" | "club";
    date: Date;
    venue: string;
    city: string;
    country?: string;
    opponent: string;
    teamRepresented?: string;
    venueType?: "home" | "away" | "neutral";
    result?: "won" | "lost" | "draw" | "tie" | "no_result";
    resultMargin?: string;
    pitchType?: "batting" | "bowling" | "balanced" | "green" | "dusty" | "hard" | "flat" | "dry" | "damp";
    weatherCondition?: "sunny" | "overcast" | "rainy" | "humid" | "windy";
    tossWinner?: string;
    tossDecision?: "bat" | "bowl";
    matchType?: "group" | "knockout" | "final" | "regular";
    createdAt: Date;
    updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
    {
        series: { type: Schema.Types.ObjectId, ref: "Series" },
        format: {
            type: String,
            enum: ["Test", "ODI", "T20", "First-class", "List-A", "T20-domestic", "Youth ODI", "Youth Test", "Youth T20"],
            required: true,
        },
        level: {
            type: String,
            enum: ["international", "ipl", "domestic", "ranji", "under19", "list-a", "club"],
            required: true,
        },
        date: { type: Date, required: true },
        venue: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String },
        opponent: { type: String, required: true },
        teamRepresented: { type: String },
        venueType: {
            type: String,
            enum: ["home", "away", "neutral"],
        },
        result: {
            type: String,
            enum: ["won", "lost", "draw", "tie", "no_result"],
        },
        resultMargin: { type: String },
        pitchType: {
            type: String,
            enum: ["green", "dusty", "hard", "flat", "dry", "damp"],
        },
        weatherCondition: {
            type: String,
            enum: ["sunny", "overcast", "rainy", "humid", "windy"],
        },
        tossWinner: { type: String },
        tossDecision: {
            type: String,
            enum: ["bat", "bowl"],
        },
        matchType: {
            type: String,
            enum: ["group", "knockout", "final", "regular"],
        },
    },
    { timestamps: true }
);

// Indexes for efficient filtering
MatchSchema.index({ date: -1 });
MatchSchema.index({ format: 1 });
MatchSchema.index({ opponent: 1 });
MatchSchema.index({ series: 1 });
MatchSchema.index({ result: 1 });
MatchSchema.index({ venue: 1, city: 1, country: 1 });

export default mongoose.models.Match ||
    mongoose.model<IMatch>("Match", MatchSchema);
