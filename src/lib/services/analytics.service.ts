import type { AnalyticsFilters } from "@/types";
import { loadCareer } from "@/lib/analytics/loader";
import {
    emptyCareerSummary,
    getAnalyticsTab,
    getHomeBundle,
    toCareerSummary,
    toFormatStats,
    toMonthlyVolume,
    toOpponentStats,
    toRecordCoverage,
    toToss,
    toVenueStats,
    toVenueTypeOutcomes,
} from "@/lib/analytics/assemble";
import { dismissalCounts } from "@/lib/analytics/detail";
import { toTrendPoints } from "@/lib/analytics/trends";
import type { AnalyticsTabId } from "@/lib/analytics/types";

export async function getCareerSummary(filters?: AnalyticsFilters) {
    const data = await loadCareer(filters);
    if (data.fielding.length === 0 && data.batting.length === 0) return emptyCareerSummary();
    return toCareerSummary(data);
}

export async function getFormatBreakdown(filters?: AnalyticsFilters) {
    const data = await loadCareer({ ...filters, format: undefined });
    return toFormatStats(data);
}

export async function getTrendData(filters?: AnalyticsFilters) {
    const data = await loadCareer(filters);
    return toTrendPoints(data);
}

export async function getOpponentStats(filters?: AnalyticsFilters) {
    const data = await loadCareer({ ...filters, opponent: undefined });
    return toOpponentStats(data);
}

export async function getVenueStats(filters?: AnalyticsFilters) {
    const data = await loadCareer({ ...filters, venue: undefined });
    return toVenueStats(data);
}

export async function getRecordCoverageStats(filters?: AnalyticsFilters) {
    const data = await loadCareer(filters);
    return toRecordCoverage(data);
}

export async function getVenueTypeOutcomeSplit(filters?: AnalyticsFilters) {
    const data = await loadCareer(filters);
    return toVenueTypeOutcomes(data);
}

export async function getMonthlyMatchVolume(filters?: AnalyticsFilters) {
    const data = await loadCareer(filters);
    return toMonthlyVolume(data);
}

export async function getDismissalBreakdown(filters?: AnalyticsFilters) {
    const data = await loadCareer(filters);
    return dismissalCounts(data.batting);
}

export async function getTossCorrelationStats(filters?: AnalyticsFilters) {
    const data = await loadCareer(filters);
    return toToss(data);
}

export async function getAnalyticsByTab(tab: AnalyticsTabId, filters?: AnalyticsFilters) {
    return getAnalyticsTab(tab, filters);
}

export async function getHomeDashboard() {
    return getHomeBundle();
}

export { emptyCareerSummary };
