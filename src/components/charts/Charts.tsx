"use client";

import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
    defaultChartOptions,
    chartColors,
    formatColors,
} from "./ChartConfig";
import { TrendDataPoint, FormatStats, OpponentStats } from "@/types";

// Runs Over Time Chart
interface RunsOverTimeProps {
    data: TrendDataPoint[];
}

export function RunsOverTimeChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d) => new Date(d.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })),
        datasets: [
            {
                label: "Runs per Match",
                data: data.map((d) => d.runs),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primaryLight,
                fill: true,
                tension: 0.3,
            },
            {
                label: "Cumulative Runs",
                data: data.map((d) => d.cumulativeRuns),
                borderColor: chartColors.secondary,
                backgroundColor: "transparent",
                borderDash: [5, 5],
                tension: 0.3,
                yAxisID: "y1",
            },
        ],
    };

    const options = {
        ...defaultChartOptions,
        scales: {
            ...defaultChartOptions.scales,
            y: {
                ...defaultChartOptions.scales.y,
                position: "left" as const,
                title: { display: true, text: "Match Runs", color: "#9ca3af" },
            },
            y1: {
                position: "right" as const,
                grid: { display: false },
                ticks: { color: "#9ca3af" },
                title: { display: true, text: "Cumulative", color: "#9ca3af" },
            },
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Runs Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <Line data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
}

// Batting Average Trend
export function AverageTrendChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d, i) => `Match ${i + 1}`),
        datasets: [
            {
                label: "Running Average",
                data: data.map((d) => d.runningAverage),
                borderColor: chartColors.primary,
                backgroundColor: chartColors.primaryLight,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Batting Average Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <Line data={chartData} options={defaultChartOptions} />
                </div>
            </CardContent>
        </Card>
    );
}

// Strike Rate Trend
export function StrikeRateTrendChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d, i) => `Match ${i + 1}`),
        datasets: [
            {
                label: "Running Strike Rate",
                data: data.map((d) => d.runningStrikeRate),
                borderColor: chartColors.tertiary,
                backgroundColor: chartColors.tertiaryLight,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Strike Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <Line data={chartData} options={defaultChartOptions} />
                </div>
            </CardContent>
        </Card>
    );
}

// Economy Trend
export function EconomyTrendChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d, i) => `Match ${i + 1}`),
        datasets: [
            {
                label: "Running Economy",
                data: data.map((d) => d.runningEconomy),
                borderColor: chartColors.danger,
                backgroundColor: chartColors.dangerLight,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Economy Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <Line data={chartData} options={defaultChartOptions} />
                </div>
            </CardContent>
        </Card>
    );
}

// Wickets Per Match
export function WicketsChart({ data }: RunsOverTimeProps) {
    const chartData = {
        labels: data.map((d) => d.opponent.substring(0, 10)),
        datasets: [
            {
                label: "Wickets",
                data: data.map((d) => d.wickets),
                backgroundColor: chartColors.secondary,
                borderRadius: 4,
            },
        ],
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Wickets Per Match</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <Bar data={chartData} options={defaultChartOptions} />
                </div>
            </CardContent>
        </Card>
    );
}

// Format Breakdown
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
                backgroundColor: formatColors.slice(0, data.length),
                borderWidth: 0,
            },
        ],
    };

    const options = {
        ...defaultChartOptions,
        plugins: {
            ...defaultChartOptions.plugins,
            legend: {
                position: "right" as const,
                labels: {
                    color: "#9ca3af",
                    padding: 20,
                },
            },
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {metric === "runs" ? "Runs" : metric === "wickets" ? "Wickets" : "Matches"} by Format
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <Doughnut data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
}

// Opponent Stats
interface OpponentStatsProps {
    data: OpponentStats[];
}

export function OpponentStatsChart({ data }: OpponentStatsProps) {
    const top10 = data.slice(0, 10);

    const chartData = {
        labels: top10.map((d) => d.opponent),
        datasets: [
            {
                label: "Runs",
                data: top10.map((d) => d.runs),
                backgroundColor: chartColors.primary,
                borderRadius: 4,
            },
            {
                label: "Wickets × 10",
                data: top10.map((d) => d.wickets * 10),
                backgroundColor: chartColors.secondary,
                borderRadius: 4,
            },
        ],
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance vs Opponents</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <Bar data={chartData} options={defaultChartOptions} />
                </div>
            </CardContent>
        </Card>
    );
}

// Recent Form Mini Chart
interface RecentFormProps {
    data: TrendDataPoint[];
    limit?: number;
}

export function RecentFormChart({ data, limit = 10 }: RecentFormProps) {
    const recentData = data.slice(-limit);

    const chartData = {
        labels: recentData.map((d) => d.opponent.substring(0, 6)),
        datasets: [
            {
                label: "Runs",
                data: recentData.map((d) => d.runs),
                backgroundColor: recentData.map((d) =>
                    d.runs >= 50 ? chartColors.secondary : chartColors.primary
                ),
                borderRadius: 4,
            },
        ],
    };

    const options = {
        ...defaultChartOptions,
        plugins: {
            ...defaultChartOptions.plugins,
            legend: { display: false },
        },
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Last {limit} Matches</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px]">
                    <Bar data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
}
