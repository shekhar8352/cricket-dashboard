"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MatchFormData, SeriesListItem } from "@/types";
import {
    MATCH_FORMATS,
    MATCH_LEVELS,
    VENUE_TYPES,
    MATCH_RESULTS,
    PITCH_TYPES,
    WEATHER_CONDITIONS
} from "@/lib/constants";
import {
    Calendar,
    Users,
    MapPin,
    Trophy,
    Save,
    ChevronRight,
    Cloud,
    LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";

const matchSchema = z.object({
    opponent: z.string().min(1, "Opponent name is required"),
    date: z.string().min(1, "Date is required"),
    format: z.enum(MATCH_FORMATS),
    level: z.enum(MATCH_LEVELS),
    venue: z.string().min(1, "Venue is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    teamRepresented: z.string().min(1, "Team represented is required"),
    venueType: z.enum(VENUE_TYPES).optional(),
    seriesId: z.string().optional(),
    result: z.enum(MATCH_RESULTS).optional(),
    pitchType: z.enum(PITCH_TYPES).optional(),
    weatherCondition: z.enum(WEATHER_CONDITIONS).optional(),
    notes: z.string().optional(),
});

interface MatchFormProps {
    initialData?: Partial<MatchFormData>;
    seriesList: SeriesListItem[];
    onSubmit: (data: MatchFormData) => void;
    isLoading?: boolean;
}

export function MatchForm({
    initialData,
    seriesList,
    onSubmit,
    isLoading,
}: MatchFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<MatchFormData>({
        resolver: zodResolver(matchSchema) as any,
        defaultValues: {
            ...initialData,
            date: initialData?.date
                ? new Date(initialData.date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            format: initialData?.format || "T20",
            level: initialData?.level || "club",
            venueType: initialData?.venueType || "home",
            country: initialData?.country || "India",
            teamRepresented: initialData?.teamRepresented || "",
            pitchType: initialData?.pitchType || "flat",
            weatherCondition: initialData?.weatherCondition || "sunny",
            notes: initialData?.notes || "",
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Users size={16} className="text-blue-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Match Details</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Opponent Team</label>
                            <input
                                {...register("opponent")}
                                placeholder="e.g. Mumbai Indians"
                                className={cn(
                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                    errors.opponent ? "border-red-500/50" : "border-white/10"
                                )}
                            />
                            {errors.opponent && (
                                <p className="text-xs text-red-400 font-medium">{errors.opponent.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Match Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        {...register("date")}
                                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Format</label>
                                <select
                                    {...register("format")}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                                >
                                    {MATCH_FORMATS.map((f) => (
                                        <option key={f} value={f} className="bg-gray-900">{f}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Match Level</label>
                                <select
                                    {...register("level")}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                                >
                                    {MATCH_LEVELS.map((l) => (
                                        <option key={l} value={l} className="bg-gray-900">
                                            {l.charAt(0).toUpperCase() + l.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Venue Type</label>
                                <select
                                    {...register("venueType")}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                                >
                                    {VENUE_TYPES.map((v) => (
                                        <option key={v} value={v} className="bg-gray-900">
                                            {v.charAt(0).toUpperCase() + v.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location & Context Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <MapPin size={16} className="text-emerald-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Venue & Context</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Ground/Stadium Name</label>
                            <input
                                {...register("venue")}
                                placeholder="e.g. Wankhede Stadium"
                                className={cn(
                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                    errors.venue ? "border-red-500/50" : "border-white/10"
                                )}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">City</label>
                            <input
                                {...register("city")}
                                placeholder="e.g. Mumbai"
                                className={cn(
                                    "w-full px-4 py-3 bg-white/5 border rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                    errors.city ? "border-red-500/50" : "border-white/10"
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Country</label>
                                <input
                                    {...register("country")}
                                    placeholder="e.g. India"
                                    className={cn(
                                        "w-full px-4 py-3 bg-white/5 border rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                        errors.country ? "border-red-500/50" : "border-white/10"
                                    )}
                                />
                                {errors.country && (
                                    <p className="text-xs text-red-400 font-medium">{errors.country.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Team Represented</label>
                                <input
                                    {...register("teamRepresented")}
                                    placeholder="e.g. Uttar Pradesh"
                                    className={cn(
                                        "w-full px-4 py-3 bg-white/5 border rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                                        errors.teamRepresented ? "border-red-500/50" : "border-white/10"
                                    )}
                                />
                                {errors.teamRepresented && (
                                    <p className="text-xs text-red-400 font-medium">{errors.teamRepresented.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                <Trophy size={14} className="text-amber-400" /> Part of Series
                            </label>
                            <select
                                {...register("seriesId")}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-gray-900">Independent Match</option>
                                {seriesList.map((s) => (
                                    <option key={s._id} value={s._id} className="bg-gray-900">
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Conditions Section */}
                <div className="space-y-6 md:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Cloud size={16} className="text-gray-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Conditions</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Pitch Condition</label>
                            <select
                                {...register("pitchType")}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                            >
                                {PITCH_TYPES.map((p) => (
                                    <option key={p} value={p} className="bg-gray-900">
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Weather</label>
                            <select
                                {...register("weatherCondition")}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                            >
                                {WEATHER_CONDITIONS.map((w) => (
                                    <option key={w} value={w} className="bg-gray-900">
                                        {w.charAt(0).toUpperCase() + w.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <LayoutDashboard size={16} className="text-purple-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Additional Information</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Notes (Optional)</label>
                            <textarea
                                {...register("notes")}
                                placeholder="Add any additional notes about the match..."
                                rows={4}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-gray-500 font-medium italic">
                    * You will be able to add detailed performance data in the next step.
                </p>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                >
                    {isLoading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                    ) : (
                        <>
                            <Save size={18} />
                            Create & Continue
                            <ChevronRight size={18} />
                        </>
                    )}
                </button>
            </div>
        </form >

    );
}
