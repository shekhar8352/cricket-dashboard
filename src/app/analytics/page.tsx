"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardHeader, CardTitle, CardContent, StatCard } from "@/components/ui/Card";
import {
    RunsOverTimeChart,
    AverageTrendChart,
    StrikeRateTrendChart,
    EconomyTrendChart,
    WicketsChart,
    FormatBreakdownChart,
    OpponentStatsChart,
} from "@/components/charts";
import { PLAYER, MATCH_FORMATS, MATCH_LEVELS } from "@/lib/constants";
import {
    CareerSummary,
    FormatStats,
    TrendDataPoint,
    OpponentStats,
    AnalyticsFilters,
} from "@/types";
import { formatBattingScore, formatBowlingFigures } from "@/lib/utils";

export default function AnalyticsPage() {
    const [summary, setSummary] = useState<CareerSummary | null>(null);
    const [formats, setFormats] = useState<FormatStats[]>([]);
    const [trends, setTrends] = useState<TrendDataPoint[]>([]);
    const [opponents, setOpponents] = useState<OpponentStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<AnalyticsFilters>({});

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
            if (filters.startDate) params.set("startDate", filters.startDate);
            if (filters.endDate) params.set("endDate", filters.endDate);

            const res = await fetch(`/api/analytics?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setSummary(data.data.summary);
                setFormats(data.data.formats);
                setTrends(data.data.trends);
                setOpponents(data.data.opponents);
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Analytics</h1>
                <p className="text-gray-400 mt-1">
                    Detailed career analytics for {PLAYER.name}
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent>
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Format
                            </label>
                            <select
                                value={filters.format || ""}
                                onChange={(e) => handleFilterChange("format", e.target.value)}
                                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Formats</option>
                                {MATCH_FORMATS.map((format) => (
                                    <option key={format} value={format}>
                                        {format}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                Level
                            </label>
                            <select
                                value={filters.level || ""}
                                onChange={(e) => handleFilterChange("level", e.target.value)}
                                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Levels</option>
                                {MATCH_LEVELS.map((level) => (
                                    <option key={level} value={level}>
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={filters.startDate || ""}
                                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={filters.endDate || ""}
                                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </CardContent>
            </Card>

            {isLoading ? (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : !summary || summary.matches === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <p className="text-gray-400">No data available for the selected filters.</p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Career Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

                    {/* Detailed Stats Grid */}
                    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4">
                        <StatCard title="Innings" value={summary.innings} />
                        <StatCard title="50s" value={summary.fifties} />
                        <StatCard title="100s" value={summary.centuries} />
                        <StatCard title="Strike Rate" value={summary.strikeRate} />
                        <StatCard title="Economy" value={summary.economy} />
                        <StatCard title="5W Hauls" value={summary.fiveWicketHauls} />
                        <StatCard title="Fours" value={summary.fours} />
                        <StatCard title="Sixes" value={summary.sixes} />
                        <StatCard title="Win %" value={`${summary.winPercentage}%`} />
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {trends.length > 0 && <RunsOverTimeChart data={trends} />}
                        {trends.length > 0 && <AverageTrendChart data={trends} />}
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {trends.length > 0 && <StrikeRateTrendChart data={trends} />}
                        {trends.length > 0 && <EconomyTrendChart data={trends} />}
                    </div>

                    {/* Charts Row 3 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {formats.length > 0 && <FormatBreakdownChart data={formats} metric="runs" />}
                        {formats.length > 0 && <FormatBreakdownChart data={formats} metric="wickets" />}
                    </div>

                    {/* Charts Row 4 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {trends.length > 0 && <WicketsChart data={trends} />}
                        {opponents.length > 0 && <OpponentStatsChart data={opponents} />}
                    </div>

                    {/* Format Breakdown Table */}
                    {formats.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Format-wise Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-800">
                                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Format</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Mat</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Inn</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Runs</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Avg</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">SR</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">50s</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">100s</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Wkts</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Bowl Avg</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Econ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formats.map((f) => (
                                                <tr key={f.format} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                                    <td className="py-3 px-4 text-white font-medium">{f.format}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.matches}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.innings}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.runs}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.battingAverage ?? "-"}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.strikeRate}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.fifties}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.centuries}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.wickets}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.bowlingAverage ?? "-"}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{f.economy}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Opponent Stats Table */}
                    {opponents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance vs Opponents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-800">
                                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Opponent</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Mat</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Runs</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Avg</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">SR</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Wkts</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Bowl Avg</th>
                                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Econ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {opponents.map((o) => (
                                                <tr key={o.opponent} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                                                    <td className="py-3 px-4 text-white font-medium">{o.opponent}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{o.matches}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{o.runs}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{o.battingAverage ?? "-"}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{o.strikeRate}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{o.wickets}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{o.bowlingAverage ?? "-"}</td>
                                                    <td className="text-center py-3 px-4 text-gray-300">{o.economy}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
