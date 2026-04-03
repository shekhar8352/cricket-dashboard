"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate, formatDateLong } from "@/lib/utils";
import { isMultiInningsFormat, MatchFormat } from "@/lib/constants";
import type { MatchReadOnlyDetail, PerformanceInningsRead } from "@/types";
import {
    DetailBackLink,
    DetailHero,
    DetailPill,
    StatTile,
    SectionPanel,
    DefinitionGrid,
    EmptyState,
    PerformanceInningsCard,
    DetailFooterNote,
    humanizeKey,
} from "@/components/detail/ReadOnlySummary";
import {
    Loader2,
    MapPin,
    Trophy,
    ClipboardList,
    Calendar,
    Target,
    CloudSun,
    Flag,
    Sparkles,
    Footprints,
} from "lucide-react";
import { cn } from "@/lib/utils";

function display(v: string | undefined | null) {
    if (v === undefined || v === null || v === "") return "—";
    return v;
}

function resultBand(match: MatchReadOnlyDetail): { label: string; className: string } | undefined {
    const r = match.result;
    if (!r) return undefined;
    const label = humanizeKey(r.replace(/_/g, " "));
    switch (r) {
        case "won":
            return {
                label,
                className:
                    "border-emerald-500/35 bg-emerald-500/10 text-emerald-300",
            };
        case "lost":
            return {
                label,
                className: "border-red-500/35 bg-red-500/10 text-red-300",
            };
        case "draw":
        case "tie":
            return {
                label,
                className: "border-amber-500/35 bg-amber-500/10 text-amber-200",
            };
        default:
            return {
                label,
                className: "border-border bg-muted/30 text-muted-foreground",
            };
    }
}

function InningsBatRow({ inn }: { inn?: PerformanceInningsRead }) {
    if (!inn || inn.didNotBat) {
        return <p className="text-sm italic text-muted-foreground">Did not bat</p>;
    }
    return (
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="font-mono text-2xl font-semibold tabular-nums text-emerald-300/95">
                {inn.runs ?? 0}
            </span>
            <span className="pb-0.5 font-mono text-sm tabular-nums text-muted-foreground">
                ({inn.ballsFaced ?? 0} balls)
            </span>
            <span className="pb-0.5 text-sm text-muted-foreground">
                SR <span className="font-mono tabular-nums">{inn.strikeRate?.toFixed(1) ?? "—"}</span>
            </span>
            {inn.dismissalType ? (
                <span className="pb-0.5 text-xs text-muted-foreground">
                    · {humanizeKey(inn.dismissalType)}
                    {inn.dismissalBowler ? ` · ${inn.dismissalBowler}` : ""}
                </span>
            ) : null}
        </div>
    );
}

