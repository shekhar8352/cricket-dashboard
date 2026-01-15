"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Pagination, usePagination } from "@/components/ui/Pagination";
import { SeriesForm } from "@/components/forms";
import { SeriesFormData, SeriesListItem } from "@/types";
import { formatDate } from "@/lib/utils";
import {
    PlusCircle,
    ChevronLeft,
    Trophy,
    Globe,
    Calendar,
    Trash2,
    CheckCircle2,
    Activity,
    Layers,
    FileEdit
} from "lucide-react";

export default function SeriesPage() {
    const [series, setSeries] = useState<SeriesListItem[]>([]);
    const { 
        currentPage, 
        setCurrentPage, 
        itemsPerPage, 
        setItemsPerPage, 
        totalPages, 
        paginatedItems: paginatedSeries, 
        totalItems 
    } = usePagination(series, 5);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingSeries, setEditingSeries] = useState<SeriesListItem | null>(null);

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
            let res;
            if (editingSeries) {
                res = await fetch(`/api/series/${editingSeries._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            } else {
                res = await fetch("/api/series", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
            }

            const data = await res.json();

            if (data.success) {
                if (editingSeries) {
                    setSeries(series.map(s => s._id === editingSeries._id ? data.data : s));
                    setEditingSeries(null);
                } else {
                    setSeries([data.data, ...series]);
                }
                setShowForm(false);
            } else {
                setError(data.error || `Failed to ${editingSeries ? "update" : "create"} series`);
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

    const handleEdit = (seriesItem: SeriesListItem) => {
        setEditingSeries(seriesItem);
        setShowForm(true);
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: "smooth" });
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
                        <span className="text-white font-bold">Series</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Manage Series</h1>
                    <p className="text-gray-400 font-medium mt-1">Create and manage your career tournaments</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) setEditingSeries(null);
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${showForm
                        ? "bg-white/10 text-white"
                        : "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
                        }`}
                >
                    {showForm ? (
                        "Cancel"
                    ) : (
                        <>
                            <PlusCircle size={20} />
                            Add New Series
                        </>
                    )}
                </button>
            </div>

            {/* Create Series Form */}
            {showForm && (
                <div className="animate-in slide-in-from-top-4 duration-300">
                    <Card className="overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 p-6 border-b border-white/5">
                            <h2 className="text-xl font-black text-white">{editingSeries ? "Edit Series" : "Create New Series"}</h2>
                            <p className="text-gray-400 text-sm mt-1">{editingSeries ? "Update series details" : "Define the context for a group of matches."}</p>
                        </div>
                        <CardContent className="p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    {error}
                                </div>
                            )}
                            <SeriesForm
                                onSubmit={handleSubmit}
                                isLoading={isSubmitting}
                                initialData={editingSeries || undefined}
                                key={editingSeries ? editingSeries._id : "new"} // Force re-render on edit switch
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Series List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400/80">
                        Active & Past Series ({series.length})
                    </h2>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500"></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">Loading Series...</p>
                    </div>
                ) : series.length === 0 ? (
                    <Card className="p-16 text-center animate-float">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy size={40} className="text-gray-600" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">No series created</h3>
                        <p className="text-gray-400 max-w-sm mx-auto mb-8">
                            Group your matches under series and tournaments for better organization.
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                        >
                            Create Your First Series
                        </button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {paginatedSeries.map((s) => (
                            <div
                                key={s._id}
                                className="group relative glass-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500 shrink-0">
                                        🏆
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
                                                {s.name}
                                            </h3>
                                            <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg text-gray-400">
                                                {s.format}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-blue-400/60" />
                                                {formatDate(s.startDate)}
                                                {s.endDate && ` - ${formatDate(s.endDate)}`}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-indigo-400/80">
                                                <Globe size={14} />
                                                {s.hostCountry}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-pink-400/80">
                                                <Layers size={14} />
                                                {s.totalMatches} Matches
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 md:shrink-0">
                                    <div className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] rounded-lg border flex items-center gap-1.5 
                                        ${s.status === "completed"
                                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            : s.status === "ongoing"
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                : "bg-white/5 text-gray-400 border-white/10"
                                        }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${s.status === "completed" ? "bg-emerald-400" : s.status === "ongoing" ? "bg-blue-400" : "bg-gray-400"}`} />
                                        {s.status}
                                    </div>

                                    <button
                                        onClick={() => handleEdit(s)}
                                        className="p-2.5 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"
                                    >
                                        <FileEdit size={18} />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(s._id)}
                                        className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <Card className="bg-white/[0.02] border-white/5">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            totalItems={totalItems}
                            onItemsPerPageChange={setItemsPerPage}
                            itemsPerPageOptions={[5, 10, 20]}
                        />
                    </Card>
                )}
            </div>
        </div>
    );
}
