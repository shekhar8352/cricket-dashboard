import { NextRequest, NextResponse } from "next/server";
import { getAllSeries, createSeries } from "@/lib/services/series.service";
import { SeriesFormData } from "@/types";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filters = {
            format: searchParams.get("format") || undefined,
            level: searchParams.get("level") || undefined,
            status: searchParams.get("status") || undefined,
        };

        const series = await getAllSeries(filters);

        return NextResponse.json({ success: true, data: series });
    } catch (error) {
        console.error("Error fetching series:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch series" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: SeriesFormData = await request.json();

        // Basic validation
        if (!body.name || !body.type || !body.format || !body.level || !body.startDate || !body.hostCountry || !body.teams || !body.totalMatches) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const series = await createSeries(body);

        return NextResponse.json({ success: true, data: series }, { status: 201 });
    } catch (error) {
        console.error("Error creating series:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create series" },
            { status: 500 }
        );
    }
}
