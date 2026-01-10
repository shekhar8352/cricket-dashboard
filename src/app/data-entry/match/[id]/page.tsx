"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
    BattingFormSection,
    BowlingFormSection,
    FieldingFormSection,
    ContextFormSection,
} from "@/components/forms";
import { MatchListItem, PerformanceFormData } from "@/types";
import { isMultiInningsFormat, MatchFormat } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import {
    ChevronLeft,
    Zap,
    Target,
    Shield,
    Crown,
    Save,
    ChevronRight,
    MapPin,
    Calendar,
    Trophy,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PerformanceEntryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [match, setMatch] = useState<MatchListItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const isMultiInnings = match ? isMultiInningsFormat(match.format as MatchFormat) : false;

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm<PerformanceFormData>({
        defaultValues: {
            matchId: id,
            fielding: { catches: 0, runOuts: 0, stumpings: 0 },
            isCaptain: false,
            isWicketkeeper: false,
        },
    });

    // Watch values for conditional rendering
    const watchBattingDNB = watch("batting.didNotBat");
    const watchBowlingDNB = watch("bowling.didNotBowl");
    const watch1stBatDNB = watch("firstInningsBatting.didNotBat");
    const watch2ndBatDNB = watch("secondInningsBatting.didNotBat");
    const watch1stBowlDNB = watch("firstInningsBowling.didNotBowl");
    const watch2ndBowlDNB = watch("secondInningsBowling.didNotBowl");

    // Fetch match and existing performance
    useEffect(() => {
        fetchMatch();
        fetchPerformance();
    }, [id]);

    const fetchMatch = async () => {
        try {
            const res = await fetch(`/api/matches/${id}`);
            const data = await res.json();
            if (data.success) {
                setMatch(data.data);
            }
        } catch (err) {
            console.error("Error fetching match:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPerformance = async () => {
        try {
            const res = await fetch(`/api/performances?matchId=${id}`);
            const data = await res.json();
            if (data.success && data.data) {
                // Pre-fill form with existing performance
                reset({
                    matchId: id,
                    batting: data.data.batting,
                    bowling: data.data.bowling,
                    firstInningsBatting: data.data.firstInningsBatting,
                    secondInningsBatting: data.data.secondInningsBatting,
                    firstInningsBowling: data.data.firstInningsBowling,
                    secondInningsBowling: data.data.secondInningsBowling,
                    fielding: data.data.fielding || { catches: 0, runOuts: 0, stumpings: 0 },
                    isCaptain: data.data.isCaptain,
                    isWicketkeeper: data.data.isWicketkeeper,
                });
            }
        } catch (err) {
            // No existing performance, that's fine
        }
    };

    const onSubmit = async (formData: PerformanceFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const res = await fetch("/api/performances", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/data-entry");
                }, 1500);
            } else {
                setError(data.error || "Failed to save performance");
            }
        } catch (err) {
            setError("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Tabs for multi-innings matches
    const tabs = isMultiInnings
        ? [
            { id: 0, label: "1st Batting", icon: Zap, color: "text-amber-400" },
            { id: 1, label: "1st Bowling", icon: Target, color: "text-emerald-400" },
            { id: 2, label: "2nd Batting", icon: Zap, color: "text-amber-400" },
            { id: 3, label: "2nd Bowling", icon: Target, color: "text-emerald-400" },
            { id: 4, label: "Fielding & Bio", icon: Shield, color: "text-indigo-400" },
        ]
        : [
            { id: 0, label: "Batting", icon: Zap, color: "text-amber-400" },
            { id: 1, label: "Bowling", icon: Target, color: "text-emerald-400" },
            { id: 2, label: "Fielding & Bio", icon: Shield, color: "text-indigo-400" },
        ];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 animate-pulse">Loading Match Context...</p>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy size={40} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Match not found</h3>
                <p className="text-gray-400 max-w-sm mx-auto mb-8">This match might have been deleted or moved.</p>
                <Link href="/data-entry/match" className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                    <ChevronLeft size={18} />
                    Back to matches
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <Link href="/data-entry" className="hover:text-white transition-colors">Data Entry</Link>
                        <span className="text-gray-600">/</span>
                        <Link href="/data-entry/match" className="hover:text-white transition-colors">Matches</Link>
                        <span className="text-gray-600">/</span>
                        <span className="text-white font-bold">Performance</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Match Performance</h1>
                    <p className="text-gray-400 font-medium mt-1">Record your stats and impact for this game</p>
                </div>

                <div className="glass-card px-6 py-4 rounded-2xl border-l-4 border-l-blue-500 flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400/80">Opponent</span>
                        <span className="text-xl font-black text-white">vs {match.opponent}</span>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Result</span>
                        <span className={cn(
                            "text-sm font-bold",
                            match.result === "won" ? "text-emerald-400" : match.result === "lost" ? "text-red-400" : "text-gray-400"
                        )}>
                            {match.result?.toUpperCase() || "PENDING"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Match Context Strip */}
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm font-medium text-gray-400 bg-white/5 border border-white/5 rounded-2xl px-6 py-3">
                <span className="flex items-center gap-2">
                    <Trophy size={14} className="text-amber-400/60" />
                    {match.format} • {match.level}
                </span>
                <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-blue-400/60" />
                    {formatDate(match.date)}
                </span>
                <span className="flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-400/60" />
                    {match.venue}, {match.city}
                </span>
            </div>

            {/* Notification Area */}
            {(success || error) && (
                <div className="animate-in slide-in-from-top-2">
                    {success ? (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-bold flex items-center gap-3">
                            <CheckCircle2 size={18} />
                            Performance saved successfully! Redirecting...
                        </div>
                    ) : (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center gap-3">
                            <Shield size={18} />
                            {error}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Side Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all text-left group",
                                activeTab === tab.id
                                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-[1.02]"
                                    : "bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                            )}
                        >
                            <tab.icon size={18} className={cn(
                                "transition-colors",
                                activeTab === tab.id ? "text-white" : tab.color
                            )} />
                            <span className="flex-1">{tab.label}</span>
                            {activeTab === tab.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </div>

                {/* Main Form Area */}
                <div className="lg:col-span-3">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Card className="min-h-[400px] flex flex-col">
                            <CardContent className="p-10 flex-1">
                                <div className="animate-in fade-in duration-500">
                                    {/* Single Innings - Batting */}
                                    {!isMultiInnings && activeTab === 0 && (
                                        <BattingFormSection
                                            register={register}
                                            errors={errors}
                                            prefix="batting"
                                            title="Batting Impact"
                                            watchDidNotBat={watchBattingDNB}
                                        />
                                    )}

                                    {/* Single Innings - Bowling */}
                                    {!isMultiInnings && activeTab === 1 && (
                                        <BowlingFormSection
                                            register={register}
                                            errors={errors}
                                            prefix="bowling"
                                            title="Bowling Impact"
                                            watchDidNotBowl={watchBowlingDNB}
                                        />
                                    )}

                                    {/* Single Innings - Fielding */}
                                    {!isMultiInnings && activeTab === 2 && (
                                        <div className="space-y-12">
                                            <FieldingFormSection register={register} />
                                            <div className="h-px bg-white/5" />
                                            <ContextFormSection register={register} />
                                        </div>
                                    )}

                                    {/* Multi Innings - Logic */}
                                    {isMultiInnings && activeTab === 0 && (
                                        <BattingFormSection
                                            register={register}
                                            errors={errors}
                                            prefix="firstInningsBatting"
                                            title="1st Innings Batting"
                                            watchDidNotBat={watch1stBatDNB}
                                        />
                                    )}
                                    {isMultiInnings && activeTab === 1 && (
                                        <BowlingFormSection
                                            register={register}
                                            errors={errors}
                                            prefix="firstInningsBowling"
                                            title="1st Innings Bowling"
                                            watchDidNotBowl={watch1stBowlDNB}
                                        />
                                    )}
                                    {isMultiInnings && activeTab === 2 && (
                                        <BattingFormSection
                                            register={register}
                                            errors={errors}
                                            prefix="secondInningsBatting"
                                            title="2nd Innings Batting"
                                            watchDidNotBat={watch2ndBatDNB}
                                        />
                                    )}
                                    {isMultiInnings && activeTab === 3 && (
                                        <BowlingFormSection
                                            register={register}
                                            errors={errors}
                                            prefix="secondInningsBowling"
                                            title="2nd Innings Bowling"
                                            watchDidNotBowl={watch2ndBowlDNB}
                                        />
                                    )}
                                    {isMultiInnings && activeTab === 4 && (
                                        <div className="space-y-12">
                                            <FieldingFormSection register={register} />
                                            <div className="h-px bg-white/5" />
                                            <ContextFormSection register={register} />
                                        </div>
                                    )}
                                </div>
                            </CardContent>

                            <div className="p-6 border-t border-white/5 bg-white/5 flex items-center justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                                    disabled={activeTab === 0}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={18} />
                                    Back
                                </button>

                                {activeTab === tabs.length - 1 ? (
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black rounded-xl transition-all shadow-xl shadow-emerald-600/20"
                                    >
                                        {isSubmitting ? (
                                            <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Save Career Entry
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab(Math.min(tabs.length - 1, activeTab + 1))}
                                        className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl transition-all"
                                    >
                                        Continue
                                        <ChevronRight size={18} />
                                    </button>
                                )}
                            </div>
                        </Card>
                    </form>
                </div>
            </div>
        </div>
    );
}