function InningsBowlRow({ inn }: { inn?: PerformanceInningsRead }) {
    if (!inn || inn.didNotBowl) {
        return <p className="text-sm italic text-muted-foreground">Did not bowl</p>;
    }
    return (
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            <span className="font-mono text-2xl font-semibold tabular-nums text-sky-300/95">
                {inn.wickets ?? 0}/{inn.runsConceded ?? 0}
            </span>
            <span className="pb-0.5 font-mono text-sm tabular-nums text-muted-foreground">
                {inn.overs ?? 0} ov
            </span>
            <span className="pb-0.5 text-sm text-muted-foreground">
                Econ <span className="font-mono tabular-nums">{inn.economy?.toFixed(2) ?? "—"}</span>
            </span>
        </div>
    );
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [match, setMatch] = useState<MatchReadOnlyDetail | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/matches/${id}`);
                const data = await res.json();
                if (!res.ok || !data.success) {
                    throw new Error(data.error || "Failed to load match");
                }
                if (!cancelled) setMatch(data.data);
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

    if (loading) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    <Loader2 className="relative h-12 w-12 animate-spin text-primary" aria-hidden />
                </div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Loading fixture…
                </p>
            </div>
        );
    }

    if (error || !match) {
        return (
            <div className="animate-detail-in space-y-6">
                <DetailBackLink href="/matches">Match history</DetailBackLink>
                <Card className="border-destructive/30 bg-destructive/5">
                    <CardContent className="mt-0 py-10 text-center">
                        <p className="text-sm font-medium text-foreground">{error || "Match not found."}</p>
                        <Link
                            href="/matches"
                            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted"
                        >
                            Back to list
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const multi = isMultiInningsFormat(match.format as MatchFormat);
    const perf = match.performance;
    const band = resultBand(match);

    const fixtureItems = [
        { label: "Format", value: display(match.format) },
        { label: "Competition level", value: display(match.level ? humanizeKey(match.level) : undefined) },
        { label: "Fixture date", value: formatDateLong(match.date) },
        { label: "Short date", value: formatDate(match.date) },
        {
            label: "Series",
            value: match.series ? (
                <Link href={`/series/${match.series._id}`} className="text-primary underline-offset-4 hover:underline">
                    {match.series.name}
                </Link>
            ) : (
                "—"
            ),
            fullWidth: true,
        },
        { label: "Match type", value: display(match.matchType ? humanizeKey(match.matchType) : undefined) },
    ];

    const venueItems = [
        {
            label: "Ground",
            value: display(match.venue),
            fullWidth: true,
        },
        { label: "City", value: display(match.city) },
        { label: "Country", value: display(match.country) },
        {
            label: "Home / away / neutral",
            value: display(match.venueType ? humanizeKey(match.venueType) : undefined),
        },
        { label: "Side represented", value: display(match.teamRepresented) },
        { label: "Opposition", value: <span className="text-gradient font-semibold">vs {match.opponent}</span> },
    ];

    const conditionItems = [
        { label: "Pitch type", value: display(match.pitchType ? humanizeKey(match.pitchType) : undefined) },
        {
            label: "Weather",
            value: display(match.weatherCondition ? humanizeKey(match.weatherCondition) : undefined),
        },
    ];

    const tossItems = [
        { label: "Toss winner", value: display(match.tossWinner) },
        {
            label: "Toss decision",
            value: display(match.tossDecision ? humanizeKey(match.tossDecision) : undefined),
        },
    ];

    const outcomeItems = [
        {
            label: "Result",
            value: display(match.result ? humanizeKey(match.result.replace(/_/g, " ")) : undefined),
        },
        { label: "Margin / notes on result", value: display(match.resultMargin) },
    ];

    const cta = (
        <Link
            href={`/data-entry/match/${match._id}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-primary/40 bg-gradient-to-br from-primary/25 via-primary/15 to-transparent px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-8px_hsl(152_41%_45%/0.5)] transition-all hover:border-primary/60 hover:from-primary/35"
        >
            <ClipboardList size={18} strokeWidth={1.75} aria-hidden />
            Log or edit performance
        </Link>
    );

    return (
        <div className="space-y-8 lg:space-y-10">
            <div className="animate-detail-in">
                <DetailBackLink href="/matches">Match history</DetailBackLink>
            </div>

            <DetailHero
                eyebrow="Fixture dossier · read-only"
                title="vs"
                titleAccent={match.opponent}
                subtitle={`${match.format} · ${humanizeKey(match.level)} · every field below is drawn from your records.`}
                resultBand={band}
                action={cta}
                meta={
                    <>
                        <DetailPill>
                            <Calendar size={13} className="mr-1.5 inline opacity-70" aria-hidden />
                            {formatDateLong(match.date)}
                        </DetailPill>
                        <DetailPill className="border-primary/25 text-primary/95">{match.format}</DetailPill>
                        {match.hasPerformance ? (
                            <DetailPill className="border-emerald-500/25 text-emerald-400/90">
                                <Sparkles size={13} className="mr-1.5 inline" aria-hidden />
                                Performance on file
                            </DetailPill>
                        ) : (
                            <DetailPill className="opacity-80">No performance yet</DetailPill>
                        )}
                    </>
                }
            />

            {perf ? (
                <div className="grid animate-detail-in grid-cols-2 gap-3 lg:grid-cols-4" style={{ animationDelay: "60ms" }}>
                    <StatTile label="Match runs" value={perf.matchRuns} hint="All innings combined" />
                    <StatTile label="Wickets taken" value={perf.matchWickets} hint="Bowling" />
                    <StatTile label="Balls faced" value={perf.matchBallsFaced} hint="Batting workload" />
                    <StatTile
                        label="Overs bowled"
                        value={perf.matchOvers.toFixed(1)}
                        hint="Decimal overs"
                    />
                </div>
            ) : (
                <div className="animate-detail-in" style={{ animationDelay: "60ms" }}>
                    <StatTile
                        label="Performance"
                        value="—"
                        hint="Log batting, bowling & fielding from Data entry"
                    />
                </div>
            )}

            <div className="grid gap-6 lg:gap-8">
                <SectionPanel
                    icon={Calendar}
                    title="Fixture & context"
                    description="Format, calendar, and series linkage."
                    animationDelayMs={100}
                >
                    <DefinitionGrid items={fixtureItems} columns={2} />
                </SectionPanel>

                <SectionPanel
                    icon={MapPin}
                    title="Venue & sides"
                    description="Where the game was played and who you represented."
                    animationDelayMs={160}
                >
                    <DefinitionGrid items={venueItems} columns={2} />
                </SectionPanel>

                <div className="grid gap-6 lg:grid-cols-2">
                    <SectionPanel
                        icon={CloudSun}
                        title="Conditions"
                        description="Surface and sky at the ground."
                        animationDelayMs={220}
                    >
                        <DefinitionGrid items={conditionItems} columns={1} />
                    </SectionPanel>
                    <SectionPanel
                        icon={Flag}
                        title="Toss"
                        animationDelayMs={260}
                    >
                        <DefinitionGrid items={tossItems} columns={1} />
                    </SectionPanel>
                </div>

                <SectionPanel
                    icon={Trophy}
                    title="Outcome"
                    description="Result line and how the match was decided."
                    animationDelayMs={300}
                >
                    <DefinitionGrid items={outcomeItems} columns={2} />
                </SectionPanel>

                {match.notes ? (
                    <SectionPanel
                        icon={Footprints}
                        title="Your notes"
                        description="Free-form context saved with this match."
                        animationDelayMs={340}
                    >
                        <div className="rounded-xl border border-border/50 bg-background/30 p-4 text-sm leading-relaxed text-muted-foreground">
                            <p className="whitespace-pre-wrap">{match.notes}</p>
                        </div>
                    </SectionPanel>
                ) : null}

                <SectionPanel
                    icon={Target}
                    title="Performance breakdown"
                    description="Read-only snapshot of logged numbers. Edits happen in Data entry."
                    animationDelayMs={380}
                >
                    {!perf ? (
                        <EmptyState message="No performance document for this match yet — use Data entry to add your innings." />
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                                {perf.isCaptain ? (
                                    <DetailPill className="border-amber-500/30 text-amber-200/90">Captain</DetailPill>
                                ) : null}
                                {perf.isWicketkeeper ? (
                                    <DetailPill className="border-sky-500/30 text-sky-200/90">Wicket-keeper</DetailPill>
                                ) : null}
                            </div>

                            <div
                                className={cn(
                                    "grid gap-4",
                                    multi ? "lg:grid-cols-2" : "lg:grid-cols-2"
                                )}
                            >
                                <PerformanceInningsCard title="Batting" variant="bat">
                                    {multi ? (
                                        <>
                                            <p className="mb-2 text-xs font-medium text-emerald-400/80">First innings</p>
                                            <InningsBatRow inn={perf.firstInningsBatting} />
                                            <p className="mb-2 mt-4 text-xs font-medium text-emerald-400/80">
                                                Second innings
                                            </p>
                                            <InningsBatRow inn={perf.secondInningsBatting} />
                                        </>
                                    ) : (
                                        <InningsBatRow inn={perf.batting} />
                                    )}
                                </PerformanceInningsCard>
                                <PerformanceInningsCard title="Bowling" variant="bowl">
                                    {multi ? (
                                        <>
                                            <p className="mb-2 text-xs font-medium text-sky-400/80">First innings</p>
                                            <InningsBowlRow inn={perf.firstInningsBowling} />
                                            <p className="mb-2 mt-4 text-xs font-medium text-sky-400/80">
                                                Second innings
                                            </p>
                                            <InningsBowlRow inn={perf.secondInningsBowling} />
                                        </>
                                    ) : (
                                        <InningsBowlRow inn={perf.bowling} />
                                    )}
                                </PerformanceInningsCard>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                                    Fielding
                                </p>
                                <div className="flex flex-wrap gap-6 font-mono text-sm tabular-nums text-foreground">
                                    <span>
                                        <span className="text-muted-foreground">CT </span>
                                        {perf.fielding.catches}
                                    </span>
                                    <span>
                                        <span className="text-muted-foreground">RO </span>
                                        {perf.fielding.runOuts}
                                    </span>
                                    <span>
                                        <span className="text-muted-foreground">ST </span>
                                        {perf.fielding.stumpings}
                                    </span>
                                    <span className="text-muted-foreground">
                                        Total dismissals {perf.fielding.totalDismissals}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </SectionPanel>
            </div>

            <DetailFooterNote>
                <MapPin size={14} className="shrink-0 text-primary/70" aria-hidden />
                <span>
                    Read-only dossier — change match metadata from the main Data entry flows when you need corrections.
                </span>
            </DetailFooterNote>
        </div>
    );
}
