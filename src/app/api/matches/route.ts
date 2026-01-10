import { NextRequest, NextResponse } from "next/server";
import {
    getAllMatches,
    createMatch,
    getUniqueOpponents,
    getUniqueVenues,
} from "@/lib/services/match.service";
import { MatchFormData, MatchFilters } from "@/types";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Check for special endpoints
        const getOpponents = searchParams.get("getOpponents") === "true";
        const getVenues = searchParams.get("getVenues") === "true";

        if (getOpponents) {
            const opponents = await getUniqueOpponents();
            return NextResponse.json({ success: true, data: opponents });
        }

        if (getVenues) {
            const venues = await getUniqueVenues();
            return NextResponse.json({ success: true, data: venues });
        }

        // Regular match listing with filters
        const filters: MatchFilters = {
            format: searchParams.get("format") as MatchFilters["format"] || undefined,
            level: searchParams.get("level") as MatchFilters["level"] || undefined,
            opponent: searchParams.get("opponent") || undefined,
            series: searchParams.get("series") || undefined,
            result: searchParams.get("result") as MatchFilters["result"] || undefined,
            startDate: searchParams.get("startDate") || undefined,
            endDate: searchParams.get("endDate") || undefined,
            venue: searchParams.get("venue") || undefined,
        };

        const matches = await getAllMatches(filters);

        return NextResponse.json({ success: true, data: matches });
    } catch (error) {
        console.error("Error fetching matches:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch matches" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: MatchFormData = await request.json();

        // Basic validation
        if (
            !body.format ||
            !body.level ||
            !body.date ||
            !body.venue ||
            !body.city ||
            !body.country ||
            !body.opponent ||
            !body.teamRepresented
        ) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const match = await createMatch(body);

        return NextResponse.json({ success: true, data: match }, { status: 201 });
    } catch (error) {
        console.error("Error creating match:", error);
        return NextResponse.json(
            { success: false, error: "Failed to create match" },
            { status: 500 }
        );
    }
}
