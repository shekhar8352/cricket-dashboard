import { NextRequest, NextResponse } from "next/server";
import {
    getMatchById,
    updateMatch,
    deleteMatch,
} from "@/lib/services/match.service";
import { MatchFormData } from "@/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const match = await getMatchById(id);

        if (!match) {
            return NextResponse.json(
                { success: false, error: "Match not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: match });
    } catch (error) {
        console.error("Error fetching match:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch match" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const body: Partial<MatchFormData> = await request.json();

        const match = await updateMatch(id, body);

        if (!match) {
            return NextResponse.json(
                { success: false, error: "Match not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: match });
    } catch (error) {
        console.error("Error updating match:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update match" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;
        const deleted = await deleteMatch(id);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "Match not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Match and associated performance deleted",
        });
    } catch (error) {
        console.error("Error deleting match:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete match" },
            { status: 500 }
        );
    }
}
