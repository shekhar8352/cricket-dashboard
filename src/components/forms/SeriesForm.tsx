"use client";

import { useForm } from "react-hook-form";
import { SeriesFormData } from "@/types";
import {
    SERIES_TYPES,
    SERIES_FORMATS,
    MATCH_LEVELS,
    SERIES_STATUSES,
} from "@/lib/constants";
import { formatDateForInput } from "@/lib/utils";
import {
    Trophy,
    Calendar,
    Globe,
    Users,
    Activity,
    Save,
    ChevronRight,
    Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SeriesFormProps {
    initialData?: Partial<SeriesFormData>;
    onSubmit: (data: SeriesFormData) => Promise<void>;
    isLoading?: boolean;
}

export function SeriesForm({ initialData, onSubmit, isLoading }: SeriesFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SeriesFormData>({
        defaultValues: {
            name: initialData?.name || "",
            type: initialData?.type || "bilateral",
            format: initialData?.format || "T20",
            level: initialData?.level || "international",
            startDate: initialData?.startDate
                ? formatDateForInput(initialData.startDate)
                : "",
            endDate: initialData?.endDate
                ? formatDateForInput(initialData.endDate)
                : "",
            hostCountry: initialData?.hostCountry || "",
            teams: initialData?.teams || [],
            totalMatches: initialData?.totalMatches || 1,
            status: initialData?.status || "upcoming",
            notes: initialData?.notes || "",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Trophy size={16} className="text-amber-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Series Identity</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Series/Tournament Name</label>
                            <input
                                {...register("name", { required: "Series name is required" })}
                                placeholder="e.g. Border-Gavaskar Trophy"
                                className={cn(
                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                    errors.name ? "border-red-500/50" : "border-white/10"
                                )}
                            />
                            {errors.name && (
                                <p className="text-xs text-red-400 font-medium">{errors.name.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Series Type</label>
                                <select
                                    {...register("type", { required: true })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                                >
                                    {SERIES_TYPES.map((type) => (
                                        <option key={type} value={type} className="bg-gray-900">
                                            {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Primary Format</label>
                                <select
                                    {...register("format", { required: true })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                                >
                                    {SERIES_FORMATS.map((format) => (
                                        <option key={format} value={format} className="bg-gray-900">{format}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Level</label>
                                <select
                                    {...register("level", { required: true })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                                >
                                    {MATCH_LEVELS.map((level) => (
                                        <option key={level} value={level} className="bg-gray-900">
                                            {level.charAt(0).toUpperCase() + level.slice(1).replace("-", " ")}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Current Status</label>
                                <select
                                    {...register("status")}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                                >
                                    {SERIES_STATUSES.map((status) => (
                                        <option key={status} value={status} className="bg-gray-900">
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule & Context Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Calendar size={16} className="text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Schedule & Context</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Start Date</label>
                                <input
                                    type="date"
                                    {...register("startDate", { required: "Start date is required" })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">End Date</label>
                                <input
                                    type="date"
                                    {...register("endDate")}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Globe size={14} className="text-blue-400" /> Host Country/Region
                            </label>
                            <input
                                {...register("hostCountry", { required: "Host country is required" })}
                                placeholder="e.g. Australia"
                                className={cn(
                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                    errors.hostCountry ? "border-red-500/50" : "border-white/10"
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Users size={14} className="text-indigo-400" /> Teams
                                </label>
                                <input
                                    {...register("teams", {
                                        required: "Teams are required",
                                        setValueAs: (v) => (typeof v === "string" ? v.split(",").map((t) => t.trim()) : v),
                                    })}
                                    placeholder="Team A, Team B..."
                                    className={cn(
                                        "w-full px-4 py-3 bg-white/5 border rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                        errors.teams ? "border-red-500/50" : "border-white/10"
                                    )}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <Layers size={14} className="text-pink-400" /> Matches
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    {...register("totalMatches", {
                                        required: "Total matches required",
                                        valueAsNumber: true,
                                        min: { value: 1, message: "Min 1" },
                                    })}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Activity size={16} className="text-purple-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Additional Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Notes (Optional)</label>
                            <textarea
                                {...register("notes")}
                                placeholder="Add any additional notes about the series..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500 font-medium italic">
                    * You can add individual matches to this series after creation.
                </p>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                    {isLoading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                    ) : (
                        <>
                            <Save size={18} />
                            {initialData ? "Update Series" : "Create Series"}
                            <ChevronRight size={18} />
                        </>
                    )}
                </button>
            </div>
        </form >
    );
}
