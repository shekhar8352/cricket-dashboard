"use client";

import type { ReactNode } from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Card, CardContent } from "@/components/ui/Card";
import {
    defaultChartOptions,
    chartColors,
    formatColors,
    chartTooltipPlugin,
} from "./ChartConfig";
import type { ChartOptions } from "chart.js";
import {
    TrendDataPoint,
    FormatStats,
    OpponentStats,
    VenueStats,
    MonthlyMatchVolume,
    VenueTypeOutcomeRow,
} from "@/types";

function ChartPanel({
    caption,
    heightClass = "h-[min(320px,55vw)] sm:h-[300px] md:h-[320px]",
    children,
}: {
    caption: string;
    heightClass?: string;
    children: ReactNode;
}) {
    return (
        <Card variant="chart" className="flex flex-col">
            <CardContent className="mt-0 p-0 flex-1 min-h-0">
                <figure className="m-0 h-full flex flex-col">
                    <figcaption className="sr-only">{caption}</figcaption>
                    <div className={`w-full min-h-[220px] ${heightClass}`}>{children}</div>
                </figure>
            </CardContent>
        </Card>
    );
}

const lineDatasetStyle = {
    borderWidth: 1.75,
    pointRadius: 0,
    pointHoverRadius: 5,
    pointHoverBorderWidth: 1.5,
    pointBackgroundColor: chartColors.primary,
    pointBorderColor: "hsl(240, 6%, 8%)",
    tension: 0.35,
};

interface RunsOverTimeProps {
    data: TrendDataPoint[];
}

export function RunsOverTimeChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d) =>
            new Date(d.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })
        ),
        datasets: [
            {
                label: "Runs (match)",
                data: data.map((d) => d.runs),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primaryLight,
                fill: true,
                ...lineDatasetStyle,
            },
            {
                label: "Cumulative runs",
                data: data.map((d) => d.cumulativeRuns),
                borderColor: chartColors.secondary,
                backgroundColor: "transparent",
                borderDash: [4, 4],
                fill: false,
                ...lineDatasetStyle,
                pointBackgroundColor: chartColors.secondary,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        ...defaultChartOptions,
        scales: {
            ...defaultChartOptions.scales,
            y: {
                ...defaultChartOptions.scales?.y,
                position: "left",
                title: {
                    display: true,
                    text: "Runs (match)",
                    color: "hsla(215, 14%, 58%, 0.85)",
                    font: { size: 10, weight: "bold" },
                    padding: { bottom: 6 },
                },
            },
            y1: {
                position: "right",
                grid: { display: false },
                ticks: { color: "hsla(215, 14%, 58%, 0.85)", maxTicksLimit: 6 },
                title: {
                    display: true,
                    text: "Career total",
                    color: "hsla(215, 14%, 58%, 0.85)",
                    font: { size: 10, weight: "bold" },
                    padding: { bottom: 6 },
                },
            },
        },
    };

    return (
        <ChartPanel caption="Line chart of runs per match and cumulative career runs over time.">
            <Line data={chartData} options={options} />
        </ChartPanel>
    );
}

export function AverageTrendChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d, i) => `${i + 1}`),
        datasets: [
            {
                label: "Running average",
                data: data.map((d) => d.runningAverage),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primaryLight,
                fill: true,
                ...lineDatasetStyle,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        ...defaultChartOptions,
        scales: {
            ...defaultChartOptions.scales,
            x: {
                ...defaultChartOptions.scales?.x,
                title: {
                    display: true,
                    text: "Match #",
                    color: "hsla(215, 14%, 58%, 0.85)",
                    font: { size: 10, weight: "bold" },
                    padding: { top: 8 },
                },
            },
            y: {
                ...defaultChartOptions.scales?.y,
                title: {
                    display: true,
                    text: "Average",
                    color: "hsla(215, 14%, 58%, 0.85)",
                    font: { size: 10, weight: "bold" },
                    padding: { bottom: 6 },
                },
            },
        },
    };

    return (
        <ChartPanel caption="Batting running average after each recorded match.">
            <Line data={chartData} options={options} />
        </ChartPanel>
    );
}

