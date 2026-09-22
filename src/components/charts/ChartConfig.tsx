"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    RadialLinearScale,
    RadarController,
    PolarAreaController,
    ScatterController,
} from "chart.js";
import type { ChartOptions } from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    RadialLinearScale,
    RadarController,
    PolarAreaController,
    ScatterController
);

const TICK_COLOR = "hsla(215, 14%, 58%, 0.92)";
const GRID_COLOR = "hsla(215, 16%, 55%, 0.08)";

const chartFontFamily =
    'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif';

/** Tooltip styling shared by line, bar, and doughnut charts */
export const chartTooltipPlugin = {
    backgroundColor: "hsla(240, 6%, 10%, 0.94)",
    titleColor: "hsl(210, 20%, 96%)",
    bodyColor: "hsl(215, 14%, 72%)",
    borderColor: "hsla(240, 5%, 22%, 0.9)",
    borderWidth: 1,
    cornerRadius: 8,
    padding: 12,
    displayColors: true,
    boxPadding: 4,
    titleFont: { family: chartFontFamily, size: 12, weight: "bold" as const },
    bodyFont: { family: chartFontFamily, size: 11, weight: "normal" as const },
};

/** Line / bar cartesian defaults */
export const defaultChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: "index",
        intersect: false,
    },
    plugins: {
        legend: {
            display: true,
            position: "bottom",
            align: "start",
            labels: {
                color: TICK_COLOR,
                boxWidth: 10,
                boxHeight: 10,
                padding: 16,
                usePointStyle: true,
                pointStyle: "circle",
                font: {
                    family: chartFontFamily,
                    size: 11,
                    weight: "normal",
                },
            },
        },
        tooltip: chartTooltipPlugin,
    },
    scales: {
        x: {
            grid: {
                color: GRID_COLOR,
                lineWidth: 1,
                drawTicks: false,
            },
            border: { display: false },
            ticks: {
                color: TICK_COLOR,
                maxRotation: 0,
                autoSkip: true,
                maxTicksLimit: 8,
                font: { family: chartFontFamily, size: 10 },
                padding: 8,
            },
        },
        y: {
            grid: {
                color: GRID_COLOR,
                lineWidth: 1,
                drawTicks: false,
            },
            border: { display: false },
            ticks: {
                color: TICK_COLOR,
                maxTicksLimit: 6,
                font: { family: chartFontFamily, size: 10 },
                padding: 10,
            },
        },
    },
};

export const chartColors = {
    primary: "hsl(152, 41%, 48%)",
    primaryLight: "hsla(152, 41%, 48%, 0.06)",
    primaryStroke: "hsla(152, 41%, 48%, 0.35)",
    secondary: "hsl(199, 65%, 52%)",
    secondaryLight: "hsla(199, 65%, 52%, 0.06)",
    tertiary: "hsl(38, 92%, 50%)",
    tertiaryLight: "hsla(38, 92%, 50%, 0.06)",
    danger: "hsl(0, 58%, 58%)",
    dangerLight: "hsla(0, 58%, 58%, 0.06)",
    purple: "hsl(258, 48%, 62%)",
    purpleLight: "hsla(258, 48%, 62%, 0.08)",
    success: "hsl(152, 41%, 45%)",
    warning: "hsl(38, 88%, 54%)",
    info: "hsl(199, 65%, 52%)",
    neutral: "hsl(215, 14%, 48%)",
};

export const formatColors = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.purple,
    chartColors.danger,
    "hsl(330, 55%, 58%)",
];

export { ChartJS };
