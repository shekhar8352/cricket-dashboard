import { NextRequest, NextResponse } from "next/server";
import {
    upsertPerformance,
    getPerformanceByMatchId,
} from "@/lib/services/performance.service";
import { PerformanceFormData } from "@/types";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const matchId = searchParams.get("matchId");

        if (!matchId) {
            return NextResponse.json(
                { success: false, error: "matchId is required" },
                { status: 400 }
            );
        }

        const performance = await getPerformanceByMatchId(matchId);

        if (!performance) {
            return NextResponse.json(
                { success: false, error: "Performance not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: performance });
    } catch (error) {
        console.error("Error fetching performance:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch performance" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: PerformanceFormData = await request.json();

        // Basic validation
        if (!body.matchId) {
            return NextResponse.json(
                { success: false, error: "matchId is required" },
                { status: 400 }
            );
        }

        const performance = await upsertPerformance(body);

        return NextResponse.json(
            { success: true, data: performance },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating performance:", error);
        const message =
            error instanceof Error ? error.message : "Failed to create performance";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
