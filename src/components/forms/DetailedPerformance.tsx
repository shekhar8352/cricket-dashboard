"use client";

import { useEffect, useState } from "react";
import {
    Control,
    UseFormGetValues,
    UseFormRegister,
    UseFormSetValue,
    useFieldArray,
    useWatch,
} from "react-hook-form";
import {
    BOWLER_TYPES,
    BOWLER_TYPE_LABELS,
    DELIVERY_LENGTHS,
    DELIVERY_LENGTH_LABELS,
    DELIVERY_LINES,
    DELIVERY_LINE_LABELS,
    DISMISSAL_TYPES,
    DISMISSAL_LABELS,
    PHASE_LABELS,
    SHOTS,
    SHOT_LABELS,
    SHOT_ZONES,
    phasesForFormat,
} from "@/lib/constants";
import { battingConsistencyWarnings, bowlingConsistencyWarnings } from "@/lib/performance-warnings";
import type { PerformanceFormData } from "@/types";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass =
    "min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

type BatPrefix = "batting" | "firstInningsBatting" | "secondInningsBatting";
type BowlPrefix = "bowling" | "firstInningsBowling" | "secondInningsBowling";

function Warnings({ items }: { items: string[] }) {
    if (items.length === 0) return null;
    return (
        <ul className="space-y-1 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            {items.map((item) => (
                <li key={item}>{item} Saving is still allowed.</li>
            ))}
        </ul>
    );
}

