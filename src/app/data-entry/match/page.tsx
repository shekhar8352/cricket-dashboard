"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MatchForm } from "@/components/forms";
import { MatchFormData, MatchListItem, SeriesListItem } from "@/types";
import { formatDate } from "@/lib/utils";

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

    const handleSubmit = async (formData: MatchFormData) => {
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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                        <Link href="/data-entry" className="hover:text-white">
                            Data Entry
                        </Link>
                        <span>/</span>
                        <span className="text-white">Matches</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Manage Matches</h1>
                    <p className="text-gray-400 mt-1">Create matches and enter performance data</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    {showForm ? "Cancel" : "+ New Match"}
                </button>
            </div>

            {/* Create Match Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Match</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-400">
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
            )}

            {/* Match List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Matches ({matches.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>No matches added yet.</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="text-blue-400 hover:underline mt-2"
                            >
                                Add your first match →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {matches.map((match) => (
                                <div
                                    key={match._id}
                                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                                >
                                    <Link
                                        href={`/data-entry/match/${match._id}`}
                                        className="flex-1 hover:opacity-80 transition-opacity"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl">
                                                🏏
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">
                                                    vs {match.opponent}
                                                </h3>
                                                <p className="text-sm text-gray-400">
                                                    {match.format} • {match.level}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(match.date)} • {match.venue}, {match.city}
                                                </p>
                                                {match.series && (
                                                    <p className="text-xs text-blue-400 mt-1">
                                                        📋 {match.series.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-3">
                                        {match.result && (
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded ${match.result === "won"
                                                        ? "bg-green-900/50 text-green-400"
                                                        : match.result === "lost"
                                                            ? "bg-red-900/50 text-red-400"
                                                            : "bg-gray-700 text-gray-300"
                                                    }`}
                                            >
                                                {match.result.toUpperCase()}
                                            </span>
                                        )}
                                        {match.hasPerformance ? (
                                            <span className="px-2 py-1 text-xs font-medium bg-emerald-900/50 text-emerald-400 rounded">
                                                ✓ Performance Added
                                            </span>
                                        ) : (
                                            <Link
                                                href={`/data-entry/match/${match._id}`}
                                                className="px-2 py-1 text-xs font-medium bg-amber-900/50 text-amber-400 rounded hover:bg-amber-800/50 transition-colors"
                                            >
                                                + Add Performance
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => handleDelete(match._id)}
                                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