export function StrikeRateTrendChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d, i) => `${i + 1}`),
        datasets: [
            {
                label: "Strike rate",
                data: data.map((d) => d.runningStrikeRate),
                borderColor: chartColors.tertiary,
                backgroundColor: chartColors.tertiaryLight,
                fill: true,
                ...lineDatasetStyle,
                pointBackgroundColor: chartColors.tertiary,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        ...defaultChartOptions,
        scales: {
            ...defaultChartOptions.scales,
            x: {
                ...defaultChartOptions.scales?.x,
                title: {
                    display: true,
                    text: "Match #",
                    color: "hsla(215, 14%, 58%, 0.85)",
                    font: { size: 10, weight: "bold" },
                    padding: { top: 8 },
                },
            },
            y: {
                ...defaultChartOptions.scales?.y,
                title: {
                    display: true,
                    text: "SR",
                    color: "hsla(215, 14%, 58%, 0.85)",
                    font: { size: 10, weight: "bold" },
                    padding: { bottom: 6 },
                },
            },
        },
    };

    return (
        <ChartPanel caption="Running strike rate trend across matches.">
            <Line data={chartData} options={options} />
        </ChartPanel>
    );
}

export function EconomyTrendChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d, i) => `${i + 1}`),
        datasets: [
            {
                label: "Economy",
                data: data.map((d) => d.runningEconomy),
                borderColor: chartColors.danger,
                backgroundColor: chartColors.dangerLight,
                fill: true,
                ...lineDatasetStyle,
                pointBackgroundColor: chartColors.danger,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        ...defaultChartOptions,
        scales: {
            ...defaultChartOptions.scales,
            x: {
                ...defaultChartOptions.scales?.x,
                title: {
                    display: true,
                    text: "Match #",
                    color: "hsla(215, 14%, 58%, 0.85)",
                    font: { size: 10, weight: "bold" },
                    padding: { top: 8 },
                },
            },
            y: {
                ...defaultChartOptions.scales?.y,
                title: {
                    display: true,
                    text: "Runs / over",
                    color: "hsla(215, 14%, 58%, 0.85)",
                    font: { size: 10, weight: "bold" },
                    padding: { bottom: 6 },
                },
            },
        },
    };

    return (
        <ChartPanel caption="Running economy rate trend.">
            <Line data={chartData} options={options} />
        </ChartPanel>
    );
}

export function WicketsChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d) =>
            d.opponent.length > 12 ? `${d.opponent.slice(0, 11)}…` : d.opponent
        ),
        datasets: [
            {
                label: "Wickets",
                data: data.map((d) => d.wickets),
                backgroundColor: "hsla(199, 65%, 52%, 0.35)",
                borderColor: "hsla(199, 65%, 52%, 0.55)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 28,
            },
        ],
    };

    const options = {
        ...defaultChartOptions,
        plugins: {
            ...defaultChartOptions.plugins,
            legend: { ...defaultChartOptions.plugins?.legend, display: false },
        },
    } as ChartOptions<"bar">;

    return (
        <ChartPanel caption="Wickets taken per match opponent.">
            <Bar data={chartData} options={options} />
        </ChartPanel>
    );
}

interface FormatBreakdownProps {
    data: FormatStats[];
    metric?: "runs" | "wickets" | "matches";
}

export function FormatBreakdownChart({ data, metric = "runs" }: FormatBreakdownProps) {
    const values = data.map((d) =>
        metric === "runs" ? d.runs : metric === "wickets" ? d.wickets : d.matches
    );

    const chartData = {
        labels: data.map((d) => d.format),
        datasets: [
            {
                data: values,
                backgroundColor: formatColors.slice(0, data.length).map((c) =>
                    c.replace(/^hsl\(/, "hsla(").replace(/\)$/, ", 0.52)")
                ),
                borderColor: "hsla(240, 5%, 14%, 0.9)",
                borderWidth: 1,
                hoverOffset: 4,
            },
        ],
    };

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "66%",
        plugins: {
            legend: {
                position: "right",
                labels: {
                    color: "hsla(215, 14%, 58%, 0.92)",
                    padding: 14,
                    boxWidth: 10,
                    font: { size: 11 },
                },
            },
            tooltip: chartTooltipPlugin,
        },
    };

    const label =
        metric === "runs" ? "runs by format" : metric === "wickets" ? "wickets by format" : "matches by format";

    return (
        <ChartPanel caption={`Distribution of ${label}.`}>
            <Doughnut data={chartData} options={options} />
        </ChartPanel>
    );
}

