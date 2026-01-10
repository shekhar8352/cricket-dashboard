"use client";

import { useForm } from "react-hook-form";
import { MatchFormData, SeriesListItem } from "@/types";
import {
    MATCH_FORMATS,
    MATCH_LEVELS,
    MATCH_RESULTS,
    HOME_AWAY_TYPES,
    PITCH_TYPES,
    TOSS_DECISIONS,
    MATCH_TYPE_OPTIONS,
} from "@/lib/constants";
import { formatDateForInput } from "@/lib/utils";

interface MatchFormProps {
    initialData?: Partial<MatchFormData>;
    seriesList?: SeriesListItem[];
    onSubmit: (data: MatchFormData) => Promise<void>;
    isLoading?: boolean;
}

export function MatchForm({
    initialData,
    seriesList = [],
    onSubmit,
    isLoading,
}: MatchFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MatchFormData>({
        defaultValues: {
            series: initialData?.series || "",
            format: initialData?.format || "T20",
            level: initialData?.level || "international",
            date: initialData?.date ? formatDateForInput(initialData.date) : "",
            venue: initialData?.venue || "",
            city: initialData?.city || "",
            country: initialData?.country || "",
            opponent: initialData?.opponent || "",
            teamRepresented: initialData?.teamRepresented || "",
            homeAway: initialData?.homeAway || undefined,
            result: initialData?.result || undefined,
            resultMargin: initialData?.resultMargin || "",
            pitchType: initialData?.pitchType || undefined,
            tossWinner: initialData?.tossWinner || "",
            tossDecision: initialData?.tossDecision || undefined,
            matchType: initialData?.matchType || undefined,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Series Selection */}
            {seriesList.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Series (Optional)
                    </label>
                    <select
                        {...register("series")}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">No Series</option>
                        {seriesList.map((series) => (
                            <option key={series._id} value={series._id}>
                                {series.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Format & Level */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Format *
                    </label>
                    <select
                        {...register("format", { required: true })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {MATCH_FORMATS.map((format) => (
                            <option key={format} value={format}>
                                {format}
                            </option>
                        ))}
                    </select>
                </div>

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
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Match Date *
                </label>
                <input
                    type="date"
                    {...register("date", { required: "Match date is required" })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.date && (
                    <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
                )}
            </div>

            {/* Venue Details */}
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Venue *
                    </label>
                    <input
                        type="text"
                        {...register("venue", { required: "Venue is required" })}
                        placeholder="e.g., Wankhede Stadium"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.venue && (
                        <p className="mt-1 text-sm text-red-400">{errors.venue.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                    </label>
                    <input
                        type="text"
                        {...register("city", { required: "City is required" })}
                        placeholder="e.g., Mumbai"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.city && (
                        <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country *
                    </label>
                    <input
                        type="text"
                        {...register("country", { required: "Country is required" })}
                        placeholder="e.g., India"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.country && (
                        <p className="mt-1 text-sm text-red-400">{errors.country.message}</p>
                    )}
                </div>
            </div>

            {/* Teams */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Opponent *
                    </label>
                    <input
                        type="text"
                        {...register("opponent", { required: "Opponent is required" })}
                        placeholder="e.g., Australia"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.opponent && (
                        <p className="mt-1 text-sm text-red-400">{errors.opponent.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Team Represented *
                    </label>
                    <input
                        type="text"
                        {...register("teamRepresented", { required: "Team is required" })}
                        placeholder="e.g., India"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.teamRepresented && (
                        <p className="mt-1 text-sm text-red-400">
                            {errors.teamRepresented.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Home/Away & Pitch */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Home/Away
                    </label>
                    <select
                        {...register("homeAway")}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        {HOME_AWAY_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Pitch Type
                    </label>
                    <select
                        {...register("pitchType")}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        {PITCH_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Toss */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Toss Winner
                    </label>
                    <input
                        type="text"
                        {...register("tossWinner")}
                        placeholder="Team name"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Toss Decision
                    </label>
                    <select
                        {...register("tossDecision")}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        {TOSS_DECISIONS.map((decision) => (
                            <option key={decision} value={decision}>
                                {decision.charAt(0).toUpperCase() + decision.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Result */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Result
                    </label>
                    <select
                        {...register("result")}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select...</option>
                        {MATCH_RESULTS.map((result) => (
                            <option key={result} value={result}>
                                {result.charAt(0).toUpperCase() + result.slice(1).replace("_", " ")}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Result Margin
                    </label>
                    <input
                        type="text"
                        {...register("resultMargin")}
                        placeholder="e.g., 5 wickets, 23 runs"
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Match Type */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Match Type
                </label>
                <select
                    {...register("matchType")}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select...</option>
                    {MATCH_TYPE_OPTIONS.map((type) => (
                        <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
                {isLoading ? "Saving..." : initialData ? "Update Match" : "Create Match"}
            </button>
        </form>
    );
}