function Panel({
    title,
    defaultOpen,
    children,
}: {
    title: string;
    defaultOpen: boolean;
    children: React.ReactNode;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl border border-border">
            <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
                className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left"
            >
                <span className="text-sm font-semibold text-foreground">{title}</span>
                <ChevronDown size={16} className={cn("text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>
            {open ? <div className="space-y-6 border-t border-border px-4 py-5">{children}</div> : null}
        </div>
    );
}

export function DetailedBattingSection({
    register,
    control,
    setValue,
    getValues,
    prefix,
    format,
    defaultOpen,
    hidden,
}: {
    register: UseFormRegister<PerformanceFormData>;
    control: Control<PerformanceFormData>;
    setValue: UseFormSetValue<PerformanceFormData>;
    getValues: UseFormGetValues<PerformanceFormData>;
    prefix: BatPrefix;
    format: string;
    defaultOpen: boolean;
    hidden?: boolean;
}) {
    const phases = phasesForFormat(format);
    const watched = useWatch({ control, name: prefix });
    const partnerships = useFieldArray({
        control,
        name: `${prefix}.detail.partnerships` as "batting.detail.partnerships",
    });

    useEffect(() => {
        const current = getValues(`${prefix}.detail.phases` as "batting.detail.phases");
        if (!current || current.length === 0) {
            setValue(
                `${prefix}.detail.phases` as "batting.detail.phases",
                phases.map((phase) => ({ phase: phase.id })),
                { shouldDirty: false }
            );
        }
        // Seed once per innings/format so empty advanced sections stay optional on save.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefix, format]);

    if (hidden) return null;

    return (
        <Panel title="Advanced batting stats" defaultOpen={defaultOpen}>
            <Warnings items={battingConsistencyWarnings(watched)} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(
                    [
                        ["dots", "Dots"],
                        ["singles", "1s"],
                        ["twos", "2s"],
                        ["threes", "3s"],
                        ["minutesBatted", "Minutes"],
                        ["ballsTo50", "Balls to 50"],
                        ["ballsTo100", "Balls to 100"],
                    ] as const
                ).map(([key, label]) => (
                    <div key={key} className="space-y-1.5">
                        <label htmlFor={`${prefix}-${key}`} className={labelClass}>
                            {label}
                        </label>
                        <input
                            id={`${prefix}-${key}`}
                            type="number"
                            min="0"
                            {...register(`${prefix}.detail.${key}` as "batting.detail.dots", { valueAsNumber: true })}
                            className={inputClass}
                        />
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
                {(
                    [
                        ["entryTeamScore", "Score on arrival"],
                        ["entryWickets", "Wickets down"],
                        ["entryOver", "Over on arrival"],
                    ] as const
                ).map(([key, label]) => (
                    <div key={key} className="space-y-1.5">
                        <label htmlFor={`${prefix}-${key}`} className={labelClass}>
                            {label}
                        </label>
                        <input
                            id={`${prefix}-${key}`}
                            type="number"
                            min="0"
                            step={key === "entryOver" ? "0.1" : "1"}
                            {...register(`${prefix}.detail.${key}` as "batting.detail.entryOver", { valueAsNumber: true })}
                            className={inputClass}
                        />
                    </div>
                ))}
            </div>

            <div className="space-y-3">
                <h4 className={labelClass}>Phases</h4>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                                <th className="py-2 pr-3">Phase</th>
                                <th className="py-2 pr-3">Runs</th>
                                <th className="py-2 pr-3">Balls</th>
                                <th className="py-2 pr-3">4s</th>
                                <th className="py-2 pr-3">6s</th>
                                <th className="py-2">Dots</th>
                            </tr>
                        </thead>
                        <tbody>
                            {phases.map((phase, index) => (
                                <tr key={phase.id}>
                                    <td className="py-1.5 pr-3 text-foreground">
                                        {phase.label}
                                        <span className="ml-2 text-xs text-muted-foreground">{phase.range}</span>
                                        <input
                                            type="hidden"
                                            {...register(`${prefix}.detail.phases.${index}.phase` as "batting.detail.phases.0.phase")}
                                            value={phase.id}
                                        />
                                    </td>
                                    {(["runs", "balls", "fours", "sixes", "dots"] as const).map((field) => (
                                        <td key={field} className="py-1.5 pr-3">
                                            <label className="sr-only" htmlFor={`${prefix}-phase-${phase.id}-${field}`}>
                                                {phase.label} {field}
                                            </label>
                                            <input
                                                id={`${prefix}-phase-${phase.id}-${field}`}
                                                type="number"
                                                min="0"
                                                {...register(
                                                    `${prefix}.detail.phases.${index}.${field}` as "batting.detail.phases.0.runs",
                                                    { valueAsNumber: true }
                                                )}
                                                className={inputClass}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {(["vsPace", "vsSpin"] as const).map((side) => (
                    <fieldset key={side} className="space-y-3 rounded-lg border border-border p-3">
                        <legend className={labelClass}>{side === "vsPace" ? "Versus pace" : "Versus spin"}</legend>
                        <div className="grid grid-cols-2 gap-3">
                            {(["runs", "balls", "fours", "sixes"] as const).map((field) => (
                                <div key={field} className="space-y-1.5">
                                    <label htmlFor={`${prefix}-${side}-${field}`} className={labelClass}>
                                        {field}
                                    </label>
                                    <input
                                        id={`${prefix}-${side}-${field}`}
                                        type="number"
                                        min="0"
                                        {...register(`${prefix}.detail.${side}.${field}` as "batting.detail.vsPace.runs", {
                                            valueAsNumber: true,
                                        })}
                                        className={inputClass}
                                    />
                                </div>
                            ))}
                        </div>
                        <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm text-foreground">
                            <input type="checkbox" {...register(`${prefix}.detail.${side}.dismissed` as "batting.detail.vsPace.dismissed")} />
                            Dismissed by {side === "vsPace" ? "pace" : "spin"}
                        </label>
                    </fieldset>
                ))}
            </div>

            <div className="space-y-3">
                <h4 className={labelClass}>Shot zones (runs)</h4>
                <svg viewBox="0 0 200 200" className="mx-auto h-40 w-40" aria-hidden>
                    <ellipse cx="100" cy="100" rx="90" ry="70" fill="none" stroke="currentColor" className="text-border" />
                    <rect x="96" y="70" width="8" height="60" rx="2" className="fill-primary/40" />
                    {SHOT_ZONES.map((zone, index) => {
                        const angle = (-90 + index * 45) * (Math.PI / 180);
                        const x = 100 + Math.cos(angle) * 62;
                        const y = 100 + Math.sin(angle) * 48;
                        return (
                            <text key={zone.id} x={x} y={y} textAnchor="middle" className="fill-muted-foreground text-[7px]">
                                {zone.label}
                            </text>
                        );
                    })}
                </svg>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {SHOT_ZONES.map((zone) => (
                        <div key={zone.id} className="space-y-1.5">
                            <label htmlFor={`${prefix}-zone-${zone.id}`} className={labelClass}>
                                {zone.label}
                            </label>
                            <input
                                id={`${prefix}-zone-${zone.id}`}
                                type="number"
                                min="0"
                                {...register(`${prefix}.detail.zones.${zone.id}` as "batting.detail.zones.cover", {
                                    valueAsNumber: true,
                                })}
                                className={inputClass}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField id={`${prefix}-bowler`} label="Bowler type" register={register} name={`${prefix}.detail.bowlerType`} options={BOWLER_TYPES.map((id) => ({ id, label: BOWLER_TYPE_LABELS[id] }))} />
                <SelectField id={`${prefix}-length`} label="Dismissal length" register={register} name={`${prefix}.detail.deliveryLength`} options={DELIVERY_LENGTHS.map((id) => ({ id, label: DELIVERY_LENGTH_LABELS[id] }))} />
                <SelectField id={`${prefix}-line`} label="Dismissal line" register={register} name={`${prefix}.detail.deliveryLine`} options={DELIVERY_LINES.map((id) => ({ id, label: DELIVERY_LINE_LABELS[id] }))} />
                <SelectField id={`${prefix}-shot`} label="Shot played" register={register} name={`${prefix}.detail.shotPlayed`} options={SHOTS.map((id) => ({ id, label: SHOT_LABELS[id] }))} />
                <SelectField
                    id={`${prefix}-dphase`}
                    label="Dismissal phase"
                    register={register}
                    name={`${prefix}.detail.dismissalPhase`}
                    options={phases.map((phase) => ({ id: phase.id, label: PHASE_LABELS[phase.id] }))}
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className={labelClass}>Partnerships</h4>
                    <button
                        type="button"
                        onClick={() => partnerships.append({ wicket: partnerships.fields.length + 1, partner: "", runs: undefined, balls: undefined, myRuns: undefined })}
                        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold"
                    >
                        <Plus size={16} aria-hidden /> Add partnership
                    </button>
                </div>
                {partnerships.fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-2 gap-3 sm:grid-cols-6">
                        <input type="number" min="1" max="10" aria-label="Wicket" {...register(`${prefix}.detail.partnerships.${index}.wicket` as "batting.detail.partnerships.0.wicket", { valueAsNumber: true })} className={inputClass} placeholder="Wkt" />
                        <input aria-label="Partner" {...register(`${prefix}.detail.partnerships.${index}.partner` as "batting.detail.partnerships.0.partner")} className={cn(inputClass, "sm:col-span-2")} placeholder="Partner" />
                        <input type="number" min="0" aria-label="Partnership runs" {...register(`${prefix}.detail.partnerships.${index}.runs` as "batting.detail.partnerships.0.runs", { valueAsNumber: true })} className={inputClass} placeholder="Runs" />
                        <input type="number" min="0" aria-label="Partnership balls" {...register(`${prefix}.detail.partnerships.${index}.balls` as "batting.detail.partnerships.0.balls", { valueAsNumber: true })} className={inputClass} placeholder="Balls" />
                        <div className="flex gap-2">
                            <input type="number" min="0" aria-label="My runs" {...register(`${prefix}.detail.partnerships.${index}.myRuns` as "batting.detail.partnerships.0.myRuns", { valueAsNumber: true })} className={inputClass} placeholder="Mine" />
                            <button type="button" aria-label="Remove partnership" onClick={() => partnerships.remove(index)} className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-lg border border-border">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

export function DetailedBowlingSection({
    register,
    control,
    setValue,
    getValues,
    prefix,
    format,
    defaultOpen,
    hidden,
}: {
    register: UseFormRegister<PerformanceFormData>;
    control: Control<PerformanceFormData>;
    setValue: UseFormSetValue<PerformanceFormData>;
    getValues: UseFormGetValues<PerformanceFormData>;
    prefix: BowlPrefix;
    format: string;
    defaultOpen: boolean;
    hidden?: boolean;
}) {
    const phases = phasesForFormat(format);
    const watched = useWatch({ control, name: prefix });
    const spells = useFieldArray({ control, name: `${prefix}.detail.spells` as "bowling.detail.spells" });
    const wickets = useFieldArray({ control, name: `${prefix}.detail.wicketsDetail` as "bowling.detail.wicketsDetail" });

    useEffect(() => {
        const current = getValues(`${prefix}.detail.phases` as "bowling.detail.phases");
        if (!current || current.length === 0) {
            setValue(
                `${prefix}.detail.phases` as "bowling.detail.phases",
                phases.map((phase) => ({ phase: phase.id })),
                { shouldDirty: false }
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefix, format]);

    if (hidden) return null;

    return (
        <Panel title="Advanced bowling stats" defaultOpen={defaultOpen}>
            <Warnings items={bowlingConsistencyWarnings(watched)} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {(
                    [
                        ["dots", "Dots"],
                        ["foursConceded", "4s conceded"],
                        ["sixesConceded", "6s conceded"],
                        ["catchesDroppedOffBowling", "Dropped off bowling"],
                    ] as const
                ).map(([key, label]) => (
                    <div key={key} className="space-y-1.5">
                        <label htmlFor={`${prefix}-${key}`} className={labelClass}>
                            {label}
                        </label>
                        <input
                            id={`${prefix}-${key}`}
                            type="number"
                            min="0"
                            {...register(`${prefix}.detail.${key}` as "bowling.detail.dots", { valueAsNumber: true })}
                            className={inputClass}
                        />
                    </div>
                ))}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                            <th className="py-2 pr-3">Phase</th>
                            <th className="py-2 pr-3">Balls</th>
                            <th className="py-2 pr-3">Runs</th>
                            <th className="py-2 pr-3">Wkts</th>
                            <th className="py-2">Dots</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phases.map((phase, index) => (
                            <tr key={phase.id}>
                                <td className="py-1.5 pr-3">
                                    {phase.label}
                                    <input type="hidden" value={phase.id} {...register(`${prefix}.detail.phases.${index}.phase` as "bowling.detail.phases.0.phase")} />
                                </td>
                                {(["balls", "runs", "wickets", "dots"] as const).map((field) => (
                                    <td key={field} className="py-1.5 pr-3">
                                        <label className="sr-only" htmlFor={`${prefix}-bphase-${phase.id}-${field}`}>
                                            {phase.label} {field}
                                        </label>
                                        <input
                                            id={`${prefix}-bphase-${phase.id}-${field}`}
                                            type="number"
                                            min="0"
                                            {...register(`${prefix}.detail.phases.${index}.${field}` as "bowling.detail.phases.0.balls", { valueAsNumber: true })}
                                            className={inputClass}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <RepeatHeader title="Spells" onAdd={() => spells.append({ overs: undefined, runs: undefined, wickets: undefined })} />
            {spells.fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-4 gap-3">
                    <input type="number" min="0" step="0.1" aria-label="Spell overs" {...register(`${prefix}.detail.spells.${index}.overs` as "bowling.detail.spells.0.overs", { valueAsNumber: true })} className={inputClass} placeholder="Overs" />
                    <input type="number" min="0" aria-label="Spell runs" {...register(`${prefix}.detail.spells.${index}.runs` as "bowling.detail.spells.0.runs", { valueAsNumber: true })} className={inputClass} placeholder="Runs" />
                    <input type="number" min="0" aria-label="Spell wickets" {...register(`${prefix}.detail.spells.${index}.wickets` as "bowling.detail.spells.0.wickets", { valueAsNumber: true })} className={inputClass} placeholder="Wkts" />
                    <button type="button" aria-label="Remove spell" onClick={() => spells.remove(index)} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border">
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}

            <RepeatHeader title="Wicket details" onAdd={() => wickets.append({ batterPosition: undefined, dismissalType: "", deliveryLength: "", bowlingPhase: "" })} />
            {wickets.fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <input type="number" min="1" max="11" aria-label="Batter position" {...register(`${prefix}.detail.wicketsDetail.${index}.batterPosition` as "bowling.detail.wicketsDetail.0.batterPosition", { valueAsNumber: true })} className={inputClass} placeholder="Pos" />
                    <select aria-label="Dismissal" {...register(`${prefix}.detail.wicketsDetail.${index}.dismissalType` as "bowling.detail.wicketsDetail.0.dismissalType")} className={cn(inputClass, "cursor-pointer")}>
                        <option value="">Dismissal</option>
                        {DISMISSAL_TYPES.map((type) => (
                            <option key={type} value={type}>{DISMISSAL_LABELS[type]}</option>
                        ))}
                    </select>
                    <select aria-label="Length" {...register(`${prefix}.detail.wicketsDetail.${index}.deliveryLength` as "bowling.detail.wicketsDetail.0.deliveryLength")} className={cn(inputClass, "cursor-pointer")}>
                        <option value="">Length</option>
                        {DELIVERY_LENGTHS.map((length) => (
                            <option key={length} value={length}>{DELIVERY_LENGTH_LABELS[length]}</option>
                        ))}
                    </select>
                    <select aria-label="Phase" {...register(`${prefix}.detail.wicketsDetail.${index}.bowlingPhase` as "bowling.detail.wicketsDetail.0.bowlingPhase")} className={cn(inputClass, "cursor-pointer")}>
                        <option value="">Phase</option>
                        {phases.map((phase) => (
                            <option key={phase.id} value={phase.id}>{phase.label}</option>
                        ))}
                    </select>
                    <button type="button" aria-label="Remove wicket" onClick={() => wickets.remove(index)} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-border">
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </Panel>
    );
}

function RepeatHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
    return (
        <div className="flex items-center justify-between">
            <h4 className={labelClass}>{title}</h4>
            <button type="button" onClick={onAdd} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-semibold">
                <Plus size={16} aria-hidden /> Add
            </button>
        </div>
    );
}

function SelectField({
    id,
    label,
    register,
    name,
    options,
}: {
    id: string;
    label: string;
    register: UseFormRegister<PerformanceFormData>;
    name: string;
    options: { id: string; label: string }[];
}) {
    return (
        <div className="space-y-1.5">
            <label htmlFor={id} className={labelClass}>
                {label}
            </label>
            <select id={id} {...register(name as "batting.detail.bowlerType")} className={cn(inputClass, "cursor-pointer")}>
                <option value="">Not set</option>
                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
