import { connectDB } from "@/database/mongoose";
import Series, { ISeries } from "@/lib/models/Series";
import { SeriesFormData, SeriesListItem } from "@/types";

/**
 * Get all series with optional filters
 */
export async function getAllSeries(filters?: {
    format?: string;
    level?: string;
    status?: string;
}): Promise<SeriesListItem[]> {
    await connectDB();

    const query: Record<string, unknown> = {};

    if (filters?.format) query.format = filters.format;
    if (filters?.level) query.level = filters.level;
    if (filters?.status) query.status = filters.status;

    const series = await Series.find(query)
        .sort({ startDate: 1 })
        .lean<any[]>();

    return series.map((s) => ({
        _id: s._id.toString(),
        name: s.name,
        type: s.type,
        format: s.format,
        level: s.level,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate?.toISOString(),
        hostCountry: s.hostCountry,
        teams: s.teams,
        totalMatches: s.totalMatches,
        status: s.status,
        winner: s.winner,
        notes: s.notes,
    }));
}

/**
 * Get a single series by ID
 */
export async function getSeriesById(id: string): Promise<SeriesListItem | null> {
    await connectDB();

    const series = await Series.findById(id).lean<any>();

    if (!series) return null;

    return {
        _id: series._id.toString(),
        name: series.name,
        type: series.type,
        format: series.format,
        level: series.level,
        startDate: series.startDate.toISOString(),
        endDate: series.endDate?.toISOString(),
        hostCountry: series.hostCountry,
        teams: series.teams,
        totalMatches: series.totalMatches,
        status: series.status,
        winner: series.winner,
        notes: series.notes,
    };
}

/**
 * Create a new series
 */
export async function createSeries(data: SeriesFormData): Promise<SeriesListItem> {
    await connectDB();

    const series = await Series.create({
        ...data,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
    });

    return {
        _id: series._id.toString(),
        name: series.name,
        type: series.type,
        format: series.format,
        level: series.level,
        startDate: series.startDate.toISOString(),
        endDate: series.endDate?.toISOString(),
        hostCountry: series.hostCountry,
        teams: series.teams,
        totalMatches: series.totalMatches,
        status: series.status,
        winner: series.winner,
        notes: series.notes,
    };
}

/**
 * Update a series
 */
export async function updateSeries(
    id: string,
    data: Partial<SeriesFormData>
): Promise<SeriesListItem | null> {
    await connectDB();

    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const series = await Series.findByIdAndUpdate(id, updateData, { new: true }).lean<any>();

    if (!series) return null;

    return {
        _id: series._id.toString(),
        name: series.name,
        type: series.type,
        format: series.format,
        level: series.level,
        startDate: series.startDate.toISOString(),
        endDate: series.endDate?.toISOString(),
        hostCountry: series.hostCountry,
        teams: series.teams,
        totalMatches: series.totalMatches,
        status: series.status,
        winner: series.winner,
        notes: series.notes,
    };
}

/**
 * Delete a series
 */
export async function deleteSeries(id: string): Promise<boolean> {
    await connectDB();

    const result = await Series.findByIdAndDelete(id);
    return !!result;
}
