"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { PerformanceFormData } from "@/types";
import { DISMISSAL_TYPES, DISMISSAL_LABELS } from "@/lib/constants";
import {
    Zap,
    Target,
    Shield,
    Crown,
    User,
    AlertCircle,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Zap size={16} className="text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        {...register(`${prefix}.didNotBat` as any)}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/50"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">DNB</span>
                </label>
            </div>

            {!watchDidNotBat ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Runs</label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.runs` as any, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Balls</label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.ballsFaced` as any, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">4s</label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.fours` as any, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">6s</label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.sixes` as any, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Dismissal</label>
                            <select
                                {...register(`${prefix}.dismissalType` as any)}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-gray-900">Select...</option>
                                {DISMISSAL_TYPES.map((type) => (
                                    <option key={type} value={type} className="bg-gray-900">
                                        {DISMISSAL_LABELS[type]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Position</label>
                            <input
                                type="number"
                                min="1"
                                max="11"
                                {...register(`${prefix}.battingPosition` as any, { valueAsNumber: true })}
                                placeholder="1-11"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Bowler</label>
                            <input
                                type="text"
                                {...register(`${prefix}.dismissalBowler` as any)}
                                placeholder="Name"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Fielder</label>
                            <input
                                type="text"
                                {...register(`${prefix}.dismissalFielder` as any)}
                                placeholder="Name"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl animate-in fade-in duration-500">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Did Not Bat</p>
                </div>
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
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-emerald-400" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">{title}</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                        type="checkbox"
                        {...register(`${prefix}.didNotBowl` as any)}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500/50"
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">DNB</span>
                </label>
            </div>

            {!watchDidNotBowl ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Overs</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                {...register(`${prefix}.overs` as any, { valueAsNumber: true })}
                                placeholder="0.0"
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Maidens</label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.maidens` as any, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Runs</label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.runsConceded` as any, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Wickets</label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.wickets` as any, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Wides</label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.wides` as any, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">No Balls</label>
                            <input
                                type="number"
                                min="0"
                                {...register(`${prefix}.noBalls` as any, { valueAsNumber: true })}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl animate-in fade-in duration-500">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Did Not Bowl</p>
                </div>
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
        <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Shield size={16} className="text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Fielding Impact</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Catches</label>
                    <input
                        type="number"
                        min="0"
                        {...register("fielding.catches", { valueAsNumber: true })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Run Outs</label>
                    <input
                        type="number"
                        min="0"
                        {...register("fielding.runOuts", { valueAsNumber: true })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 ml-1">Stumpings</label>
                    <input
                        type="number"
                        min="0"
                        {...register("fielding.stumpings", { valueAsNumber: true })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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
        <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <Crown size={16} className="text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">In-Match Roles</h3>
            </div>

            <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                        <input
                            type="checkbox"
                            {...register("isCaptain")}
                            className="peer w-6 h-6 rounded-lg border-white/10 bg-white/5 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all"
                        />
                        <Crown className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Captaincy</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                        <input
                            type="checkbox"
                            {...register("isWicketkeeper")}
                            className="peer w-6 h-6 rounded-lg border-white/10 bg-white/5 text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all"
                        />
                        <Shield className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Wicket Keeper</span>
                </label>
            </div>
        </div>
    );
}
