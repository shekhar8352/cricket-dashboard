"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar, Trophy, ChevronRight, Loader2 } from "lucide-react";
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

    // Pagination calculations
    const totalPages = Math.ceil(matches.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedMatches = matches.slice(startIndex, startIndex + itemsPerPage);

    // Stats calculations
    const wonCount = matches.filter((m) => m.result === "won").length;
    const lostCount = matches.filter((m) => m.result === "lost").length;
    const performanceCount = matches.filter((m) => m.hasPerformance).length;

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">
                    Loading Matches...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Match History</h1>
                    <p className="text-gray-400 mt-1">
                        All your recorded matches ({matches.length} total)
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href="/data-entry/match"
                        className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <ChevronRight size={16} /> Add Match
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            {matches.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                        <CardContent className="p-4">
                            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">Total</p>
                            <p className="text-2xl font-bold text-white">{matches.length}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-950/30 to-gray-900 border-green-900/30">
                        <CardContent className="p-4">
                            <p className="text-green-400/70 text-xs font-medium uppercase tracking-wider mb-1">Won</p>
                            <p className="text-2xl font-bold text-green-400">{wonCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-950/30 to-gray-900 border-red-900/30">
                        <CardContent className="p-4">
                            <p className="text-red-400/70 text-xs font-medium uppercase tracking-wider mb-1">Lost</p>
                            <p className="text-2xl font-bold text-red-400">{lostCount}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-950/30 to-gray-900 border-blue-900/30">
                        <CardContent className="p-4">
                            <p className="text-blue-400/70 text-xs font-medium uppercase tracking-wider mb-1">Performance Added</p>
                            <p className="text-2xl font-bold text-blue-400">{performanceCount}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Match List */}
            <div className="space-y-4">
                {matches.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12 text-gray-400">
                            <p>No matches recorded yet.</p>
                            <Link
                                href="/data-entry/match"
                                className="text-blue-400 hover:underline mt-2 inline-block"
                            >
                                Add your first match →
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4">
                            {paginatedMatches.map((match) => (
                                <Link
                                    href={`/data-entry/match/${match._id}`}
                                    key={match._id}
                                    className="block group"
                                >
                                    <Card className="hover:border-blue-500/30 transition-all hover:bg-white/[0.02]">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row items-stretch">
                                                {/* Status Strip */}
                                                <div className={`w-full md:w-2 h-2 md:h-auto ${match.result === 'won' ? 'bg-green-500' :
                                                        match.result === 'lost' ? 'bg-red-500' :
                                                            match.result === 'draw' || match.result === 'tie' ? 'bg-yellow-500' :
                                                                'bg-gray-600'
                                                    }`} />

                                                <div className="flex-1 p-5">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                                                        {/* Left: Main Info */}
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2 text-xs text-gray-400 uppercase tracking-wider font-medium">
                                                                <span className="text-blue-400">{match.format}</span>
                                                                <span>•</span>
                                                                <span>{formatDate(match.date)}</span>
                                                                {match.series && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <span className="text-purple-400 flex items-center gap-1">
                                                                            <Trophy size={10} />
                                                                            {match.series.name}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>

                                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                vs {match.opponent}
                                                            </h3>

                                                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                                                <span className="flex items-center gap-1.5">
                                                                    <MapPin size={14} />
                                                                    {match.venue}, {match.city}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Right: Result & Actions */}
                                                        <div className="flex items-center gap-6">
                                                            {match.result && (
                                                                <div className="text-right">
                                                                    <div className={`text-lg font-bold ${match.result === 'won' ? 'text-green-400' :
                                                                            match.result === 'lost' ? 'text-red-400' :
                                                                                'text-yellow-400'
                                                                        }`}>
                                                                        {match.result.toUpperCase()}
                                                                    </div>
                                                                    {match.resultMargin && (
                                                                        <div className="text-xs text-gray-500">
                                                                            {match.resultMargin}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <ChevronRight className="text-gray-600 group-hover:text-white transition-colors" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Card className="bg-white/[0.02] border-white/5">
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
