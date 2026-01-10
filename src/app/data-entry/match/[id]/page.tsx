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
            { id: 0, label: "1st Innings Batting" },
            { id: 1, label: "1st Innings Bowling" },
            { id: 2, label: "2nd Innings Batting" },
            { id: 3, label: "2nd Innings Bowling" },
            { id: 4, label: "Fielding & Context" },
        ]
        : [
            { id: 0, label: "Batting" },
            { id: 1, label: "Bowling" },
            { id: 2, label: "Fielding & Context" },
        ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Match not found</p>
                <Link href="/data-entry/match" className="text-blue-400 hover:underline mt-2 inline-block">
                    Back to matches →
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Link href="/data-entry" className="hover:text-white">
                        Data Entry
                    </Link>
                    <span>/</span>
                    <Link href="/data-entry/match" className="hover:text-white">
                        Matches
                    </Link>
                    <span>/</span>
                    <span className="text-white">Performance</span>
                </div>
                <h1 className="text-3xl font-bold text-white">Enter Performance</h1>
            </div>

            {/* Match Info Card */}
            <Card variant="highlight">
                <CardContent className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center text-3xl">
                        🏏
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">vs {match.opponent}</h2>
                        <p className="text-gray-400">
                            {match.format} • {match.level} • {formatDate(match.date)}
                        </p>
                        <p className="text-gray-500 text-sm">
                            {match.venue}, {match.city}, {match.country}
                        </p>
                    </div>
                    {match.result && (
                        <span
                            className={`ml-auto px-4 py-2 text-sm font-medium rounded-lg ${match.result === "won"
                                    ? "bg-green-900/50 text-green-400"
                                    : match.result === "lost"
                                        ? "bg-red-900/50 text-red-400"
                                        : "bg-gray-700 text-gray-300"
                                }`}
                        >
                            {match.result.toUpperCase()}
                        </span>
                    )}
                </CardContent>
            </Card>

            {/* Success Message */}
            {success && (
                <div className="p-4 bg-green-900/50 border border-green-800 rounded-lg text-green-400">
                    ✓ Performance saved successfully! Redirecting...
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg text-red-400">
                    {error}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.id
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card>
                    <CardContent>
                        {/* Single Innings - Batting */}
                        {!isMultiInnings && activeTab === 0 && (
                            <BattingFormSection
                                register={register}
                                errors={errors}
                                prefix="batting"
                                title="Batting Performance"
                                watchDidNotBat={watchBattingDNB}
                            />
                        )}

                        {/* Single Innings - Bowling */}
                        {!isMultiInnings && activeTab === 1 && (
                            <BowlingFormSection
                                register={register}
                                errors={errors}
                                prefix="bowling"
                                title="Bowling Performance"
                                watchDidNotBowl={watchBowlingDNB}
                            />
                        )}

                        {/* Single Innings - Fielding */}
                        {!isMultiInnings && activeTab === 2 && (
                            <div className="space-y-8">
                                <FieldingFormSection register={register} />
                                <hr className="border-gray-700" />
                                <ContextFormSection register={register} />
                            </div>
                        )}

                        {/* Multi Innings - 1st Batting */}
                        {isMultiInnings && activeTab === 0 && (
                            <BattingFormSection
                                register={register}
                                errors={errors}
                                prefix="firstInningsBatting"
                                title="1st Innings Batting"
                                watchDidNotBat={watch1stBatDNB}
                            />
                        )}

                        {/* Multi Innings - 1st Bowling */}
                        {isMultiInnings && activeTab === 1 && (
                            <BowlingFormSection
                                register={register}
                                errors={errors}
                                prefix="firstInningsBowling"
                                title="1st Innings Bowling"
                                watchDidNotBowl={watch1stBowlDNB}
                            />
                        )}

                        {/* Multi Innings - 2nd Batting */}
                        {isMultiInnings && activeTab === 2 && (
                            <BattingFormSection
                                register={register}
                                errors={errors}
                                prefix="secondInningsBatting"
                                title="2nd Innings Batting"
                                watchDidNotBat={watch2ndBatDNB}
                            />
                        )}

                        {/* Multi Innings - 2nd Bowling */}
                        {isMultiInnings && activeTab === 3 && (
                            <BowlingFormSection
                                register={register}
                                errors={errors}
                                prefix="secondInningsBowling"
                                title="2nd Innings Bowling"
                                watchDidNotBowl={watch2ndBowlDNB}
                            />
                        )}

                        {/* Multi Innings - Fielding */}
                        {isMultiInnings && activeTab === 4 && (
                            <div className="space-y-8">
                                <FieldingFormSection register={register} />
                                <hr className="border-gray-700" />
                                <ContextFormSection register={register} />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Navigation & Submit */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                        disabled={activeTab === 0}
                        className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                        ← Previous
                    </button>

                    {activeTab === tabs.length - 1 ? (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                        >
                            {isSubmitting ? "Saving..." : "Save Performance"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setActiveTab(Math.min(tabs.length - 1, activeTab + 1))}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                        >
                            Next →
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
