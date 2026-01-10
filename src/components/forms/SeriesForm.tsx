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
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Series Name */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Series Name *
                </label>
                <input
                    type="text"
                    {...register("name", { required: "Series name is required" })}
                    placeholder="e.g., India vs Australia 2024"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                )}
            </div>

            {/* Type & Format */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Series Type *
                    </label>
                    <select
                        {...register("type", { required: true })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {SERIES_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Format *
                    </label>
                    <select
                        {...register("format", { required: true })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {SERIES_FORMATS.map((format) => (
                            <option key={format} value={format}>
                                {format}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Level & Status */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Level *
                    </label>
                    <select
                        {...register("level", { required: true })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {MATCH_LEVELS.map((level) => (
                            <option key={level} value={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1).replace("-", " ")}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                    </label>
                    <select
                        {...register("status")}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {SERIES_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Start Date *
                    </label>
                    <input
                        type="date"
                        {...register("startDate", { required: "Start date is required" })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.startDate && (
                        <p className="mt-1 text-sm text-red-400">{errors.startDate.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date
                    </label>
                    <input
                        type="date"
                        {...register("endDate")}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Host Country */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Host Country *
                </label>
                <input
                    type="text"
                    {...register("hostCountry", { required: "Host country is required" })}
                    placeholder="e.g., India"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.hostCountry && (
                    <p className="mt-1 text-sm text-red-400">{errors.hostCountry.message}</p>
                )}
            </div>

            {/* Teams (comma-separated) */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Teams (comma-separated) *
                </label>
                <input
                    type="text"
                    {...register("teams", {
                        required: "Teams are required",
                        setValueAs: (v) => (typeof v === "string" ? v.split(",").map((t) => t.trim()) : v),
                    })}
                    placeholder="e.g., India, Australia"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.teams && (
                    <p className="mt-1 text-sm text-red-400">{errors.teams.message}</p>
                )}
            </div>

            {/* Total Matches */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Matches *
                </label>
                <input
                    type="number"
                    min="1"
                    {...register("totalMatches", {
                        required: "Total matches is required",
                        valueAsNumber: true,
                        min: { value: 1, message: "Minimum 1 match required" },
                    })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.totalMatches && (
                    <p className="mt-1 text-sm text-red-400">{errors.totalMatches.message}</p>
                )}
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
                {isLoading ? "Saving..." : initialData ? "Update Series" : "Create Series"}
            </button>
        </form>
    );
}
