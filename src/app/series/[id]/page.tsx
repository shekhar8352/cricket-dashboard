"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDateLong } from "@/lib/utils";
import type { SeriesReadOnlyDetail } from "@/types";
import {
    DetailBackLink,
    DetailHero,
    DetailPill,
    StatTile,
    SectionPanel,
    DefinitionGrid,
    DetailFooterNote,
    humanizeKey,
} from "@/components/detail/ReadOnlySummary";
import {
    Loader2,
    Users,
    Calendar,
    Trophy,
    ClipboardList,
    LayoutGrid,
    Globe2,
    Hash,
    Timer,
    Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";

function display(v: string | undefined | null) {
    if (v === undefined || v === null || v === "") return "—";
    return v;
}

function daysBetween(start: string, end?: string): number | null {
    if (!end) return null;
    const ms = new Date(end).getTime() - new Date(start).getTime();
    if (Number.isNaN(ms)) return null;
    return Math.max(0, Math.round(ms / 86400000));
}

function statusMeta(status: SeriesReadOnlyDetail["status"]) {
    switch (status) {
        case "ongoing":
            return {
                pill: "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
                label: "Live window",
            };
        case "completed":
            return {
                pill: "border-border bg-muted/40 text-muted-foreground",
                label: "In the books",
            };
        default:
            return {
                pill: "border-sky-500/35 bg-sky-500/10 text-sky-300",
                label: "Upcoming",
            };
    }
}

export default function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [series, setSeries] = useState<SeriesReadOnlyDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/series/${id}`);
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to load series");
                }
                if (!cancelled) setSeries(data.data);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [id]);

    const completionPct = useMemo(() => {
        if (!series || series.totalMatches <= 0) return 0;
        return Math.min(100, Math.round((series.matchesLoggedCount / series.totalMatches) * 100));
    }, [series]);

    if (loading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    <Loader2 className="relative h-12 w-12 animate-spin text-primary" aria-hidden />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Loading series…
                </p>
            </div>
        );
    }

    if (error || !series) {
        return (
            <div className="animate-detail-in space-y-6">
                <DetailBackLink href="/series">Series & tournaments</DetailBackLink>
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="mt-0 py-10 text-center">
                        <p className="text-sm font-medium text-foreground">{error || "Series not found."}</p>
                        <Link
                            href="/series"
                            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
                        >
                            Back to list
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const ts = series.tournamentStructure;
    const meta = statusMeta(series.status);
    const span = daysBetween(series.startDate, series.endDate);

    const scheduleItems = [
        { label: "Series opens", value: formatDateLong(series.startDate) },
        { label: "Series closes", value: series.endDate ? formatDateLong(series.endDate) : "—" },
        { label: "Host nation", value: display(series.hostCountry) },
        {
            label: "Span",
            value: span !== null ? `${span} day${span === 1 ? "" : "s"}` : "Single-day / TBC",
        },
        {
            label: "Matches in database",
            value: (
                <span>
                    <span className="font-mono tabular-nums text-primary">{series.matchesLoggedCount}</span>
                    <span className="text-muted-foreground"> logged · </span>
                    <span className="font-mono tabular-nums">{series.totalMatches}</span>
                    <span className="text-muted-foreground"> planned</span>
                </span>
            ),
            fullWidth: true,
        },
    ];

    const identityItems = [
        { label: "Competition type", value: display(humanizeKey(series.type.replace(/-/g, " "))) },
        { label: "Format focus", value: display(series.format) },
        { label: "Level", value: display(humanizeKey(series.level)) },
        { label: "Status", value: display(humanizeKey(series.status)) },
    ];

    const cta = (
        <Link
            href={`/data-entry/series?id=${series._id}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/25 via-primary/15 to-transparent px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-8px_hsl(152_41%_45%/0.5)] transition-all hover:border-primary/60 hover:from-primary/35"
        >
            <ClipboardList size={18} strokeWidth={1.75} aria-hidden />
            Edit in Data entry
        </Link>
    );

    return (
        <div className="space-y-8 lg:space-y-10">
            <div className="animate-detail-in">
                <DetailBackLink href="/series">Series & tournaments</DetailBackLink>
            </div>

            <DetailHero
                eyebrow="Tournament dossier · read-only"
                title={series.name}
                subtitle={`${series.format} · ${humanizeKey(series.level)} · ${meta.label}`}
                action={cta}
                meta={
                    <>
                        <DetailPill className={cn(meta.pill)}>{humanizeKey(series.status)}</DetailPill>
                        <DetailPill>{humanizeKey(series.type.replace(/-/g, " "))}</DetailPill>
                        <DetailPill>
                            <Globe2 size={13} className="mr-1.5 inline opacity-70" aria-hidden />
                            {series.hostCountry}
                        </DetailPill>
                    </>
                }
            />

            <div
                className="animate-detail-in rounded-2xl border border-border/70 bg-card/30 p-5 backdrop-blur-sm sm:p-6"
                style={{ animationDelay: "80ms" }}
            >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Catalogue progress
                        </p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                            {completionPct}
                            <span className="text-lg font-medium text-muted-foreground">%</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            Matches linked to this series vs planned total
                        </p>
                    </div>
                    <p className="font-mono text-sm tabular-nums text-muted-foreground">
                        {series.matchesLoggedCount} / {series.totalMatches}
                    </p>
                </div>
                <div
                    className="mt-4 h-2 overflow-hidden rounded-full bg-muted/50"
                    role="progressbar"
                    aria-valuenow={completionPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Share of planned matches logged"
                >
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/80 to-emerald-400/70 transition-[width] duration-500"
                        style={{ width: `${completionPct}%` }}
                    />
                </div>
            </div>

            <div className="grid animate-detail-in grid-cols-2 gap-3 lg:grid-cols-4" style={{ animationDelay: "120ms" }}>
                <StatTile label="Planned matches" value={series.totalMatches} hint="From series setup" />
                <StatTile label="Logged matches" value={series.matchesLoggedCount} hint="Linked in app" />
                <StatTile label="Teams" value={series.teams.length} hint="Squads captured" />
                <StatTile
                    label="Calendar span"
                    value={span !== null ? `${span}d` : "—"}
                    hint={span !== null ? "Start → end" : "End date open"}
                />
            </div>

            <div className="grid gap-6 lg:gap-8">
                <SectionPanel
                    icon={Hash}
                    title="Identity"
                    description="How this competition is classified in your database."
                    animationDelayMs={140}
                >
                    <DefinitionGrid items={identityItems} columns={2} />
                </SectionPanel>

                <SectionPanel
                    icon={Calendar}
                    title="Schedule & geography"
                    description="Host country and the window you defined for the series."
                    animationDelayMs={200}
                >
                    <DefinitionGrid items={scheduleItems} columns={2} />
                </SectionPanel>

                <SectionPanel
                    icon={Users}
                    title="Squads"
                    description="Sides stored on the series record."
                    animationDelayMs={260}
                >
                    <ul className="flex flex-wrap gap-2" role="list">
                        {series.teams.map((t) => (
                            <li key={t}>
                                <span className="inline-flex items-center rounded-xl border border-border/70 bg-background/40 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm">
                                    {t}
                                </span>
                            </li>
                        ))}
                    </ul>
                </SectionPanel>

                {series.winner ? (
                    <div
                        className="animate-detail-in overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-6 shadow-sm shadow-amber-900/10"
                        style={{ animationDelay: "300ms" }}
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-400">
                                    <Medal size={22} strokeWidth={1.5} aria-hidden />
                                </span>
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200/70">
                                        Champion
                                    </p>
                                    <p className="mt-1 text-2xl font-semibold tracking-tight text-amber-100">
                                        {series.winner}
                                    </p>
                                    <p className="mt-1 text-sm text-amber-200/60">
                                        Recorded winner for this series in your career log.
                                    </p>
                                </div>
                            </div>
                            <Trophy className="hidden h-14 w-14 text-amber-500/25 sm:block" aria-hidden />
                        </div>
                    </div>
                ) : null}

                {ts && (ts.hasGroupStage || ts.hasKnockout || (ts.groups?.length ?? 0) > 0) ? (
                    <SectionPanel
                        icon={LayoutGrid}
                        title="Tournament structure"
                        description="Group stages, knockouts, and named pools if you configured them."
                        animationDelayMs={340}
                    >
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {ts.hasGroupStage ? (
                                    <DetailPill className="border-violet-500/25 text-violet-200/90">
                                        Group stage
                                    </DetailPill>
                                ) : null}
                                {ts.hasKnockout ? (
                                    <DetailPill className="border-rose-500/25 text-rose-200/90">Knockouts</DetailPill>
                                ) : null}
                                {!ts.hasGroupStage && !ts.hasKnockout ? (
                                    <DetailPill>Standard league / bilateral</DetailPill>
                                ) : null}
                            </div>
                            {ts.groups && ts.groups.length > 0 ? (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {ts.groups.map((g) => (
                                        <div
                                            key={g.name}
                                            className="rounded-xl border border-border/60 bg-background/25 p-4"
                                        >
                                            <p className="text-xs font-semibold text-foreground">{g.name}</p>
                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                {g.teams.join(" · ")}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </SectionPanel>
                ) : null}

                {series.notes ? (
                    <SectionPanel
                        icon={Timer}
                        title="Notes"
                        description="Additional context you saved for this series."
                        animationDelayMs={400}
                    >
                        <div className="rounded-xl border border-border/50 bg-background/30 p-4 text-sm leading-relaxed text-muted-foreground">
                            <p className="whitespace-pre-wrap">{series.notes}</p>
                        </div>
                    </SectionPanel>
                ) : null}
            </div>

            <DetailFooterNote>
                <Trophy size={14} className="shrink-0 text-primary/70" aria-hidden />
                <span>
                    Summary is read-only — use Data entry to adjust series metadata or attach more matches.
                </span>
            </DetailFooterNote>
        </div>
    );
}
