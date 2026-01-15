import mongoose, { Schema, Document } from "mongoose";

export interface ISeries extends Document {
    name: string;
    type: "bilateral" | "tri-series" | "tournament" | "league";
    format: "Test" | "ODI" | "T20" | "mixed" | "Youth ODI" | "Youth Test" | "Youth T20";
    level: "international" | "ipl" | "domestic" | "ranji" | "under19" | "list-a";
    startDate: Date;
    endDate?: Date;
    hostCountry: string;
    teams: string[];
    totalMatches: number;
    status: "upcoming" | "ongoing" | "completed";
    winner?: string;
    tournamentStructure?: {
        hasGroupStage: boolean;
        hasKnockout: boolean;
        groups?: { name: string; teams: string[] }[];
    };
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const SeriesSchema = new Schema<ISeries>(
    {
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["bilateral", "tri-series", "tournament", "league"],
            required: true,
        },
        format: {
            type: String,
            enum: ["Test", "ODI", "T20", "mixed", "Youth ODI", "Youth Test", "Youth T20"],
            required: true,
        },
        level: {
            type: String,
            enum: ["international", "ipl", "domestic", "ranji", "under19", "list-a"],
            required: true,
        },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        hostCountry: { type: String, required: true },
        teams: [{ type: String, required: true }],
        totalMatches: { type: Number, required: true, min: 1 },
        status: {
            type: String,
            enum: ["upcoming", "ongoing", "completed"],
            default: "upcoming",
        },
        winner: { type: String },
        tournamentStructure: {
            hasGroupStage: { type: Boolean, default: false },
            hasKnockout: { type: Boolean, default: false },
            groups: [
                {
                    name: { type: String },
                    teams: [{ type: String }],
                },
            ],
        },
        notes: { type: String },
    },
    { timestamps: true }
);

// Index for efficient querying
SeriesSchema.index({ startDate: -1 });
SeriesSchema.index({ format: 1, level: 1 });
SeriesSchema.index({ status: 1 });

export default mongoose.models.Series ||
    mongoose.model<ISeries>("Series", SeriesSchema);