interface OpponentStatsProps {
    data: OpponentStats[];
}

export function OpponentStatsChart({ data }: OpponentStatsProps) {
    const top10 = data.slice(0, 10);

    const chartData = {
        labels: top10.map((d) => (d.opponent.length > 14 ? `${d.opponent.slice(0, 13)}…` : d.opponent)),
        datasets: [
            {
                label: "Runs",
                data: top10.map((d) => d.runs),
                backgroundColor: "hsla(152, 41%, 48%, 0.28)",
                borderColor: "hsla(152, 41%, 48%, 0.45)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 22,
            },
            {
                label: "Wickets × 10",
                data: top10.map((d) => d.wickets * 10),
                backgroundColor: "hsla(199, 65%, 52%, 0.22)",
                borderColor: "hsla(199, 65%, 52%, 0.4)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 22,
            },
        ],
    };

    const options = {
        ...defaultChartOptions,
        scales: {
            ...defaultChartOptions.scales,
            x: {
                ...defaultChartOptions.scales?.x,
                stacked: false,
                ticks: { ...defaultChartOptions.scales?.x?.ticks, maxRotation: 35, minRotation: 0 },
            },
        },
    } as ChartOptions<"bar">;

    return (
        <ChartPanel caption="Runs and scaled wickets against top opponents.">
            <Bar data={chartData} options={options} />
        </ChartPanel>
    );
}

interface RecentFormProps {
    data: TrendDataPoint[];
    limit?: number;
}

export function RecentFormChart({ data, limit = 10 }: RecentFormProps) {
    const recentData = data.slice(-limit);

    const chartData = {
        labels: recentData.map((d) =>
            d.opponent.length > 8 ? `${d.opponent.slice(0, 7)}…` : d.opponent
        ),
        datasets: [
            {
                label: "Runs",
                data: recentData.map((d) => d.runs),
                backgroundColor: recentData.map((d) =>
                    d.runs >= 50
                        ? "hsla(152, 41%, 48%, 0.4)"
                        : "hsla(199, 65%, 52%, 0.28)"
                ),
                borderColor: recentData.map((d) =>
                    d.runs >= 50 ? "hsla(152, 41%, 48%, 0.55)" : "hsla(199, 65%, 52%, 0.45)"
                ),
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 32,
            },
        ],
    };

    const options = {
        ...defaultChartOptions,
        plugins: {
            ...defaultChartOptions.plugins,
            legend: { display: false },
        },
    } as ChartOptions<"bar">;

    return (
        <ChartPanel
            caption={`Runs in the last ${recentData.length} matches.`}
            heightClass="h-[200px] sm:h-[220px]"
        >
            <Bar data={chartData} options={options} />
        </ChartPanel>
    );
}

interface WinLossProps {
    won: number;
    lost: number;
    draw: number;
    tie: number;
    noResult: number;
}

