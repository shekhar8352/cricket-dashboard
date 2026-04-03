import { NextRequest, NextResponse } from "next/server";
import {
    getCareerSummary,
    getFormatBreakdown,
    getTrendData,
    getOpponentStats,
    getVenueStats,
    getRecordCoverageStats,
    getVenueTypeOutcomeSplit,
    getMonthlyMatchVolume,
    getDismissalBreakdown,
    getTossCorrelationStats,
} from "@/lib/services/analytics.service";
import { AnalyticsFilters } from "@/types";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get("type") || "summary";

        // Parse filters from query params
        const filters: AnalyticsFilters = {
            format: searchParams.get("format") as AnalyticsFilters["format"] || undefined,
            level: searchParams.get("level") as AnalyticsFilters["level"] || undefined,
            opponent: searchParams.get("opponent") || undefined,
            series: searchParams.get("series") || undefined,
            startDate: searchParams.get("startDate") || undefined,
            endDate: searchParams.get("endDate") || undefined,
            venue: searchParams.get("venue") || undefined,
            venueType: searchParams.get("venueType") as AnalyticsFilters["venueType"] || undefined,
            homeAway: searchParams.get("homeAway") as AnalyticsFilters["homeAway"] || undefined,
        };

        let data;

        switch (type) {
            case "summary":
                data = await getCareerSummary(filters);
                break;
            case "format":
                data = await getFormatBreakdown(filters);
                break;
            case "trends":
                data = await getTrendData(filters);
                break;
            case "opponents":
                data = await getOpponentStats(filters);
                break;
            case "venues":
                data = await getVenueStats(filters);
                break;
            case "all":
                const [
                    summary,
                    formats,
                    trends,
                    opponents,
                    venues,
                    recordCoverage,
                    venueTypeOutcomes,
                    monthlyVolume,
                    dismissalBreakdown,
                    tossCorrelation,
                ] = await Promise.all([
                    getCareerSummary(filters),
                    getFormatBreakdown(filters),
                    getTrendData(filters),
                    getOpponentStats(filters),
                    getVenueStats(filters),
                    getRecordCoverageStats(filters),
                    getVenueTypeOutcomeSplit(filters),
                    getMonthlyMatchVolume(filters),
                    getDismissalBreakdown(filters),
                    getTossCorrelationStats(filters),
                ]);
                data = {
                    summary,
                    formats,
                    trends,
                    opponents,
                    venues,
                    recordCoverage,
                    venueTypeOutcomes,
                    monthlyVolume,
                    dismissalBreakdown,
                    tossCorrelation,
                };
                break;
            default:
                return NextResponse.json(
                    {
                        success: false,
                        error: "Invalid analytics type. Use: summary, format, trends, opponents, venues, or all",
                    },
                    { status: 400 }
                );
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch analytics" },
            { status: 500 }
        );
    }
}
