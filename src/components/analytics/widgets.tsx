"use client";

import { useMemo, useState } from "react";
import type { Coverage, SplitStatRow } from "@/lib/analytics/types";
import { Download } from "lucide-react";

export function KpiGrid({
    items,
}: {
    items: { label: string; value: string | number; hint?: string }[];
}) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {items.map((item) => (
                <div key={item.label} className="glass-card rounded-lg px-3 py-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">{item.value}</p>
                    {item.hint ? <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p> : null}
                </div>
            ))}
        </div>
    );
}

export function CoverageBadge({ coverage }: { coverage?: Coverage | null }) {
    if (!coverage || coverage.total === 0) return null;
    return (
        <p className="text-xs text-muted-foreground">
            Based on {coverage.withDetail} of {coverage.total} innings ({coverage.pct}%)
        </p>
    );
}

export function ChartCard({
    title,
    description,
    coverage,
    table,
    children,
}: {
    title: string;
    description?: string;
    coverage?: Coverage | null;
    table?: React.ReactNode;
    children: React.ReactNode;
}) {
    const [asTable, setAsTable] = useState(false);
    return (
        <section className="surface-chart space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                    {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
                    <CoverageBadge coverage={coverage} />
                </div>
                {table ? (
                    <button
                        type="button"
                        onClick={() => setAsTable((value) => !value)}
                        className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-border px-3 text-xs font-semibold text-foreground"
                    >
                        {asTable ? "Show chart" : "Show table"}
                    </button>
                ) : null}
            </div>
            {asTable ? table : <div className="h-72">{children}</div>}
        </section>
    );
}

export function CountTable({ rows, valueLabel = "Count" }: { rows: { label: string; count: number }[]; valueLabel?: string }) {
    if (rows.length === 0) return <p className="text-sm text-muted-foreground">Nothing logged for this cut yet.</p>;
    return (
        <table className="w-full text-sm">
            <thead>
                <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="py-2">Name</th>
                    <th className="py-2 text-right">{valueLabel}</th>
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.label} className="border-b border-border/50">
                        <td className="py-2 text-foreground">{row.label}</td>
                        <td className="py-2 text-right font-mono tabular-nums">{row.count}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

const SPLIT_COLUMNS: { key: keyof SplitStatRow; label: string }[] = [
    { key: "label", label: "Group" },
    { key: "matches", label: "Mat" },
    { key: "innings", label: "Inn" },
    { key: "runs", label: "Runs" },
    { key: "battingAverage", label: "Avg" },
    { key: "strikeRate", label: "SR" },
    { key: "fifties", label: "50" },
    { key: "centuries", label: "100" },
    { key: "wickets", label: "Wkts" },
    { key: "bowlingAverage", label: "Bowl avg" },
    { key: "economy", label: "Econ" },
    { key: "bowlingStrikeRate", label: "Bowl SR" },
    { key: "winPercentage", label: "Win %" },
];

export function SplitTable({ rows, filename = "splits.csv" }: { rows: SplitStatRow[]; filename?: string }) {
    const [sort, setSort] = useState<{ key: keyof SplitStatRow; dir: "asc" | "desc" }>({ key: "matches", dir: "desc" });
    const sorted = useMemo(() => {
        return [...rows].sort((a, b) => {
            const left = a[sort.key];
            const right = b[sort.key];
            const av = left == null ? -Infinity : left;
            const bv = right == null ? -Infinity : right;
            if (typeof av === "string" && typeof bv === "string") {
                return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
            }
            return sort.dir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
        });
    }, [rows, sort]);

    const download = () => {
        const header = SPLIT_COLUMNS.map((column) => column.label).join(",");
        const body = sorted
            .map((row) => SPLIT_COLUMNS.map((column) => JSON.stringify(row[column.key] ?? "")).join(","))
            .join("\n");
        const blob = new Blob([`${header}\n${body}`], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (rows.length === 0) return <p className="text-sm text-muted-foreground">No rows for this split.</p>;

    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <div className="flex justify-end border-b border-border px-3 py-2">
                <button type="button" onClick={download} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold">
                    <Download size={14} aria-hidden /> Export CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            {SPLIT_COLUMNS.map((column) => (
                                <th key={column.key} className="px-3 py-2 text-left">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSort((current) => ({
                                                key: column.key,
                                                dir: current.key === column.key && current.dir === "desc" ? "asc" : "desc",
                                            }))
                                        }
                                        className="min-h-11 cursor-pointer text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        {column.label}
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((row) => (
                            <tr key={row.key} className="border-b border-border/50">
                                {SPLIT_COLUMNS.map((column) => (
                                    <td key={column.key} className="px-3 py-2 font-mono text-xs tabular-nums text-foreground first:font-sans first:text-sm first:font-semibold">
                                        {row[column.key] ?? "—"}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
            {message}
        </div>
    );
}

export function AnalyticsSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden>
            {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
            ))}
        </div>
    );
}

export function show(value: string | number | null | undefined): string {
    if (value == null || value === "") return "—";
    return String(value);
}
