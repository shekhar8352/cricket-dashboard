"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SeriesForm } from "@/components/forms";
import { SeriesFormData, SeriesListItem } from "@/types";
import { formatDate } from "@/lib/utils";

export default function SeriesPage() {
    const [series, setSeries] = useState<SeriesListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch series
    useEffect(() => {
        fetchSeries();
    }, []);

    const fetchSeries = async () => {
        try {
            const res = await fetch("/api/series");
            const data = await res.json();
            if (data.success) {
                setSeries(data.data);
            }
        } catch (err) {
            console.error("Error fetching series:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (formData: SeriesFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/series", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                setSeries([data.data, ...series]);
                setShowForm(false);
            } else {
                setError(data.error || "Failed to create series");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this series?")) return;

        try {
            const res = await fetch(`/api/series/${id}`, { method: "DELETE" });
            const data = await res.json();

            if (data.success) {
                setSeries(series.filter((s) => s._id !== id));
            }
        } catch (err) {
            console.error("Error deleting series:", err);
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
                        <span className="text-white">Series</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Manage Series</h1>
                    <p className="text-gray-400 mt-1">Create and manage series and tournaments</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                    {showForm ? "Cancel" : "+ New Series"}
                </button>
            </div>

            {/* Create Series Form */}
            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Series</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-400">
                                {error}
                            </div>
                        )}
                        <SeriesForm onSubmit={handleSubmit} isLoading={isSubmitting} />
                    </CardContent>
                </Card>
            )}

            {/* Series List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Series ({series.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : series.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>No series created yet.</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="text-blue-400 hover:underline mt-2"
                            >
                                Create your first series →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {series.map((s) => (
                                <div
                                    key={s._id}
                                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                                >
                                    <div>
                                        <h3 className="font-medium text-white">{s.name}</h3>
                                        <p className="text-sm text-gray-400">
                                            {s.format} • {s.type} • {s.level}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(s.startDate)}
                                            {s.endDate && ` - ${formatDate(s.endDate)}`} • {s.hostCountry}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded ${s.status === "completed"
                                                    ? "bg-green-900/50 text-green-400"
                                                    : s.status === "ongoing"
                                                        ? "bg-blue-900/50 text-blue-400"
                                                        : "bg-gray-700 text-gray-300"
                                                }`}
                                        >
                                            {s.status}
                                        </span>
                                        <span className="text-gray-400 text-sm">
                                            {s.totalMatches} matches
                                        </span>
                                        <button
                                            onClick={() => handleDelete(s._id)}
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