export function WinLossChart({ won, lost, draw, tie, noResult }: WinLossProps) {
    const chartData = {
        labels: ["Won", "Lost", "Draw", "Tie", "No result"],
        datasets: [
            {
                data: [won, lost, draw, tie, noResult],
                backgroundColor: [
                    "hsla(152, 41%, 48%, 0.5)",
                    "hsla(0, 58%, 58%, 0.45)",
                    "hsla(38, 88%, 54%, 0.45)",
                    "hsla(199, 65%, 52%, 0.4)",
                    "hsla(215, 14%, 48%, 0.35)",
                ],
                borderColor: "hsla(240, 5%, 12%, 0.95)",
                borderWidth: 1,
                hoverOffset: 3,
            },
        ],
    };

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "hsla(215, 14%, 58%, 0.92)",
                    padding: 12,
                    boxWidth: 10,
                    font: { size: 10 },
                },
            },
            tooltip: chartTooltipPlugin,
        },
    };

    return (
        <ChartPanel caption="Match results breakdown." heightClass="h-[260px] sm:h-[280px]">
            <Doughnut data={chartData} options={options} />
        </ChartPanel>
    );
}

interface DismissalStats {
    type: string;
    count: number;
}

export function DismissalBreakdownChart({ data }: { data: DismissalStats[] }) {
    if (!data.length) {
        return (
            <ChartPanel caption="No dismissal types recorded for this filter." heightClass="h-[120px]">
                <p className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    No batting dismissals in the filtered set. Add dismissal types on performance entries to see this chart.
                </p>
            </ChartPanel>
        );
    }

    const chartData = {
        labels: data.map(
            (d) => d.type.charAt(0).toUpperCase() + d.type.slice(1).replace(/_/g, " ")
        ),
        datasets: [
            {
                data: data.map((d) => d.count),
                backgroundColor: formatColors.slice(0, data.length).map((c) =>
                    c.replace(/^hsl\(/, "hsla(").replace(/\)$/, ", 0.52)")
                ),
                borderColor: "hsla(240, 5%, 12%, 0.95)",
                borderWidth: 1,
                hoverOffset: 3,
            },
        ],
    };

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "64%",
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "hsla(215, 14%, 58%, 0.92)",
                    padding: 12,
                    boxWidth: 10,
                    font: { size: 10 },
                },
            },
            tooltip: chartTooltipPlugin,
        },
    };

    return (
        <ChartPanel caption="Dismissal types distribution." heightClass="h-[260px] sm:h-[280px]">
            <Doughnut data={chartData} options={options} />
        </ChartPanel>
    );
}

interface TossStats {
    wonTossWonMatch: number;
    wonTossLostMatch: number;
    lostTossWonMatch: number;
    lostTossLostMatch: number;
}

export function TossAnalysisChart({ data }: { data: TossStats }) {
    const total =
        data.wonTossWonMatch +
        data.wonTossLostMatch +
        data.lostTossWonMatch +
        data.lostTossLostMatch;

    const chartData = {
        labels: ["Won toss", "Lost toss"],
        datasets: [
            {
                label: "Won match",
                data: [data.wonTossWonMatch, data.lostTossWonMatch],
                backgroundColor: "hsla(152, 41%, 48%, 0.35)",
                borderColor: "hsla(152, 41%, 48%, 0.5)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 36,
            },
            {
                label: "Lost match",
                data: [data.wonTossLostMatch, data.lostTossLostMatch],
                backgroundColor: "hsla(0, 58%, 58%, 0.3)",
                borderColor: "hsla(0, 58%, 58%, 0.48)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 36,
            },
        ],
    };

    const options = { ...defaultChartOptions } as ChartOptions<"bar">;

    if (total === 0) {
        return (
            <ChartPanel caption="Not enough toss and result data for this filter." heightClass="h-[120px]">
                <p className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    Need toss winner, your team, and a won/lost result on matches to plot toss correlation.
                </p>
            </ChartPanel>
        );
    }

    return (
        <ChartPanel caption="Match outcomes grouped by toss result.">
            <Bar data={chartData} options={options} />
        </ChartPanel>
    );
}

function venueTypeLabel(v: string) {
    if (v === "unknown") return "Unknown";
    return v.charAt(0).toUpperCase() + v.slice(1);
}

