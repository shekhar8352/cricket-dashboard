"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { PageHeader } from "@/components/ui/SectionHeader";
import { formatDate } from "@/lib/utils";
import { MapPin, Trophy, Loader2, ClipboardList } from "lucide-react";
import { MatchListItem } from "@/types";

export default function MatchesPage() {
    const [matches, setMatches] = useState<MatchListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/matches");
            const data = await res.json();
            if (data.success) {
                setMatches(data.data);
            }
        } catch (err) {
            console.error("Error fetching matches:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(matches.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMatches = matches.slice(startIndex, startIndex + itemsPerPage);

    const wonCount = matches.filter((m) => m.result === "won").length;
    const lostCount = matches.filter((m) => m.result === "lost").length;
    const performanceCount = matches.filter((m) => m.hasPerformance).length;

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
                <p className="text-xs font-medium text-muted-foreground">Loading matches…</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="Records"
                title="Match history"
                description={`Read-only summary of ${matches.length} match${matches.length === 1 ? "" : "es"}. Add or edit matches from Data entry.`}
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

            {matches.length > 0 && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                    <Card variant="panel" className="p-0">
                        <CardContent className="mt-0 p-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Total
                            </p>
                            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
                                {matches.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card variant="panel" className="border-emerald-500/20 bg-emerald-500/[0.04] p-0">
                        <CardContent className="mt-0 p-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80">
                                Won
                            </p>
                            <p className="font-mono text-2xl font-semibold tabular-nums text-emerald-400">{wonCount}</p>
                        </CardContent>
                    </Card>
                    <Card variant="panel" className="border-red-500/20 bg-red-500/[0.04] p-0">
                        <CardContent className="mt-0 p-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-red-400/80">
                                Lost
                            </p>
                            <p className="font-mono text-2xl font-semibold tabular-nums text-red-400">{lostCount}</p>
                        </CardContent>
                    </Card>
                    <Card variant="panel" className="border-primary/25 bg-primary/5 p-0">
                        <CardContent className="mt-0 p-4">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                With performance
                            </p>
                            <p className="font-mono text-2xl font-semibold tabular-nums text-primary">{performanceCount}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="space-y-4">
                {matches.length === 0 ? (
                    <Card className="py-8 text-center">
                        <CardContent className="mt-0 text-muted-foreground">
                            <p>No matches yet.</p>
                            <Link
                                href="/data-entry/match"
                                className="mt-3 inline-block text-sm font-semibold text-primary hover:underline"
                            >
                                Add a match in Data entry
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <ul className="grid list-none gap-4 p-0" role="list">
                            {paginatedMatches.map((match) => (
                                <li key={match._id}>
                                    <Link
                                        href={`/matches/${match._id}`}
                                        className="block rounded-xl outline-none ring-offset-background transition-shadow hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                    <Card className="border-border/80">
                                        <CardContent className="mt-0 p-0">
                                            <div className="flex flex-col items-stretch md:flex-row">
                                                <div
                                                    className={`h-1 w-full md:h-auto md:w-1.5 md:min-h-[4rem] shrink-0 ${
                                                        match.result === "won"
                                                            ? "bg-emerald-500"
                                                            : match.result === "lost"
                                                              ? "bg-red-500"
                                                              : match.result === "draw" || match.result === "tie"
                                                                ? "bg-amber-500"
                                                                : "bg-muted-foreground/40"
                                                    }`}
                                                    aria-hidden
                                                />

                                                <div className="flex flex-1 flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                                                    <div className="min-w-0 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                                            <span className="text-primary">{match.format}</span>
                                                            <span aria-hidden>•</span>
                                                            <span>{formatDate(match.date)}</span>
                                                            {match.series ? (
                                                                <>
                                                                    <span aria-hidden>•</span>
                                                                    <span className="flex items-center gap-1 text-accent-foreground">
                                                                        <Trophy size={10} aria-hidden />
                                                                        {match.series.name}
                                                                    </span>
                                                                </>
                                                            ) : null}
                                                        </div>

                                                        <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                                                            vs {match.opponent}
                                                        </h3>

                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1.5">
                                                                <MapPin size={14} aria-hidden />
                                                                {match.venue}, {match.city}
                                                            </span>
                                                            {match.hasPerformance ? (
                                                                <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                                                    Performance logged
                                                                </span>
                                                            ) : (
                                                                <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                                                    No performance
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {match.result ? (
                                                        <div className="shrink-0 text-left md:text-right">
                                                            <p
                                                                className={`text-base font-semibold ${
                                                                    match.result === "won"
                                                                        ? "text-emerald-400"
                                                                        : match.result === "lost"
                                                                          ? "text-red-400"
                                                                          : "text-amber-400"
                                                                }`}
                                                            >
                                                                {match.result.toUpperCase()}
                                                            </p>
                                                            {match.resultMargin ? (
                                                                <p className="text-xs text-muted-foreground">
                                                                    {match.resultMargin}
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                    ) : null}
                                                </div>
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
                                    totalItems={matches.length}
                                    onItemsPerPageChange={handleItemsPerPageChange}
                                    itemsPerPageOptions={[5, 10, 20, 50]}
                                />
                            </Card>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
