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
} from "chart.js";

// Register Chart.js components
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
    Filler
);

// Default chart options for consistent styling
export const defaultChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: "#9ca3af",
                font: {
                    family: "Inter, sans-serif",
                },
            },
        },
        tooltip: {
            backgroundColor: "#1f2937",
            titleColor: "#f9fafb",
            bodyColor: "#d1d5db",
            borderColor: "#374151",
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
        },
    },
    scales: {
        x: {
            grid: {
                color: "#374151",
            },
            ticks: {
                color: "#9ca3af",
            },
        },
        y: {
            grid: {
                color: "#374151",
            },
            ticks: {
                color: "#9ca3af",
            },
        },
    },
};

// Color palette for charts
export const chartColors = {
    primary: "rgb(59, 130, 246)", // blue-500
    primaryLight: "rgba(59, 130, 246, 0.1)",
    secondary: "rgb(16, 185, 129)", // emerald-500
    secondaryLight: "rgba(16, 185, 129, 0.1)",
    tertiary: "rgb(245, 158, 11)", // amber-500
    tertiaryLight: "rgba(245, 158, 11, 0.1)",
    danger: "rgb(239, 68, 68)", // red-500
    dangerLight: "rgba(239, 68, 68, 0.1)",
    purple: "rgb(139, 92, 246)", // violet-500
    purpleLight: "rgba(139, 92, 246, 0.1)",
};

// Format colors array for pie/doughnut charts
export const formatColors = [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.danger,
    chartColors.purple,
    "rgb(236, 72, 153)", // pink-500
];

export { ChartJS };
