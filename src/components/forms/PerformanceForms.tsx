"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { InningsBattingFormData, InningsBowlingFormData, FieldingFormData, PerformanceFormData } from "@/types";
import { DISMISSAL_TYPES, DISMISSAL_LABELS } from "@/lib/constants";

// Batting Form Section
interface BattingFormProps {
    register: UseFormRegister<PerformanceFormData>;
    errors: FieldErrors<PerformanceFormData>;
    prefix: "batting" | "firstInningsBatting" | "secondInningsBatting";
    title: string;
    watchDidNotBat?: boolean;
}

export function BattingFormSection({
    register,
    errors,
    prefix,
    title,
    watchDidNotBat,
}: BattingFormProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>

            {/* Did Not Bat */}
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    {...register(`${prefix}.didNotBat` as keyof PerformanceFormData)}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Did Not Bat</span>
            </label>

            {!watchDidNotBat && (
                <>
                    {/* Runs & Balls */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Runs *
                            </label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.runs` as keyof PerformanceFormData, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Balls Faced *
                            </label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.ballsFaced` as keyof PerformanceFormData, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Boundaries */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Fours
                            </label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.fours` as keyof PerformanceFormData, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Sixes
                            </label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.sixes` as keyof PerformanceFormData, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Dismissal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Dismissal Type
                        </label>
                        <select
                            {...register(`${prefix}.dismissalType` as keyof PerformanceFormData)}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select...</option>
                            {DISMISSAL_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {DISMISSAL_LABELS[type]}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Dismissed By */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Bowler
                            </label>
                            <input
                                type="text"
                                {...register(`${prefix}.dismissalBowler` as keyof PerformanceFormData)}
                                placeholder="Bowler name"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Fielder
                            </label>
                            <input
                                type="text"
                                {...register(`${prefix}.dismissalFielder` as keyof PerformanceFormData)}
                                placeholder="Fielder name"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Batting Position */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Batting Position
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="11"
                            {...register(`${prefix}.battingPosition` as keyof PerformanceFormData, { valueAsNumber: true })}
                            placeholder="1-11"
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </>
            )}
        </div>
    );
}

// Bowling Form Section
interface BowlingFormProps {
    register: UseFormRegister<PerformanceFormData>;
    errors: FieldErrors<PerformanceFormData>;
    prefix: "bowling" | "firstInningsBowling" | "secondInningsBowling";
    title: string;
    watchDidNotBowl?: boolean;
}

export function BowlingFormSection({
    register,
    errors,
    prefix,
    title,
    watchDidNotBowl,
}: BowlingFormProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>

            {/* Did Not Bowl */}
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    {...register(`${prefix}.didNotBowl` as keyof PerformanceFormData)}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-300">Did Not Bowl</span>
            </label>

            {!watchDidNotBowl && (
                <>
                    {/* Overs & Maidens */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Overs *
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                {...register(`${prefix}.overs` as keyof PerformanceFormData, { valueAsNumber: true })}
                                placeholder="e.g., 4.0"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Maidens
                            </label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.maidens` as keyof PerformanceFormData, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Runs & Wickets */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Runs Conceded *
                            </label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.runsConceded` as keyof PerformanceFormData, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Wickets *
                            </label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.wickets` as keyof PerformanceFormData, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Extras */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Wides
                            </label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.wides` as keyof PerformanceFormData, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                No Balls
                            </label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.noBalls` as keyof PerformanceFormData, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Fielding Form Section
interface FieldingFormProps {
    register: UseFormRegister<PerformanceFormData>;
}

export function FieldingFormSection({ register }: FieldingFormProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Fielding</h3>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Catches
                    </label>
                    <input
                        type="number"
                        min="0"
                        {...register("fielding.catches", { valueAsNumber: true })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Run Outs
                    </label>
                    <input
                        type="number"
                        min="0"
                        {...register("fielding.runOuts", { valueAsNumber: true })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stumpings
                    </label>
                    <input
                        type="number"
                        min="0"
                        {...register("fielding.stumpings", { valueAsNumber: true })}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}

// Context Form Section (Captain/Keeper)
interface ContextFormProps {
    register: UseFormRegister<PerformanceFormData>;
}

export function ContextFormSection({ register }: ContextFormProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Match Context</h3>

            <div className="flex gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register("isCaptain")}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">Played as Captain</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        {...register("isWicketkeeper")}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-300">Played as Wicketkeeper</span>
                </label>
            </div>
        </div>
    );
}
