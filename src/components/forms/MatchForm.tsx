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
    WEATHER_CONDITIONS,
    MATCH_TYPE_OPTIONS,
    TOSS_DECISIONS
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
    resultMargin: z.string().optional(),
    tossWinner: z.string().optional(),
    tossDecision: z.enum(TOSS_DECISIONS).optional(),
    matchType: z.enum(MATCH_TYPE_OPTIONS).optional(),
    pitchType: z.enum(PITCH_TYPES).optional(),
    weatherCondition: z.enum(WEATHER_CONDITIONS).optional(),
    notes: z.string().optional(),
    battingOrder: z.string().optional(),
    session: z.string().optional(),
    targetText: z.string().optional(),
    teamRuns: z.string().optional(),
    teamWickets: z.string().optional(),
    teamOvers: z.string().optional(),
    oppRuns: z.string().optional(),
    oppWickets: z.string().optional(),
    oppOvers: z.string().optional(),
});

type MatchFormValues = z.infer<typeof matchSchema>;

function toNumber(value?: string): number | undefined {
    if (value == null || value.trim() === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

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
    } = useForm<MatchFormValues>({
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
            result: initialData?.result,
            resultMargin: initialData?.resultMargin || "",
            tossWinner: initialData?.tossWinner || "",
            tossDecision: initialData?.tossDecision,
            matchType: initialData?.matchType,
            pitchType: initialData?.pitchType || "flat",
            weatherCondition: initialData?.weatherCondition || "sunny",
            notes: initialData?.notes || "",
        },
    });

    return (
        <form
            onSubmit={handleSubmit((values) => {
                const teamRuns = toNumber(values.teamRuns);
                const teamWickets = toNumber(values.teamWickets);
                const teamOvers = toNumber(values.teamOvers);
                const oppRuns = toNumber(values.oppRuns);
                const oppWickets = toNumber(values.oppWickets);
                const oppOvers = toNumber(values.oppOvers);
                const payload: MatchFormData = {
                    opponent: values.opponent,
                    date: values.date,
                    format: values.format,
                    level: values.level,
                    venue: values.venue,
                    city: values.city,
                    country: values.country,
                    teamRepresented: values.teamRepresented,
                    venueType: values.venueType,
                    seriesId: values.seriesId,
                    result: values.result,
                    resultMargin: values.resultMargin,
                    tossWinner: values.tossWinner,
                    tossDecision: values.tossDecision,
                    matchType: values.matchType,
                    pitchType: values.pitchType,
                    weatherCondition: values.weatherCondition,
                    notes: values.notes,
                    battedFirst: values.battingOrder === "bat" ? true : values.battingOrder === "bowl" ? false : undefined,
                    dayNight: values.session === "night" ? true : values.session === "day" ? false : undefined,
                    target: toNumber(values.targetText),
                    teamScore:
                        teamRuns != null || teamWickets != null || teamOvers != null
                            ? { runs: teamRuns ?? 0, wickets: teamWickets ?? 0, overs: teamOvers ?? 0 }
                            : undefined,
                    opponentScore:
                        oppRuns != null || oppWickets != null || oppOvers != null
                            ? { runs: oppRuns ?? 0, wickets: oppWickets ?? 0, overs: oppOvers ?? 0 }
                            : undefined,
                };
                onSubmit(payload);
            })}
            className="space-y-8"
        >
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

                {/* Match Result & Toss Section */}
                <div className="space-y-6 md:col-span-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                        <Trophy size={16} className="text-yellow-400" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Result & Toss</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Match Result</label>
                            <select
                                {...register("result")}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-gray-900">Not Set</option>
                                {MATCH_RESULTS.map((r) => (
                                    <option key={r} value={r} className="bg-gray-900">
                                        {r.charAt(0).toUpperCase() + r.slice(1).replace("_", " ")}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Result Margin</label>
                            <input
                                {...register("resultMargin")}
                                placeholder="e.g. by 5 wickets"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Toss Winner</label>
                            <input
                                {...register("tossWinner")}
                                placeholder="e.g. India"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Toss Decision</label>
                            <select
                                {...register("tossDecision")}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-gray-900">Not Set</option>
                                {TOSS_DECISIONS.map((t) => (
                                    <option key={t} value={t} className="bg-gray-900">
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Match Type</label>
                            <select
                                {...register("matchType")}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-gray-900">Not Set</option>
                                {MATCH_TYPE_OPTIONS.map((m) => (
                                    <option key={m} value={m} className="bg-gray-900">
                                        {m.charAt(0).toUpperCase() + m.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-6 md:col-span-2">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                        <Trophy size={16} className="text-primary" />
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Scores</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <label htmlFor="batting-order" className="text-sm font-medium text-foreground">Who batted first</label>
                            <select id="batting-order" {...register("battingOrder")} className="min-h-11 w-full cursor-pointer rounded-xl border border-border bg-background px-4 py-3 text-foreground">
                                <option value="">Not set</option>
                                <option value="bat">We batted first</option>
                                <option value="bowl">We bowled first</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="session" className="text-sm font-medium text-foreground">Session</label>
                            <select id="session" {...register("session")} className="min-h-11 w-full cursor-pointer rounded-xl border border-border bg-background px-4 py-3 text-foreground">
                                <option value="">Not set</option>
                                <option value="day">Day</option>
                                <option value="night">Day/night</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="target" className="text-sm font-medium text-foreground">Target</label>
                            <input id="target" type="number" min="0" {...register("targetText")} className="min-h-11 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
                        {(
                            [
                                ["teamRuns", "Our runs"],
                                ["teamWickets", "Our wickets"],
                                ["teamOvers", "Our overs"],
                                ["oppRuns", "Their runs"],
                                ["oppWickets", "Their wickets"],
                                ["oppOvers", "Their overs"],
                            ] as const
                        ).map(([name, label]) => (
                            <div key={name} className="space-y-2">
                                <label htmlFor={name} className="text-sm font-medium text-foreground">{label}</label>
                                <input id={name} type="number" min="0" step={name.includes("Overs") ? "0.1" : "1"} {...register(name)} className="min-h-11 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground" />
                            </div>
                        ))}
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
