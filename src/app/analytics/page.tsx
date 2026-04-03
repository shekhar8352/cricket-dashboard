"use client";

import { useState, useEffect } from "react";
import { Card, StatCard } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader, SectionHeader } from "@/components/ui/SectionHeader";
import {
    RunsOverTimeChart,
    AverageTrendChart,
    StrikeRateTrendChart,
    EconomyTrendChart,
    WicketsChart,
    FormatBreakdownChart,
    OpponentStatsChart,
    WinLossChart,
    DismissalBreakdownChart,
    TossAnalysisChart,
    MonthlyMatchVolumeChart,
    VenueTypeOutcomeChart,
    TopVenuesChart,
} from "@/components/charts";
import { MATCH_FORMATS, MATCH_LEVELS } from "@/lib/constants";
import {
    CareerSummary,
    FormatStats,
    TrendDataPoint,
    OpponentStats,
    AnalyticsFilters,
    VenueStats,
    RecordCoverageStats,
    VenueTypeOutcomeRow,
    MonthlyMatchVolume,
    DismissalBreakdownItem,
    TossCorrelationStats,
} from "@/types";
import { formatBattingScore, formatBowlingFigures } from "@/lib/utils";
import { Filter, X, Calendar, Layers, Trophy } from "lucide-react";

