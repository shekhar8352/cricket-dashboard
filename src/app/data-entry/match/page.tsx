"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MatchForm } from "@/components/forms";
import { MatchListItem, SeriesListItem } from "@/types";
import { formatDate } from "@/lib/utils";
import {
    PlusCircle,
    ChevronLeft,
    Trophy,
    Navigation,
    Calendar,
    Trash2,
    CheckCircle2,
    Clock
} from "lucide-react";

export default function MatchPage() {
    const router = useRouter();
    const [matches, setMatches] = useState<MatchListItem[]>([]);
    const [series, setSeries] = useState<SeriesListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch data
    useEffect(() => {
        Promise.all([fetchMatches(), fetchSeries()]);
    }, []);

    const fetchMatches = async () => {
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

    const fetchSeries = async () => {
        try {
            const res = await fetch("/api/series");
            const data = await res.json();
            if (data.success) {
                setSeries(data.data);
            }
        } catch (err) {
            console.error("Error fetching series:", err);
        }
    };

    const handleSubmit = async (formData: any) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                // Navigate to performance entry
                router.push(`/data-entry/match/${data.data._id}`);
            } else {
                setError(data.error || "Failed to create match");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this match and its performance?")) return;

        try {
            const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                setMatches(matches.filter((m) => m._id !== id));
            }
        } catch (err) {
            console.error("Error deleting match:", err);
        }
    };

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <Link href="/data-entry" className="flex items-center gap-1 hover:text-white transition-colors">
                            <ChevronLeft size={14} />
                            Data Entry
                        </Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-white font-bold">Matches</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Manage Matches</h1>
                    <p className="text-gray-400 font-medium mt-1">Create matches and enter performance data</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${showForm
                            ? "bg-white/10 text-white"
                            : "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500"
                        }`}
                >
                    {showForm ? (
                        "Cancel"
                    ) : (
                        <>
                            <PlusCircle size={20} />
                            Add New Match
                        </>
                    )}
                </button>
            </div>

            {/* Create Match Form */}
            {showForm && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600/20 to-emerald-600/20 p-6 border-b border-white/5">
                            <h2 className="text-xl font-black text-white">Create New Match</h2>
                            <p className="text-gray-400 text-sm mt-1">Enter the basic details of the match to begin.</p>
                        </div>
                        <CardContent className="p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    {error}
                                </div>
                            )}
                            <MatchForm
                                seriesList={series}
                                onSubmit={handleSubmit}
                                isLoading={isSubmitting}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Match List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80">
                        Match History ({matches.length})
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">Loading Matches...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <Card className="p-16 text-center animate-float">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy size={40} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">No matches found</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-8">
                            Start your cricket journey by adding your first match performance.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        >
                            Add Your First Match
                        </button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {matches.map((match) => (
                            <div
                                key={match._id}
                                className="group relative glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                                        🏏
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">
                                                vs {match.opponent}
                                            </h3>
                                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg text-gray-400">
                                                {match.format}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-blue-400/60" />
                                                {formatDate(match.date)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Navigation size={14} className="text-emerald-400/60" />
                                                {match.venue}, {match.city}
                                            </span>
                                            {match.series && (
                                                <span className="flex items-center gap-1.5 text-amber-400/80">
                                                    <Trophy size={14} />
                                                    {match.series.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 md:shrink-0">
                                    {match.result && (
                                        <div className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg border flex items-center gap-1.5 
                                            ${match.result === "won"
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : match.result === "lost"
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                    : "bg-white/5 text-gray-400 border-white/10"
                                            }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${match.result === "won" ? "bg-emerald-400" : match.result === "lost" ? "bg-red-400" : "bg-gray-400"}`} />
                                            {match.result}
                                        </div>
                                    )}

                                    {match.hasPerformance ? (
                                        <Link
                                            href={`/data-entry/match/${match._id}`}
                                            className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all flex items-center gap-2"
                                        >
                                            <CheckCircle2 size={12} />
                                            View Performance
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/data-entry/match/${match._id}`}
                                            className="px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg animate-pulse hover:bg-amber-500/20 transition-all flex items-center gap-2"
                                        >
                                            <Clock size={12} />
                                            Pending Performance
                                        </Link>
                                    )}

                                    <button
                                        onClick={() => handleDelete(match._id)}
                                        className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
