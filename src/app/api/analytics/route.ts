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
    getAnalyticsByTab,
} from "@/lib/services/analytics.service";
import { AnalyticsFilters } from "@/types";
import type { AnalyticsTabId } from "@/lib/analytics/types";

const TABS = new Set<AnalyticsTabId>([
    "overview",
    "batting",
    "bowling",
    "fielding",
    "allround",
    "splits",
    "h2h",
    "trends",
]);

function readFilters(searchParams: URLSearchParams): AnalyticsFilters {
    const captain = searchParams.get("captain");
    const tier = searchParams.get("tier");
    return {
        format: (searchParams.get("format") as AnalyticsFilters["format"]) || undefined,
        level: (searchParams.get("level") as AnalyticsFilters["level"]) || undefined,
        opponent: searchParams.get("opponent") || undefined,
        series: searchParams.get("series") || undefined,
        startDate: searchParams.get("startDate") || undefined,
        endDate: searchParams.get("endDate") || undefined,
        venue: searchParams.get("venue") || undefined,
        venueType: (searchParams.get("venueType") as AnalyticsFilters["venueType"]) || undefined,
        homeAway: searchParams.get("homeAway") || undefined,
        year: searchParams.get("year") || undefined,
        result: (searchParams.get("result") as AnalyticsFilters["result"]) || undefined,
        captain: captain === "yes" || captain === "no" ? captain : undefined,
        tier: tier === "international" || tier === "domestic" || tier === "all" ? tier : undefined,
        dimension: searchParams.get("dimension") || undefined,
    };
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get("type") || "summary";
        const tab = searchParams.get("tab");
        const filters = readFilters(searchParams);

        if (tab) {
            if (!TABS.has(tab as AnalyticsTabId)) {
                return NextResponse.json(
                    { success: false, error: "Invalid analytics tab" },
                    { status: 400 }
                );
            }
            const data = await getAnalyticsByTab(tab as AnalyticsTabId, filters);
            return NextResponse.json({ success: true, data });
        }

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
