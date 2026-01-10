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
import { Filter, X, Calendar, Layers, Trophy } from "lucide-react";

export default function AnalyticsPage() {
    const [summary, setSummary] = useState<CareerSummary | null>(null);
    const [formats, setFormats] = useState<FormatStats[]>([]);
    const [trends, setTrends] = useState<TrendDataPoint[]>([]);
    const [opponents, setOpponents] = useState<OpponentStats[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState<AnalyticsFilters>({});
    const [showFilters, setShowFilters] = useState(true);

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

    const activeFilterCount = Object.values(filters).filter(Boolean).length;

    return (
        <div className="space-y-12 pb-12">
            {/* Header with Filter Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight">Analytics</h1>
                    <p className="text-gray-400 font-medium tracking-tight">
                        Deep dive into your performance metrics and growth over time.
                    </p>
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${showFilters
                            ? "bg-white text-gray-950"
                            : "bg-blue-600/10 text-blue-400 border border-blue-600/20"
                        }`}
                >
                    <Filter size={18} />
                    {showFilters ? "Hide Filters" : "Show Filters"}
                    {activeFilterCount > 0 && (
                        <span className="ml-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Compact Filters Section */}
            {showFilters && (
                <Card className="p-0 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">
                                <Trophy size={12} /> Format
                            </label>
                            <select
                                value={filters.format || ""}
                                onChange={(e) => handleFilterChange("format", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-gray-950">All Formats</option>
                                {MATCH_FORMATS.map((format) => (
                                    <option key={format} value={format} className="bg-gray-950">
                                        {format}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">
                                <Layers size={12} /> Level
                            </label>
                            <select
                                value={filters.level || ""}
                                onChange={(e) => handleFilterChange("level", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-gray-950">All Levels</option>
                                {MATCH_LEVELS.map((level) => (
                                    <option key={level} value={level} className="bg-gray-950">
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">
                                <Calendar size={12} /> From
                            </label>
                            <input
                                type="date"
                                value={filters.startDate || ""}
                                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 px-1">
                                <Calendar size={12} /> To
                            </label>
                            <input
                                type="date"
                                value={filters.endDate || ""}
                                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                disabled={activeFilterCount === 0}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-30 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
                            >
                                <X size={16} /> Clear
                            </button>
                        </div>
                    </div>
                </Card>
            )}

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500"></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">Filtering Data...</p>
                </div>
            ) : !summary || summary.matches === 0 ? (
                <Card className="p-12 text-center animate-float">
                    <p className="text-gray-400 font-medium">No performance data found matching the selected filters.</p>
                </Card>
            ) : (
                <>
                    {/* Career Summary Stats */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
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

                    {/* Detailed Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
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
                            <div key={i} className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</span>
                                <span className="text-xl font-black text-white">{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Charts Row 1 */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Runs Progress</h2>
                            {trends.length > 0 && <RunsOverTimeChart data={trends} />}
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Average Trend</h2>
                            {trends.length > 0 && <AverageTrendChart data={trends} />}
                        </div>
                    </div>

                    {/* Desktop Charts Row 2 */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Aggression Scale (SR)</h2>
                            {trends.length > 0 && <StrikeRateTrendChart data={trends} />}
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Economy Evolution</h2>
                            {trends.length > 0 && <EconomyTrendChart data={trends} />}
                        </div>
                    </div>

                    {/* Opponents & Formats */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Opponent Dominance</h2>
                            {opponents.length > 0 && <OpponentStatsChart data={opponents} />}
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Bowling Strike Rate</h2>
                            {trends.length > 0 && <WicketsChart data={trends} />}
                        </div>
                    </div>

                    {/* Format Statistics Table */}
                    {formats.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Format Statistics</h2>
                            <Card className="p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/10">
                                                <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Format</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Mat</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Inn</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Runs</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Avg</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">SR</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">50/100</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Wkts</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Bowl Avg</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Econ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {formats.map((f) => (
                                                <tr key={f.format} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4 px-6 text-white font-bold">{f.format}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.matches}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.innings}</td>
                                                    <td className="text-center py-4 px-6 font-black text-blue-400">{f.runs}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.battingAverage ?? "-"}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.strikeRate}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.fifties}/{f.centuries}</td>
                                                    <td className="text-center py-4 px-6 font-black text-emerald-400">{f.wickets}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.bowlingAverage ?? "-"}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.economy}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Opponent Statistics Table */}
                    {opponents.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Opponent Summary</h2>
                            <Card className="p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/10">
                                                <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Opponent</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Mat</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Runs</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Avg</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">SR</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Wkts</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Bowl Avg</th>
                                                <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Econ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {opponents.map((o) => (
                                                <tr key={o.opponent} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-4 px-6 text-white font-bold">{o.opponent}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{o.matches}</td>
                                                    <td className="text-center py-4 px-6 font-black text-blue-400">{o.runs}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{o.battingAverage ?? "-"}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{o.strikeRate}</td>
                                                    <td className="text-center py-4 px-6 font-black text-emerald-400">{o.wickets}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{o.bowlingAverage ?? "-"}</td>
                                                    <td className="text-center py-4 px-6 text-gray-300 font-medium">{o.economy}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
