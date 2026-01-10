import { NextRequest, NextResponse } from "next/server";
import { deletePerformance } from "@/lib/services/performance.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        const { id: matchId } = await context.params;
        const deleted = await deletePerformance(matchId);

        if (!deleted) {
            return NextResponse.json(
                { success: false, error: "Performance not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Performance deleted",
        });
    } catch (error) {
        console.error("Error deleting performance:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete performance" },
            { status: 500 }
        );
    }
}
