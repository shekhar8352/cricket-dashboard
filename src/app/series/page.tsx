"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { formatDate } from "@/lib/utils";
import { Users, Calendar, Trophy, ChevronRight, Loader2 } from "lucide-react";

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
    const [itemsPerPage, setItemsPerPage] = useState(9); // 9 for 3x3 grid

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

    // Pagination calculations
    const totalPages = Math.ceil(seriesList.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedSeries = seriesList.slice(startIndex, startIndex + itemsPerPage);

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">
                    Loading Series...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Series & Tournaments</h1>
                    <p className="text-gray-400 mt-1">
                        Manage and view all your cricket series ({seriesList.length} total)
                    </p>
                </div>
                <Link
                    href="/data-entry/series"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 w-fit"
                >
                    <ChevronRight size={16} /> Add Series
                </Link>
            </div>

            {/* Series List Grid */}
            {seriesList.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white/5 rounded-xl border border-white/5">
                    <Trophy size={48} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-lg font-medium text-gray-300">No series found</p>
                    <p className="text-sm mb-6">Create your first series to start tracking matches.</p>
                    <Link
                        href="/data-entry/series"
                        className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2"
                    >
                        Create New Series <ChevronRight size={16} />
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedSeries.map((series) => (
                            <Card key={series._id} className="hover:border-blue-500/30 transition-colors group">
                                <CardHeader className="pb-3 border-b border-white/5">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${series.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                                                        series.status === 'completed' ? 'bg-gray-700 text-gray-400' :
                                                            'bg-blue-500/20 text-blue-400'
                                                    }`}>
                                                    {series.status}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-white/5 rounded">
                                                    {series.format}
                                                </span>
                                            </div>
                                            <CardTitle className="text-lg group-hover:text-blue-400 transition-colors">
                                                {series.name}
                                            </CardTitle>
                                        </div>
                                        <Link
                                            href={`/data-entry/series?id=${series._id}`}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        >
                                            <ChevronRight size={18} />
                                        </Link>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-2 text-sm text-gray-400">
                                        <div className="flex items-center gap-3">
                                            <Users size={14} className="text-gray-500" />
                                            <span>{series.teams.join(" vs ")}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar size={14} className="text-gray-500" />
                                            <span>{formatDate(series.startDate)}</span>
                                        </div>
                                        {series.winner && (
                                            <div className="flex items-center gap-3 text-yellow-500/80">
                                                <Trophy size={14} />
                                                <span>Winner: <span className="text-yellow-400 font-medium">{series.winner}</span></span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-2 flex items-center justify-between text-xs text-gray-500 font-mono">
                                        <span>{series.totalMatches} Matches</span>
                                        <span>{series.level}</span>
                                    </div>
                                </CardContent>
                            </Card>
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
