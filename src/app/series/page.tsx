"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/utils";
import { Users, Calendar, Trophy, Loader2, ClipboardList } from "lucide-react";

interface Series {
    _id: string;
    name: string;
    format: string;
    level: string;
    teams: string[];
    startDate: string;
    endDate?: string;
    status: "upcoming" | "ongoing" | "completed";
    winner?: string;
    totalMatches: number;
}

export default function SeriesPage() {
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(9);

    useEffect(() => {
        fetchSeries();
    }, []);

    const fetchSeries = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/series");
            const data = await res.json();
            if (data.success) {
                setSeriesList(data.data);
            }
        } catch (err) {
            console.error("Error fetching series:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(seriesList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSeries = seriesList.slice(startIndex, startIndex + itemsPerPage);

    const counts = useMemo(() => {
        return {
            total: seriesList.length,
            upcoming: seriesList.filter((s) => s.status === "upcoming").length,
            ongoing: seriesList.filter((s) => s.status === "ongoing").length,
            completed: seriesList.filter((s) => s.status === "completed").length,
            matchesPlanned: seriesList.reduce((acc, s) => acc + (s.totalMatches || 0), 0),
        };
    }, [seriesList]);

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
                <p className="text-xs font-medium text-muted-foreground">Loading series…</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="Records"
                title="Series & tournaments"
                description={`Read-only overview of ${counts.total} series. Create or edit series from Data entry.`}
                action={
                    <Link
                        href="/data-entry"
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                        <ClipboardList size={18} strokeWidth={1.75} aria-hidden />
                        Data entry
                    </Link>
                }
            />

            {seriesList.length > 0 && (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
                    <Card variant="panel" className="p-0">
                        <CardContent className="mt-0 p-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Total series
                            </p>
                            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">{counts.total}</p>
                        </CardContent>
                    </Card>
                    <Card variant="panel" className="border-sky-500/20 bg-sky-500/[0.04] p-0">
                        <CardContent className="mt-0 p-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-sky-400/90">
                                Upcoming
                            </p>
                            <p className="font-mono text-2xl font-semibold tabular-nums text-sky-400">{counts.upcoming}</p>
                        </CardContent>
                    </Card>
                    <Card variant="panel" className="border-emerald-500/20 bg-emerald-500/[0.04] p-0">
                        <CardContent className="mt-0 p-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80">
                                Ongoing
                            </p>
                            <p className="font-mono text-2xl font-semibold tabular-nums text-emerald-400">{counts.ongoing}</p>
                        </CardContent>
                    </Card>
                    <Card variant="panel" className="border-muted-foreground/25 bg-muted/20 p-0">
                        <CardContent className="mt-0 p-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Completed
                            </p>
                            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">{counts.completed}</p>
                        </CardContent>
                    </Card>
                    <Card variant="panel" className="border-primary/25 bg-primary/5 p-0 col-span-2 lg:col-span-1">
                        <CardContent className="mt-0 p-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Matches (planned)
                            </p>
                            <p className="font-mono text-2xl font-semibold tabular-nums text-primary">{counts.matchesPlanned}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {seriesList.length === 0 ? (
                <Card className="py-10 text-center">
                    <CardContent className="mt-0 space-y-4">
                        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden />
                        <div className="space-y-1 text-muted-foreground">
                            <p className="font-medium text-foreground">No series yet</p>
                            <p className="text-sm">Create a series in Data entry to group your matches.</p>
                        </div>
                        <Link
                            href="/data-entry/series"
                            className="inline-block text-sm font-semibold text-primary hover:underline"
                        >
                            Add a series in Data entry
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <ul className="grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 lg:grid-cols-3" role="list">
                        {paginatedSeries.map((series) => (
                            <li key={series._id}>
                                <Link
                                    href={`/series/${series._id}`}
                                    className="block h-full rounded-xl outline-none ring-offset-background transition-shadow hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                <Card className="h-full border-border/80">
                                    <CardHeader className="border-b border-border/60 pb-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                                                        series.status === "ongoing"
                                                            ? "bg-emerald-500/15 text-emerald-400"
                                                            : series.status === "completed"
                                                              ? "bg-muted text-muted-foreground"
                                                              : "bg-sky-500/15 text-sky-400"
                                                    }`}
                                                >
                                                    {series.status}
                                                </span>
                                                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                    {series.format}
                                                </span>
                                                <span className="rounded border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                                    {series.level}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg leading-snug">{series.name}</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-4">
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex items-start gap-3">
                                                <Users size={14} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden />
                                                <span>{series.teams.join(" vs ")}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar size={14} className="shrink-0 text-muted-foreground" aria-hidden />
                                                <span>
                                                    {formatDate(series.startDate)}
                                                    {series.endDate ? ` – ${formatDate(series.endDate)}` : ""}
                                                </span>
                                            </div>
                                            {series.winner ? (
                                                <div className="flex items-center gap-3 text-amber-500/90">
                                                    <Trophy size={14} aria-hidden />
                                                    <span>
                                                        Winner:{" "}
                                                        <span className="font-medium text-amber-400">{series.winner}</span>
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-border/60 pt-3 font-mono text-xs text-muted-foreground">
                                            <span className="tabular-nums">{series.totalMatches} matches</span>
                                        </div>
                                    </CardContent>
                                </Card>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <Card variant="panel" className="p-0">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                itemsPerPage={itemsPerPage}
                                totalItems={seriesList.length}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                itemsPerPageOptions={[6, 9, 12, 24]}
                            />
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