export function MonthlyMatchVolumeChart({ data }: { data: MonthlyMatchVolume[] }) {
    if (!data.length) {
        return (
            <ChartPanel caption="No matches in range." heightClass="h-[120px]">
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No monthly volume for the current filters.
                </p>
            </ChartPanel>
        );
    }

    const chartData = {
        labels: data.map((d) => d.label),
        datasets: [
            {
                label: "Matches",
                data: data.map((d) => d.count),
                backgroundColor: "hsla(199, 65%, 52%, 0.28)",
                borderColor: "hsla(199, 65%, 52%, 0.45)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 28,
            },
        ],
    };

    const options = {
        ...defaultChartOptions,
        plugins: { ...defaultChartOptions.plugins, legend: { display: false } },
        scales: {
            ...defaultChartOptions.scales,
            x: {
                ...defaultChartOptions.scales?.x,
                ticks: {
                    ...defaultChartOptions.scales?.x?.ticks,
                    maxRotation: 45,
                    minRotation: data.length > 18 ? 45 : 0,
                    autoSkip: true,
                    maxTicksLimit: data.length > 36 ? 24 : undefined,
                },
            },
        },
    } as ChartOptions<"bar">;

    const minChartWidth = Math.max(320, data.length * 28);

    return (
        <ChartPanel caption="Number of matches played per calendar month.">
            <div className="w-full overflow-x-auto" style={{ minHeight: 280 }}>
                <div style={{ minWidth: minChartWidth, height: 280 }}>
                    <Bar data={chartData} options={options} />
                </div>
            </div>
        </ChartPanel>
    );
}

export function VenueTypeOutcomeChart({ data }: { data: VenueTypeOutcomeRow[] }) {
    const rows = data.filter((r) => r.matches > 0);
    if (!rows.length) {
        return (
            <ChartPanel caption="No home/away split." heightClass="h-[120px]">
                <p className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
                    No matches with venue type in this filter. Set home / away / neutral on matches to see this chart.
                </p>
            </ChartPanel>
        );
    }

    const labels = rows.map((r) => venueTypeLabel(r.venueType));
    const chartData = {
        labels,
        datasets: [
            {
                label: "Won",
                data: rows.map((r) => r.won),
                backgroundColor: "hsla(152, 41%, 48%, 0.38)",
                borderColor: "hsla(152, 41%, 48%, 0.52)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 22,
            },
            {
                label: "Lost",
                data: rows.map((r) => r.lost),
                backgroundColor: "hsla(0, 58%, 58%, 0.32)",
                borderColor: "hsla(0, 58%, 58%, 0.48)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 22,
            },
            {
                label: "Draw / tie / N/R",
                data: rows.map((r) => r.other),
                backgroundColor: "hsla(38, 88%, 54%, 0.28)",
                borderColor: "hsla(38, 88%, 54%, 0.45)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 22,
            },
        ],
    };

    const options = { ...defaultChartOptions } as ChartOptions<"bar">;

    return (
        <ChartPanel caption="Results by venue type: home, away, neutral.">
            <Bar data={chartData} options={options} />
        </ChartPanel>
    );
}

export function TopVenuesChart({ data, limit = 8 }: { data: VenueStats[]; limit?: number }) {
    const top = [...data].sort((a, b) => b.matches - a.matches).slice(0, limit);
    if (!top.length) {
        return (
            <ChartPanel caption="No venue data." heightClass="h-[120px]">
                <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No venues for the current filters.
                </p>
            </ChartPanel>
        );
    }

    const chartData = {
        labels: top.map((v) => {
            const line = [v.venue, v.city].filter(Boolean).join(", ");
            return line.length > 22 ? `${line.slice(0, 21)}…` : line;
        }),
        datasets: [
            {
                label: "Matches",
                data: top.map((v) => v.matches),
                backgroundColor: "hsla(152, 41%, 48%, 0.26)",
                borderColor: "hsla(152, 41%, 48%, 0.42)",
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 18,
            },
        ],
    };

    const options = {
        ...defaultChartOptions,
        indexAxis: "y" as const,
        plugins: { ...defaultChartOptions.plugins, legend: { display: false } },
    } as ChartOptions<"bar">;

    return (
        <ChartPanel caption="Grounds where you have played the most matches.">
            <Bar data={chartData} options={options} />
        </ChartPanel>
    );
}
