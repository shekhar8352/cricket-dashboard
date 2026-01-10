import { NextRequest, NextResponse } from "next/server";
import {
    getSeriesById,
    updateSeries,
    deleteSeries,
} from "@/lib/services/series.service";
import { SeriesFormData } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const series = await getSeriesById(id);

        if (!series) {
            return NextResponse.json(
                { success: false, error: "Series not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: series });
    } catch (error) {
        console.error("Error fetching series:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch series" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body: Partial<SeriesFormData> = await request.json();

        const series = await updateSeries(id, body);

        if (!series) {
            return NextResponse.json(
                { success: false, error: "Series not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: series });
    } catch (error) {
        console.error("Error updating series:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update series" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const deleted = await deleteSeries(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "Series not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, message: "Series deleted" });
    } catch (error) {
        console.error("Error deleting series:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete series" },
            { status: 500 }
        );
    }
}
