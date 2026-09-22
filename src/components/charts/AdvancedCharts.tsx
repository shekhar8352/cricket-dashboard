"use client";

import { Bar, Line, PolarArea, Radar, Scatter } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { chartColors, chartTooltipPlugin, defaultChartOptions, formatColors } from "./ChartConfig";
import type { CalendarCell, NamedCount, PaceSpinStat, PhaseStat, RadarAxis, RollingPoint, ScatterPoint } from "@/lib/analytics/types";

const axis = {
    ticks: { color: "hsla(215, 14%, 58%, 0.92)", font: { size: 10 } },
    grid: { color: "hsla(215, 16%, 55%, 0.08)" },
    border: { display: false },
};

export function ScoreDistributionChart({ data }: { data: NamedCount[] }) {
    return (
        <Bar
            data={{
                labels: data.map((item) => item.label),
                datasets: [
                    {
                        label: "Innings",
                        data: data.map((item) => item.count),
                        backgroundColor: chartColors.primary,
                        borderRadius: 6,
                    },
                ],
            }}
            options={{ ...defaultChartOptions, plugins: { ...defaultChartOptions.plugins, legend: { display: false } } } as ChartOptions<"bar">}
        />
    );
}

export function PhaseChart({ data, metric }: { data: PhaseStat[]; metric: "strikeRate" | "economy" }) {
    return (
        <Bar
            data={{
                labels: data.map((item) => item.label),
                datasets: [
                    {
                        label: metric === "strikeRate" ? "Strike rate" : "Economy",
                        data: data.map((item) => (metric === "strikeRate" ? item.strikeRate : item.economy)),
                        backgroundColor: metric === "strikeRate" ? chartColors.secondary : chartColors.tertiary,
                        borderRadius: 6,
                    },
                ],
            }}
            options={{ ...defaultChartOptions, plugins: { ...defaultChartOptions.plugins, legend: { display: false } } } as ChartOptions<"bar">}
        />
    );
}

export function PaceVsSpinChart({ data }: { data: PaceSpinStat[] }) {
    return (
        <Bar
            data={{
                labels: data.map((item) => item.label),
                datasets: [
                    {
                        label: "Strike rate",
                        data: data.map((item) => item.strikeRate),
                        backgroundColor: chartColors.primary,
                        borderRadius: 6,
                    },
                    {
                        label: "Average",
                        data: data.map((item) => item.average ?? 0),
                        backgroundColor: chartColors.secondary,
                        borderRadius: 6,
                    },
                ],
            }}
            options={defaultChartOptions as ChartOptions<"bar">}
        />
    );
}

export function WagonWheelChart({ data }: { data: NamedCount[] }) {
    return (
        <PolarArea
            data={{
                labels: data.map((item) => item.label),
                datasets: [
                    {
                        data: data.map((item) => item.count),
                        backgroundColor: formatColors.map((color) => color.replace(")", ", 0.55)").replace("hsl", "hsla")),
                    },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: "right", labels: { color: "hsla(215, 14%, 70%, 0.95)", boxWidth: 10 } }, tooltip: chartTooltipPlugin },
            }}
        />
    );
}

export function SkillsRadarChart({ data }: { data: RadarAxis[] }) {
    return (
        <Radar
            data={{
                labels: data.map((item) => item.label),
                datasets: [
                    {
                        label: "Career shape",
                        data: data.map((item) => item.score),
                        backgroundColor: chartColors.primaryLight,
                        borderColor: chartColors.primary,
                        pointBackgroundColor: chartColors.primary,
                        borderWidth: 1.75,
                    },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        ticks: { display: false },
                        grid: { color: "hsla(215, 16%, 55%, 0.15)" },
                        angleLines: { color: "hsla(215, 16%, 55%, 0.15)" },
                        pointLabels: { color: "hsla(215, 14%, 72%, 0.95)", font: { size: 11 } },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...chartTooltipPlugin,
                        callbacks: {
                            label: (item) => data[item.dataIndex]?.raw || String(item.raw),
                        },
                    },
                },
            }}
        />
    );
}

export function RunsVsSrScatter({ data }: { data: ScatterPoint[] }) {
    return (
        <Scatter
            data={{
                datasets: [
                    {
                        label: "Innings",
                        data: data.map((point) => ({ x: point.x, y: point.y })),
                        backgroundColor: chartColors.primary,
                    },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        ...chartTooltipPlugin,
                        callbacks: {
                            label: (item) => {
                                const point = data[item.dataIndex];
                                return point ? `${point.y} (${point.x} SR) vs ${point.opponent}` : "";
                            },
                        },
                    },
                },
                scales: {
                    x: { ...axis, title: { display: true, text: "Strike rate", color: "hsla(215, 14%, 62%, 0.9)" } },
                    y: { ...axis, title: { display: true, text: "Runs", color: "hsla(215, 14%, 62%, 0.9)" } },
                },
            }}
        />
    );
}

export function RollingFormChart({
    data,
    primaryLabel = "Average, last 5",
    secondaryLabel = "Average, last 10",
    hideSecondary = false,
}: {
    data: RollingPoint[];
    primaryLabel?: string;
    secondaryLabel?: string;
    hideSecondary?: boolean;
}) {
    const labels = data.map((point) => point.label);
    return (
        <Line
            data={{
                labels,
                datasets: [
                    {
                        label: primaryLabel,
                        data: data.map((point) => point.average5),
                        borderColor: chartColors.primary,
                        backgroundColor: chartColors.primaryLight,
                        tension: 0.35,
                        pointRadius: 0,
                        spanGaps: true,
                    },
                    ...(hideSecondary
                        ? []
                        : [
                              {
                                  label: secondaryLabel,
                                  data: data.map((point) => point.average10),
                                  borderColor: chartColors.secondary,
                                  tension: 0.35,
                                  pointRadius: 0,
                                  spanGaps: true,
                              },
                          ]),
                ],
            }}
            options={defaultChartOptions}
        />
    );
}

export function CalendarHeatmap({ cells }: { cells: CalendarCell[] }) {
    const years = [...new Set(cells.map((cell) => cell.year))];
    const max = Math.max(1, ...cells.map((cell) => cell.runs));
    const byKey = new Map(cells.map((cell) => [cell.key, cell]));
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-[auto_repeat(12,minmax(0,1fr))] gap-1 text-[10px] text-muted-foreground">
                <span />
                {months.map((month) => (
                    <span key={month} className="text-center">
                        {month}
                    </span>
                ))}
                {years.map((year) => (
                    <div key={year} className="contents">
                        <span className="pr-2 font-mono">{year}</span>
                        {months.map((_, index) => {
                            const cell = byKey.get(`${year}-${String(index + 1).padStart(2, "0")}`);
                            const intensity = cell ? 0.15 + (cell.runs / max) * 0.85 : 0.05;
                            return (
                                <div
                                    key={`${year}-${index}`}
                                    title={cell ? `${cell.label} ${year}: ${cell.runs} runs, ${cell.matches} matches` : `${months[index]} ${year}`}
                                    className="h-8 rounded-md"
                                    style={{ backgroundColor: `hsla(152, 41%, 45%, ${intensity})` }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">Darker months are the ones with more runs.</p>
        </div>
    );
}