export default function AnalyticsPage() {
    const [summary, setSummary] = useState<CareerSummary | null>(null);
    const [formats, setFormats] = useState<FormatStats[]>([]);
    const [trends, setTrends] = useState<TrendDataPoint[]>([]);
    const [opponents, setOpponents] = useState<OpponentStats[]>([]);
    const [venues, setVenues] = useState<VenueStats[]>([]);
    const [recordCoverage, setRecordCoverage] = useState<RecordCoverageStats | null>(null);
    const [venueTypeOutcomes, setVenueTypeOutcomes] = useState<VenueTypeOutcomeRow[]>([]);
    const [monthlyVolume, setMonthlyVolume] = useState<MonthlyMatchVolume[]>([]);
    const [dismissalBreakdown, setDismissalBreakdown] = useState<DismissalBreakdownItem[]>([]);
    const [tossCorrelation, setTossCorrelation] = useState<TossCorrelationStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<AnalyticsFilters>({});
    const [showFilters, setShowFilters] = useState(true);
    
    // Pagination for opponents table
    const [opponentPage, setOpponentPage] = useState(1);
    const [opponentItemsPerPage, setOpponentItemsPerPage] = useState(5);

    useEffect(() => {
        fetchAnalytics();
    }, [filters]);

    const fetchAnalytics = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            params.set("type", "all");
            if (filters.format) params.set("format", filters.format);
            if (filters.level) params.set("level", filters.level);
            if (filters.opponent) params.set("opponent", filters.opponent);
            if (filters.series) params.set("series", filters.series);
            if (filters.venue) params.set("venue", filters.venue);
            if (filters.venueType) params.set("venueType", filters.venueType);
            if (filters.homeAway) params.set("homeAway", filters.homeAway);
            if (filters.startDate) params.set("startDate", filters.startDate);
            if (filters.endDate) params.set("endDate", filters.endDate);

            const res = await fetch(`/api/analytics?${params.toString()}`, {
                cache: "no-store",
            });
            const data = await res.json();

            if (data.success) {
                setSummary(data.data.summary);
                setFormats(data.data.formats);
                setTrends(data.data.trends);
                setOpponents(data.data.opponents);
                setVenues(data.data.venues ?? []);
                setRecordCoverage(data.data.recordCoverage ?? null);
                setVenueTypeOutcomes(data.data.venueTypeOutcomes ?? []);
                setMonthlyVolume(data.data.monthlyVolume ?? []);
                setDismissalBreakdown(data.data.dismissalBreakdown ?? []);
                setTossCorrelation(data.data.tossCorrelation ?? null);
            }
        } catch (err) {
            console.error("Error fetching analytics:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value || undefined,
        }));
    };

    const clearFilters = () => {
        setFilters({});
    };

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="space-y-10 pb-12">
            <PageHeader
                eyebrow="Insights"
                title="Analytics"
                description="Filter by format, level, and dates. Charts use subtle scales and axis labels so you can read trends at a glance."
                action={
                    <button
                        type="button"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                            showFilters
                                ? "border-border bg-card text-foreground"
                                : "border-primary/30 bg-primary/10 text-foreground hover:bg-primary/15"
                        }`}
                    >
                        <Filter size={18} strokeWidth={1.75} aria-hidden />
                        {showFilters ? "Hide filters" : "Filters"}
                        {activeFilterCount > 0 ? (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary/25 px-1.5 font-mono text-[10px] font-semibold text-foreground">
                                {activeFilterCount}
                            </span>
                        ) : null}
                    </button>
                }
            />

            {showFilters && (
                <Card className="p-0 overflow-hidden border-border/70">
                    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-5 sm:gap-6 sm:p-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <Trophy size={12} strokeWidth={1.75} aria-hidden /> Format
                            </label>
                            <select
                                value={filters.format || ""}
                                onChange={(e) => handleFilterChange("format", e.target.value)}
                                className="h-11 w-full cursor-pointer rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="" className="bg-card">All formats</option>
                                {MATCH_FORMATS.map((format) => (
                                    <option key={format} value={format} className="bg-card">
                                        {format}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <Layers size={12} strokeWidth={1.75} aria-hidden /> Level
                            </label>
                            <select
                                value={filters.level || ""}
                                onChange={(e) => handleFilterChange("level", e.target.value)}
                                className="h-11 w-full cursor-pointer rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <option value="" className="bg-card">All levels</option>
                                {MATCH_LEVELS.map((level) => (
                                    <option key={level} value={level} className="bg-card">
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <Calendar size={12} strokeWidth={1.75} aria-hidden /> From
                            </label>
                            <input
                                type="date"
                                value={filters.startDate || ""}
                                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <Calendar size={12} strokeWidth={1.75} aria-hidden /> To
                            </label>
                            <input
                                type="date"
                                value={filters.endDate || ""}
                                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={clearFilters}
                                disabled={activeFilterCount === 0}
                                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm font-semibold text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                            >
                                <X size={16} strokeWidth={1.75} aria-hidden /> Clear
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {isLoading ? (
                <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
                    <div
                        className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary"
                        role="status"
                        aria-label="Loading"
                    />
                    <p className="text-xs font-medium text-muted-foreground">Updating charts…</p>
                </div>
            ) : !summary || summary.matches === 0 ? (
                <Card className="p-10 text-center">
                    <p className="text-muted-foreground">
                        No performance data matches these filters. Try clearing filters or widening the date range.
                    </p>
                </Card>
            ) : (
                <>
                    <div className="space-y-4">
                        <SectionHeader
                            eyebrow="Summary"
                            title="Career snapshot"
                            description="Headline numbers for the current filter selection."
                        />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 sm:gap-5">
                            <StatCard title="Matches" value={summary.matches} icon="🏏" />
                            <StatCard
                                title="Runs"
                                value={summary.runs.toLocaleString()}
                                subtitle={`Avg: ${summary.battingAverage ?? "-"}`}
                                icon="🏃"
                            />
                            <StatCard
                                title="Highest"
                                value={formatBattingScore(
                                    summary.highestScore.runs,
                                    summary.highestScore.isNotOut
                                )}
                                icon="⭐"
                            />
                            <StatCard
                                title="Wickets"
                                value={summary.wickets}
                                subtitle={`Avg: ${summary.bowlingAverage ?? "-"}`}
                                icon="🎯"
                            />
                            <StatCard
                                title="Best Bowling"
                                value={formatBowlingFigures(
                                    summary.bestBowling.wickets,
                                    summary.bestBowling.runs
                                )}
                                icon="🔥"
                            />
                            <StatCard title="Catches" value={summary.catches} icon="🧤" />
                        </div>
                    </div>

                    {recordCoverage && recordCoverage.totalMatches > 0 && (
                        <div className="space-y-3">
                            <SectionHeader
                                eyebrow="Quality"
                                title="Record coverage"
                                description="How complete your match log is for the current filters (all matches vs rows with performance and series links)."
                            />
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                                <div className="glass-card rounded-lg px-4 py-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Matches in filter
                                    </p>
                                    <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
                                        {recordCoverage.totalMatches}
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {recordCoverage.withPerformance} with a performance card (
                                        {recordCoverage.pctWithPerformance}%)
                                    </p>
                                </div>
                                <div className="glass-card rounded-lg px-4 py-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Performance gap
                                    </p>
                                    <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
                                        {recordCoverage.withoutPerformance}
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        Matches without stats — add performance to tighten analytics.
                                    </p>
                                </div>
                                <div className="glass-card rounded-lg px-4 py-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Series tagged
                                    </p>
                                    <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
                                        {recordCoverage.pctSeriesTagged}%
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {recordCoverage.withSeries} of {recordCoverage.totalMatches} matches linked to a
                                        series.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <SectionHeader
                            title="Match volume by month"
                            description="How many recorded matches you played each month over your full career (for the current filters)."
                        />
                        <MonthlyMatchVolumeChart data={monthlyVolume} />
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        <div className="space-y-3">
                            <SectionHeader
                                title="Home vs away results"
                                description="Wins, losses, and other results by venue type."
                            />
                            <VenueTypeOutcomeChart data={venueTypeOutcomes} />
                        </div>
                        <div className="space-y-3">
                            <SectionHeader
                                title="Top grounds"
                                description="Where you have played the most matches in this filter."
                            />
                            <TopVenuesChart data={venues} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 sm:gap-4">
                        {[
                            { label: "Innings", value: summary.innings },
                            { label: "50s", value: summary.fifties },
                            { label: "100s", value: summary.centuries },
                            { label: "SR", value: summary.strikeRate },
                            { label: "Econ", value: summary.economy },
                            { label: "5W", value: summary.fiveWicketHauls },
                            { label: "Fours", value: summary.fours },
                            { label: "Sixes", value: summary.sixes },
                            { label: "Win %", value: `${summary.winPercentage}%` },
                        ].map((stat, i) => (
                            <div
                                key={i}
                                className="glass-card flex flex-col items-center justify-center rounded-lg px-3 py-3.5 text-center sm:py-4"
                            >
                                <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    {stat.label}
                                </span>
                                <span className="font-mono text-lg font-semibold tabular-nums text-foreground sm:text-xl">
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        <div className="space-y-3">
                            <SectionHeader
                                title="Runs over time"
                                description="Per-match runs vs cumulative career total (right axis)."
                            />
                            {trends.length > 0 && <RunsOverTimeChart data={trends} />}
                        </div>
                        <div className="space-y-3">
                            <SectionHeader
                                title="Batting average"
                                description="Running average after each innings with a match index on the horizontal axis."
                            />
                            {trends.length > 0 && <AverageTrendChart data={trends} />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        <div className="space-y-3">
                            <SectionHeader
                                title="Strike rate trend"
                                description="How your scoring tempo evolves across your career sequence."
                            />
                            {trends.length > 0 && <StrikeRateTrendChart data={trends} />}
                        </div>
                        <div className="space-y-3">
                            <SectionHeader
                                title="Economy trend"
                                description="Running economy — lower is generally tighter bowling."
                            />
                            {trends.length > 0 && <EconomyTrendChart data={trends} />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        <div className="space-y-3">
                            <SectionHeader
                                title="Vs opponents"
                                description="Runs and wickets (×10 scale) for your top opponents."
                            />
                            {opponents.length > 0 && <OpponentStatsChart data={opponents} />}
                        </div>
                        <div className="space-y-3">
                            <SectionHeader
                                title="Wickets by match"
                                description="Wicket count per completed match in chronological order."
                            />
                            {trends.length > 0 && <WicketsChart data={trends} />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="space-y-3">
                            <SectionHeader title="Match results" description="Outcome mix for the filtered dataset." />
                            {summary && (
                                <WinLossChart
                                    won={summary.matchesWon}
                                    lost={summary.matchesLost}
                                    draw={summary.matchesDrawn}
                                    tie={0} // TODO: Add tie to summary if needed
                                    noResult={summary.matches - (summary.matchesWon + summary.matchesLost + summary.matchesDrawn)}
                                />
                            )}
                        </div>
                        <div className="space-y-3">
                            <SectionHeader
                                title="Dismissals"
                                description="Dismissed batting innings only (not outs excluded)."
                            />
                            <DismissalBreakdownChart data={dismissalBreakdown} />
                        </div>
                        <div className="space-y-3">
                            <SectionHeader
                                title="Toss impact"
                                description="Won/lost matches only; compares toss winner to your team on the scorecard."
                            />
                            <TossAnalysisChart
                                data={
                                    tossCorrelation ?? {
                                        wonTossWonMatch: 0,
                                        wonTossLostMatch: 0,
                                        lostTossWonMatch: 0,
                                        lostTossLostMatch: 0,
                                    }
                                }
                            />
                            {tossCorrelation &&
                                (tossCorrelation.excludedNoTossOrSide > 0 ||
                                    tossCorrelation.excludedNonDecisiveResult > 0) && (
                                    <p className="text-xs text-muted-foreground">
                                        Excluded from chart:{" "}
                                        {[
                                            tossCorrelation.excludedNoTossOrSide > 0
                                                ? `${tossCorrelation.excludedNoTossOrSide} without toss or team`
                                                : null,
                                            tossCorrelation.excludedNonDecisiveResult > 0
                                                ? `${tossCorrelation.excludedNonDecisiveResult} draw / tie / no result`
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join("; ")}
                                        .
                                    </p>
                                )}
                        </div>
                    </div>

                    {/* Format Statistics Table */}
                    {formats.length > 0 && (
                        <div className="space-y-3">
                            <SectionHeader title="By format" description="Batting and bowling columns side by side." />
                            <Card className="overflow-hidden p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30">
                                                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Format</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Mat</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Inn</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Runs</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Avg</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">SR</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">50/100</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Wkts</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Bowl Avg</th>
                                                <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Econ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {formats.map((f) => (
                                                <tr key={f.format} className="transition-colors hover:bg-muted/20">
                                                    <td className="px-4 py-3.5 font-semibold text-foreground sm:px-6">{f.format}</td>
                                                    <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.matches}</td>
                                                    <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.innings}</td>
                                                    <td className="px-4 py-3.5 text-center font-mono font-semibold tabular-nums text-primary sm:px-6">{f.runs}</td>
                                                    <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.battingAverage ?? "-"}</td>
                                                    <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.strikeRate}</td>
                                                    <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.fifties}/{f.centuries}</td>
                                                    <td className="px-4 py-3.5 text-center font-mono font-semibold tabular-nums text-accent-foreground sm:px-6">{f.wickets}</td>
                                                    <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.bowlingAverage ?? "-"}</td>
                                                    <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.economy}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Opponent Statistics Table */}
                    {opponents.length > 0 && (() => {
                        const opponentTotalPages = Math.ceil(opponents.length / opponentItemsPerPage);
                        const opponentStartIndex = (opponentPage - 1) * opponentItemsPerPage;
                        const paginatedOpponents = opponents.slice(opponentStartIndex, opponentStartIndex + opponentItemsPerPage);
                        
                        return (
                            <div className="space-y-3">
                                <SectionHeader title="Opponent table" description="Sortable context for every side you have faced." />
                                <Card className="overflow-hidden p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border bg-muted/30">
                                                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Opponent</th>
                                                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Mat</th>
                                                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Runs</th>
                                                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Avg</th>
                                                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">SR</th>
                                                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Wkts</th>
                                                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Bowl Avg</th>
                                                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Econ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/60">
                                                {paginatedOpponents.map((o) => (
                                                    <tr key={o.opponent} className="transition-colors hover:bg-muted/20">
                                                        <td className="px-4 py-3.5 font-semibold text-foreground sm:px-6">{o.opponent}</td>
                                                        <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{o.matches}</td>
                                                        <td className="px-4 py-3.5 text-center font-mono font-semibold tabular-nums text-primary sm:px-6">{o.runs}</td>
                                                        <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{o.battingAverage ?? "-"}</td>
                                                        <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{o.strikeRate}</td>
                                                        <td className="px-4 py-3.5 text-center font-mono font-semibold tabular-nums text-accent-foreground sm:px-6">{o.wickets}</td>
                                                        <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{o.bowlingAverage ?? "-"}</td>
                                                        <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{o.economy}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {opponentTotalPages > 1 && (
                                        <div className="border-t border-border/60">
                                            <Pagination
                                                currentPage={opponentPage}
                                                totalPages={opponentTotalPages}
                                                onPageChange={setOpponentPage}
                                                itemsPerPage={opponentItemsPerPage}
                                                totalItems={opponents.length}
                                                onItemsPerPageChange={(val) => {
                                                    setOpponentItemsPerPage(val);
                                                    setOpponentPage(1);
                                                }}
                                                itemsPerPageOptions={[5, 10, 20]}
                                            />
                                        </div>
                                    )}
                                </Card>
                            </div>
                        );
                    })()}
                </>
            )}
        </div>
    );
}
