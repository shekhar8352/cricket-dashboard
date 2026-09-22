"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { PageHeader } from "@/components/ui/SectionHeader";
import { StatCard } from "@/components/ui/Card";
import {
    AnalyticsSkeleton,
    ChartCard,
    CountTable,
    EmptyState,
    KpiGrid,
    SplitTable,
    show,
} from "@/components/analytics/widgets";
import {
    AverageTrendChart,
    CalendarHeatmap,
    DismissalBreakdownChart,
    EconomyTrendChart,
    FormatBreakdownChart,
    MonthlyMatchVolumeChart,
    PaceVsSpinChart,
    PhaseChart,
    RollingFormChart,
    RunsOverTimeChart,
    RunsVsSrScatter,
    ScoreDistributionChart,
    SkillsRadarChart,
    StrikeRateTrendChart,
    TossAnalysisChart,
    VenueTypeOutcomeChart,
    WagonWheelChart,
    WinLossChart,
    WicketsChart,
} from "@/components/charts";
import {
    MATCH_FORMATS,
    MATCH_LEVELS,
    MATCH_RESULTS,
    VENUE_TYPES,
} from "@/lib/constants";
import { SPLIT_DIMENSIONS } from "@/lib/analytics/splits";
import type {
    AllroundTabData,
    BattingTabData,
    BowlingTabData,
    FieldingTabData,
    H2HTabData,
    OverviewData,
    SplitsTabData,
    TrendsTabData,
} from "@/lib/analytics/types";
import { cn, formatBattingScore, formatBowlingFigures } from "@/lib/utils";
import { BarChart3, Crosshair, Flame, Hand, Shield, Star, Swords, Trophy } from "lucide-react";

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "batting", label: "Batting" },
    { id: "bowling", label: "Bowling" },
    { id: "fielding", label: "Fielding" },
    { id: "allround", label: "All-round" },
    { id: "splits", label: "Splits" },
    { id: "h2h", label: "Head-to-head" },
    { id: "trends", label: "Trends" },
] as const;

const selectClass =
    "h-11 w-full cursor-pointer rounded-lg border border-border bg-background px-3 text-sm text-foreground";

function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        const id = key(item).trim();
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export function AnalyticsClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get("tab") || "overview";
    const [payload, setPayload] = useState<{ query: string; data: unknown } | null>(null);
    const [opponents, setOpponents] = useState<string[]>([]);
    const [venues, setVenues] = useState<{ venue: string; city?: string }[]>([]);
    const [series, setSeries] = useState<{ _id: string; name: string }[]>([]);

    const query = searchParams.toString();
    const data = payload?.query === query ? payload.data : null;
    const loading = payload?.query !== query;

    useEffect(() => {
        let cancelled = false;
        const params = new URLSearchParams(query);
        if (!params.get("tab")) params.set("tab", "overview");
        fetch(`/api/analytics?${params.toString()}`, { cache: "no-store" })
            .then((response) => response.json())
            .then((json) => {
                if (!cancelled) setPayload({ query, data: json.success ? json.data : null });
            })
            .catch(() => {
                if (!cancelled) setPayload({ query, data: null });
            });
        return () => {
            cancelled = true;
        };
    }, [query]);

    useEffect(() => {
        fetch("/api/matches?getOpponents=true")
            .then((response) => response.json())
            .then((json) => json.success && setOpponents(json.data));
        fetch("/api/matches?getVenues=true")
            .then((response) => response.json())
            .then((json) => json.success && setVenues(json.data));
        fetch("/api/series")
            .then((response) => response.json())
            .then((json) => json.success && setSeries(json.data));
    }, []);

    const update = (key: string, value: string) => {
        const next = new URLSearchParams(searchParams.toString());
        if (!next.get("tab")) next.set("tab", tab);
        if (value) next.set(key, value);
        else next.delete(key);
        router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    };

    const year = new Date().getFullYear();
    const years = Array.from({ length: 16 }, (_, index) => String(year - index));

    return (
        <div className="space-y-8 pb-12">
            <PageHeader
                eyebrow="Insights"
                title="Analytics"
                description="Every career cut the scorecards can support. Stats that need the advanced scorecard say how many innings they use."
            />

            <Tabs.Root value={tab} onValueChange={(value) => update("tab", value)}>
            <div className="sticky top-[3.75rem] z-30 space-y-3 rounded-xl border border-border bg-background/95 p-4 backdrop-blur-xl">
                <Tabs.List className="flex gap-2 overflow-x-auto pb-1" aria-label="Analytics sections">
                    {TABS.map((item) => (
                        <Tabs.Trigger
                            key={item.id}
                            value={item.id}
                            className="min-h-11 shrink-0 cursor-pointer rounded-lg border border-border px-4 text-sm font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            {item.label}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    <Filter label="Tier" value={searchParams.get("tier") || ""} onChange={(value) => update("tier", value)}>
                        <option value="">All tiers</option>
                        <option value="international">International</option>
                        <option value="domestic">Domestic</option>
                    </Filter>
                    <Filter label="Format" value={searchParams.get("format") || ""} onChange={(value) => update("format", value)}>
                        <option value="">All formats</option>
                        {MATCH_FORMATS.map((format) => (
                            <option key={format} value={format}>{format}</option>
                        ))}
                    </Filter>
                    <Filter label="Level" value={searchParams.get("level") || ""} onChange={(value) => update("level", value)}>
                        <option value="">All levels</option>
                        {MATCH_LEVELS.map((level) => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </Filter>
                    <Filter label="Opponent" value={searchParams.get("opponent") || ""} onChange={(value) => update("opponent", value)}>
                        <option value="">All opponents</option>
                        {uniqueBy(opponents, (opponent) => opponent).map((opponent) => (
                            <option key={opponent} value={opponent}>{opponent}</option>
                        ))}
                    </Filter>
                    <Filter label="Venue" value={searchParams.get("venue") || ""} onChange={(value) => update("venue", value)}>
                        <option value="">All venues</option>
                        {uniqueBy(venues, (venue) => venue.venue).map((venue) => (
                            <option key={venue.venue} value={venue.venue}>{venue.venue}</option>
                        ))}
                    </Filter>
                    <Filter label="Series" value={searchParams.get("series") || ""} onChange={(value) => update("series", value)}>
                        <option value="">All series</option>
                        {series.map((item) => (
                            <option key={item._id} value={item._id}>{item.name}</option>
                        ))}
                    </Filter>
                    <Filter label="Year" value={searchParams.get("year") || ""} onChange={(value) => update("year", value)}>
                        <option value="">All years</option>
                        {years.map((item) => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </Filter>
                    <Filter label="Home / away" value={searchParams.get("venueType") || ""} onChange={(value) => update("venueType", value)}>
                        <option value="">Any ground</option>
                        {VENUE_TYPES.map((type) => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </Filter>
                    <Filter label="Result" value={searchParams.get("result") || ""} onChange={(value) => update("result", value)}>
                        <option value="">Any result</option>
                        {MATCH_RESULTS.map((result) => (
                            <option key={result} value={result}>{result}</option>
                        ))}
                    </Filter>
                    <Filter label="Captain" value={searchParams.get("captain") || ""} onChange={(value) => update("captain", value)}>
                        <option value="">Any role</option>
                        <option value="yes">Captain</option>
                        <option value="no">Not captain</option>
                    </Filter>
                    <label className="space-y-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        From
                        <input type="date" value={searchParams.get("startDate") || ""} onChange={(event) => update("startDate", event.target.value)} className={selectClass} />
                    </label>
                    <label className="space-y-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        To
                        <input type="date" value={searchParams.get("endDate") || ""} onChange={(event) => update("endDate", event.target.value)} className={selectClass} />
                    </label>
                </div>
            </div>
                <div className="mt-6">
                    {loading ? (
                        <AnalyticsSkeleton />
                    ) : !data ? (
                        <EmptyState message="These stats could not be loaded." />
                    ) : tab === "overview" ? (
                        <OverviewPanel data={data as OverviewData} />
                    ) : tab === "batting" ? (
                        <BattingPanel data={data as BattingTabData} />
                    ) : tab === "bowling" ? (
                        <BowlingPanel data={data as BowlingTabData} />
                    ) : tab === "fielding" ? (
                        <FieldingPanel data={data as FieldingTabData} />
                    ) : tab === "allround" ? (
                        <AllroundPanel data={data as AllroundTabData} />
                    ) : tab === "splits" ? (
                        <SplitsPanel
                            data={data as SplitsTabData}
                            dimension={searchParams.get("dimension") || "format"}
                            onDimension={(value) => update("dimension", value)}
                        />
                    ) : tab === "h2h" ? (
                        <H2HPanel data={data as H2HTabData} onSelect={(opponent) => update("opponent", opponent)} />
                    ) : (
                        <TrendsPanel data={data as TrendsTabData} />
                    )}
                </div>
            </Tabs.Root>
        </div>
    );
}

function Filter({
    label,
    value,
    onChange,
    children,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    children: React.ReactNode;
}) {
    return (
        <label className="space-y-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
            <select value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
                {children}
            </select>
        </label>
    );
}

function OverviewPanel({ data }: { data: OverviewData }) {
    const summary = data.summary;
    if (!summary || summary.matches === 0) {
        return <EmptyState message="No performances match these filters." />;
    }
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Matches" value={summary.matches} subtitle={`${summary.winPercentage}% wins`} icon={Trophy} />
                <StatCard title="Runs" value={summary.runs.toLocaleString()} subtitle={`Avg ${show(summary.battingAverage)} · SR ${summary.strikeRate}`} icon={Swords} />
                <StatCard title="Wickets" value={summary.wickets} subtitle={`Avg ${show(summary.bowlingAverage)} · Econ ${summary.economy}`} icon={Crosshair} />
                <StatCard title="Awards" value={summary.playerOfMatch} subtitle={`${summary.catches} catches`} icon={Star} />
            </div>
            <KpiGrid
                items={[
                    { label: "Highest", value: formatBattingScore(summary.highestScore.runs, summary.highestScore.isNotOut) },
                    { label: "50s / 100s", value: `${summary.fifties} / ${summary.centuries}` },
                    { label: "30s", value: summary.thirties },
                    { label: "Ducks", value: summary.ducks, hint: `${summary.goldenDucks} golden` },
                    { label: "Boundary %", value: `${summary.boundaryPercentage}%` },
                    { label: "Balls / boundary", value: show(summary.ballsPerBoundary) },
                    { label: "Best bowling", value: formatBowlingFigures(summary.bestBowling.wickets, summary.bestBowling.runs) },
                    { label: "5-fors", value: summary.fiveWicketHauls },
                    { label: "Bowl SR", value: show(summary.bowlingStrikeRate) },
                    { label: "4-fors", value: summary.fourWicketHauls },
                ]}
            />
            <div className="grid gap-4 lg:grid-cols-3">
                <FormCard title="Last 5" current={data.form.last5.average} career={data.form.careerAverage} strike={data.form.last5.strikeRate} />
                <FormCard title="Last 10" current={data.form.last10.average} career={data.form.careerAverage} strike={data.form.last10.strikeRate} />
                <ChartCard title="Career shape" description="Each axis is scaled so 100 is a strong benchmark, not a raw stat.">
                    <SkillsRadarChart data={data.radar} />
                </ChartCard>
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Results</h3>
                    <WinLossChart won={data.results.won} lost={data.results.lost} draw={data.results.draw} tie={data.results.tie} noResult={data.results.noResult} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Dismissals</h3>
                    <DismissalBreakdownChart data={data.dismissalBreakdown} />
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Toss</h3>
                    <TossAnalysisChart data={data.toss} />
                </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Runs by format</h3>
                    <FormatBreakdownChart data={data.formats} metric="runs" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Home and away</h3>
                    <VenueTypeOutcomeChart data={data.venueTypeOutcomes} />
                </div>
            </div>
            <section className="space-y-3">
                <h3 className="text-sm font-semibold">International, IPL and domestic</h3>
                <SplitTable rows={data.tierSplit} filename="tier-split.csv" />
            </section>
            <section className="space-y-3">
                <h3 className="text-sm font-semibold">Milestones</h3>
                <ol className="space-y-2">
                    {data.milestones.map((item) => (
                        <li key={`${item.label}-${item.date}`} className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-border px-3 py-2">
                            <span className="font-semibold text-foreground">{item.label}</span>
                            <span className="text-sm text-muted-foreground">{item.detail}</span>
                            <time className="font-mono text-xs text-muted-foreground">{item.date.slice(0, 10)}</time>
                        </li>
                    ))}
                </ol>
            </section>
            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Matches by month</h3>
                <MonthlyMatchVolumeChart data={data.monthlyVolume} />
            </div>
            <p className="text-xs text-muted-foreground">
                Record coverage: {data.recordCoverage.withPerformance} of {data.recordCoverage.totalMatches} matches have a performance card ({data.recordCoverage.pctWithPerformance}%). {data.recordCoverage.pctSeriesTagged}% are linked to a series.
            </p>
        </div>
    );
}

function FormCard({ title, current, career, strike }: { title: string; current: number | null; career: number | null; strike: number }) {
    const delta = current != null && career ? Math.round(((current - career) / career) * 100) : null;
    return (
        <div className="surface-panel space-y-2 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title} batting average</p>
            <p className="font-mono text-3xl font-semibold tabular-nums">{show(current)}</p>
            <p className="text-sm text-muted-foreground">
                Career {show(career)}
                {delta != null ? ` · ${delta > 0 ? "+" : ""}${delta}%` : ""} · SR {strike}
            </p>
        </div>
    );
}

function BattingPanel({ data }: { data: BattingTabData }) {
    const core = data.core;
    if (core.innings === 0) return <EmptyState message="No batting innings in this filter." />;
    return (
        <div className="space-y-8">
            <KpiGrid
                items={[
                    { label: "Innings", value: core.innings },
                    { label: "Runs", value: core.runs },
                    { label: "Average", value: show(core.average) },
                    { label: "Strike rate", value: core.strikeRate },
                    { label: "Balls / dismissal", value: show(core.ballsPerDismissal) },
                    { label: "Not out %", value: `${core.notOutPercentage}%` },
                    { label: "Runs / innings", value: core.runsPerInnings },
                    { label: "Boundary %", value: `${core.boundaryPercentage}%` },
                    { label: "30→50", value: show(core.conversion30to50), hint: `${core.reached50} of ${core.reached30} reached 30` },
                    { label: "50→100", value: show(core.conversion50to100) },
                    { label: "Std dev", value: core.standardDeviation },
                    { label: "20+ %", value: `${core.innings20PlusPct}%` },
                ]}
            />
            <div className="grid gap-4 xl:grid-cols-2">
                <ChartCard title="Score distribution" table={<CountTable rows={data.distribution} />}>
                    <ScoreDistributionChart data={data.distribution} />
                </ChartCard>
                <ChartCard title="Shot zones" description="Runs scored in each region." coverage={data.zoneCoverage} table={<CountTable rows={data.zones} valueLabel="Runs" />}>
                    <WagonWheelChart data={data.zones} />
                </ChartCard>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
                <ChartCard title="Phase strike rate" coverage={data.phaseCoverage} table={<CountTable rows={data.phases.map((phase) => ({ label: phase.label, count: phase.strikeRate }))} valueLabel="SR" />}>
                    <PhaseChart data={data.phases} metric="strikeRate" />
                </ChartCard>
                <ChartCard title="Pace and spin" coverage={data.paceSpinCoverage}>
                    <PaceVsSpinChart data={data.paceSpin} />
                </ChartCard>
            </div>
            <KpiGrid
                items={[
                    { label: "Dot %", value: show(data.dotPct), hint: `Detail on ${data.detailCoverage.withDetail} innings` },
                    { label: "Scoring shots %", value: show(data.scoringShotPct) },
                    { label: "Rotation %", value: show(data.strikeRotationPct) },
                    { label: "Balls to 50", value: show(data.avgBallsTo50), hint: `${data.samples50} samples` },
                    { label: "Balls to 100", value: show(data.avgBallsTo100), hint: `${data.samples100} samples` },
                    { label: "Share of total", value: data.teamShare == null ? "—" : `${data.teamShare}%`, hint: `${data.teamShareSamples} innings` },
                    { label: "Under pressure avg", value: show(data.entryPressure.average), hint: "Arrived at 3 wickets down or more" },
                    { label: "Settled avg", value: show(data.entrySettled.average) },
                ]}
            />
            <section className="space-y-3">
                <h3 className="text-sm font-semibold">By batting position</h3>
                <SplitTable rows={data.positions} filename="positions.csv" />
            </section>
            <section className="space-y-3">
                <h3 className="text-sm font-semibold">By innings</h3>
                <SplitTable rows={data.inningsSplit} filename="innings.csv" />
            </section>
            <section className="space-y-3">
                <h3 className="text-sm font-semibold">Batting first and chasing</h3>
                <SplitTable rows={data.chaseSplit} filename="chase.csv" />
            </section>
            <div className="grid gap-4 lg:grid-cols-3">
                <section className="space-y-2">
                    <h3 className="text-sm font-semibold">Dismissals</h3>
                    <CountTable rows={data.dismissals.map((item) => ({ label: item.type, count: item.count }))} />
                </section>
                <section className="space-y-2">
                    <h3 className="text-sm font-semibold">Bowlers</h3>
                    <CountTable rows={data.bowlers} />
                </section>
                <section className="space-y-2">
                    <h3 className="text-sm font-semibold">Dismissal length and shot</h3>
                    <CountTable rows={[...data.lengths, ...data.shots]} />
                </section>
            </div>
            <section className="space-y-2">
                <h3 className="text-sm font-semibold">Against bowler type</h3>
                <CountTable rows={data.bowlerTypes} />
            </section>
            <section className="space-y-2">
                <h3 className="text-sm font-semibold">Partnerships</h3>
                <p className="text-xs text-muted-foreground">Based on {data.partnershipCoverage.withDetail} of {data.partnershipCoverage.total} innings.</p>
                <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                                <th className="px-3 py-2">Wicket</th>
                                <th className="px-3 py-2">Count</th>
                                <th className="px-3 py-2">Runs</th>
                                <th className="px-3 py-2">Average</th>
                                <th className="px-3 py-2">Best</th>
                                <th className="px-3 py-2">My runs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.partnerships.map((row) => (
                                <tr key={row.wicket} className="border-b border-border/50">
                                    <td className="px-3 py-2">{row.wicket || "—"}</td>
                                    <td className="px-3 py-2 font-mono">{row.count}</td>
                                    <td className="px-3 py-2 font-mono">{row.runs}</td>
                                    <td className="px-3 py-2 font-mono">{row.average}</td>
                                    <td className="px-3 py-2 font-mono">{row.best}</td>
                                    <td className="px-3 py-2 font-mono">{row.myRuns}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            <ScoreList rows={data.topScores} />
        </div>
    );
}

function ScoreList({ rows }: { rows: BattingTabData["topScores"] }) {
    return (
        <section className="space-y-2">
            <h3 className="text-sm font-semibold">Top scores</h3>
            <ul className="divide-y divide-border rounded-xl border border-border">
                {rows.map((row) => (
                    <li key={`${row.matchId}-${row.runs}-${row.balls}`} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                        <span className="font-mono text-lg font-semibold">{formatBattingScore(row.runs, row.isNotOut)}</span>
                        <span className="text-muted-foreground">{row.balls} balls · SR {row.strikeRate}</span>
                        <span>vs {row.opponent}</span>
                        <span className="text-muted-foreground">{row.format} · {row.date.slice(0, 10)}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function BowlingPanel({ data }: { data: BowlingTabData }) {
    const core = data.core;
    if (core.innings === 0) return <EmptyState message="No bowling spells in this filter." />;
    return (
        <div className="space-y-8">
            <KpiGrid
                items={[
                    { label: "Innings", value: core.innings },
                    { label: "Wickets", value: core.wickets },
                    { label: "Average", value: show(core.average) },
                    { label: "Economy", value: core.economy },
                    { label: "Strike rate", value: show(core.strikeRate) },
                    { label: "Maidens %", value: `${core.maidensPercentage}%` },
                    { label: "Extras / over", value: core.extrasPerOver },
                    { label: "Wides", value: core.wides },
                    { label: "No-balls", value: core.noBalls },
                    { label: "3 / 4 / 5", value: `${core.threeWicketHauls} / ${core.fourWicketHauls} / ${core.fiveWicketHauls}` },
                    { label: "Dot %", value: show(data.dotPct), hint: `${data.detailCoverage.withDetail} detailed innings` },
                    { label: "Boundary balls %", value: show(data.boundaryBallPct) },
                    { label: "Top-order wickets", value: data.topOrderWicketPct == null ? "—" : `${data.topOrderWicketPct}%`, hint: `${data.wicketQualitySamples} wickets logged` },
                    { label: "Drops off bowling", value: data.dropped },
                ]}
            />
            <div className="grid gap-4 xl:grid-cols-2">
                <ChartCard title="Wickets per match" table={<CountTable rows={data.histogram.map((bin) => ({ label: bin.label, count: bin.count }))} />}>
                    <ScoreDistributionChart data={data.histogram.map((bin) => ({ key: bin.label, label: bin.label, count: bin.count }))} />
                </ChartCard>
                <ChartCard title="Phase economy" coverage={data.phaseCoverage}>
                    <PhaseChart data={data.phases} metric="economy" />
                </ChartCard>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <section className="surface-panel space-y-2 p-4">
                    <h3 className="text-sm font-semibold">First spell</h3>
                    <p className="text-sm text-muted-foreground">{data.firstSpell.spells} spells · {data.firstSpell.wickets} wickets · econ {data.firstSpell.economy}</p>
                    <h3 className="pt-2 text-sm font-semibold">Later spells</h3>
                    <p className="text-sm text-muted-foreground">{data.laterSpells.spells} spells · {data.laterSpells.wickets} wickets · econ {data.laterSpells.economy}</p>
                    <p className="text-xs text-muted-foreground">Based on {data.spellCoverage.withDetail} of {data.spellCoverage.total} bowling innings.</p>
                </section>
                <section className="space-y-2">
                    <h3 className="text-sm font-semibold">How wickets fell</h3>
                    <CountTable rows={[...data.wicketTypes, ...data.wicketLengths]} />
                </section>
            </div>
            <section className="space-y-2">
                <h3 className="text-sm font-semibold">Best figures</h3>
                <ul className="divide-y divide-border rounded-xl border border-border">
                    {data.bestFigures.map((row) => (
                        <li key={`${row.matchId}-${row.wickets}-${row.runs}`} className="flex flex-wrap justify-between gap-2 px-3 py-2 text-sm">
                            <span className="font-mono text-lg font-semibold">{formatBowlingFigures(row.wickets, row.runs)}</span>
                            <span className="text-muted-foreground">{row.overs} ov · econ {row.economy}</span>
                            <span>vs {row.opponent}</span>
                            <span className="text-muted-foreground">{row.date.slice(0, 10)}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}

function FieldingPanel({ data }: { data: FieldingTabData }) {
    const core = data.core;
    if (core.matches === 0) return <EmptyState message="No fielding records in this filter." />;
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Catches" value={core.catches} icon={Hand} />
                <StatCard title="Run outs" value={core.runOuts} icon={Flame} />
                <StatCard title="Stumpings" value={core.stumpings} icon={Shield} />
                <StatCard title="Catch efficiency" value={core.catchEfficiency == null ? "—" : `${core.catchEfficiency}%`} subtitle="Catches divided by catches plus drops" icon={BarChart3} />
            </div>
            <KpiGrid
                items={[
                    { label: "Dismissals", value: core.dismissals },
                    { label: "Per match", value: core.dismissalsPerMatch },
                    { label: "Direct hits", value: core.directHits },
                    { label: "Drops", value: core.dropped },
                    { label: "Misfields", value: core.misfields },
                    { label: "Runs saved", value: core.runsSaved },
                ]}
            />
            <p className="text-xs text-muted-foreground">
                Drops, direct hits and runs saved are on {data.detailCoverage.withDetail} of {data.detailCoverage.total} matches.
            </p>
        </div>
    );
}

function AllroundPanel({ data }: { data: AllroundTabData }) {
    return (
        <div className="space-y-8">
            <KpiGrid
                items={[
                    { label: "Batting average", value: show(data.battingAverage) },
                    { label: "Bowling average", value: show(data.bowlingAverage) },
                    { label: "All-round index", value: show(data.index), hint: "Batting average minus bowling average" },
                ]}
            />
            <ChartCard
                title="Match impact"
                description="Runs scaled against a format strike-rate baseline, plus 22 points per wicket, minus overs bowled above a baseline economy."
                table={<CountTable rows={data.impact.slice(-12).map((point) => ({ label: `${point.date.slice(0, 10)} vs ${point.opponent}`, count: point.impact }))} valueLabel="Impact" />}
            >
                <RollingFormChart
                    primaryLabel="Match impact"
                    hideSecondary
                    data={data.impact.map((point) => ({
                        date: point.date,
                        label: point.opponent,
                        average5: point.impact,
                        average10: null,
                        strikeRate5: point.runs,
                        strikeRate10: point.wickets,
                    }))}
                />
            </ChartCard>
            <section className="space-y-2">
                <h3 className="text-sm font-semibold">Captain and not captain</h3>
                <SplitTable rows={data.captain} filename="captain.csv" />
            </section>
            <section className="space-y-2">
                <h3 className="text-sm font-semibold">Keeper and outfield</h3>
                <SplitTable rows={data.keeper} filename="keeper.csv" />
            </section>
            <section className="space-y-2">
                <h3 className="text-sm font-semibold">Wins and losses</h3>
                <SplitTable rows={data.results} filename="results.csv" />
            </section>
        </div>
    );
}

function SplitsPanel({
    data,
    dimension,
    onDimension,
}: {
    data: SplitsTabData;
    dimension: string;
    onDimension: (value: string) => void;
}) {
    return (
        <div className="space-y-4">
            <label className="block max-w-xs space-y-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Split by
                <select value={dimension} onChange={(event) => onDimension(event.target.value)} className={selectClass}>
                    {SPLIT_DIMENSIONS.map((item) => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                    ))}
                </select>
            </label>
            <ChartCard title="Runs by group" table={<SplitTable rows={data.rows} />}>
                <ScoreDistributionChart data={data.rows.slice(0, 12).map((row) => ({ key: row.key, label: row.label, count: row.runs }))} />
            </ChartCard>
            <SplitTable rows={data.rows} filename={`${data.dimension}.csv`} />
        </div>
    );
}

function H2HPanel({ data, onSelect }: { data: H2HTabData; onSelect: (opponent: string) => void }) {
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => onSelect("")} className="min-h-11 cursor-pointer rounded-lg border border-border px-3 text-sm">
                    All opponents
                </button>
                {data.opponents.map((opponent) => (
                    <button
                        key={opponent.opponent}
                        type="button"
                        onClick={() => onSelect(opponent.opponent)}
                        className={cn(
                            "min-h-11 cursor-pointer rounded-lg border border-border px-3 text-sm",
                            data.selected === opponent.opponent && "border-primary bg-primary text-primary-foreground"
                        )}
                    >
                        {opponent.opponent}
                        <span className="ml-2 font-mono text-xs text-muted-foreground">{opponent.matches}</span>
                    </button>
                ))}
            </div>
            {!data.profile ? (
                <EmptyState message="Pick an opponent to open the full batting, bowling and venue profile." />
            ) : (
                <div className="space-y-6">
                    <KpiGrid
                        items={[
                            { label: "Runs", value: data.profile.batting.runs },
                            { label: "Average", value: show(data.profile.batting.average) },
                            { label: "Strike rate", value: data.profile.batting.strikeRate },
                            { label: "Wickets", value: data.profile.bowling.wickets },
                            { label: "Bowl avg", value: show(data.profile.bowling.average) },
                            { label: "Economy", value: data.profile.bowling.economy },
                            { label: "Catches", value: data.profile.fielding.catches },
                        ]}
                    />
            <div className="space-y-2">
                <h3 className="text-sm font-semibold">Timeline</h3>
                <RunsOverTimeChart data={data.profile.timeline} />
            </div>
                    <ScoreList rows={data.profile.topScores} />
                    <CountTable rows={data.profile.venues.map((venue) => ({ label: `${venue.venue}, ${venue.city}`, count: venue.matches }))} valueLabel="Matches" />
                </div>
            )}
        </div>
    );
}

function TrendsPanel({ data }: { data: TrendsTabData }) {
    if (data.trends.length === 0) return <EmptyState message="No matches to chart yet." />;
    return (
        <div className="space-y-8">
            <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2"><h3 className="text-sm font-semibold">Runs over time</h3><RunsOverTimeChart data={data.trends} /></div>
                <ChartCard title="Rolling average"><RollingFormChart data={data.rolling} /></ChartCard>
                <div className="space-y-2"><h3 className="text-sm font-semibold">Batting average</h3><AverageTrendChart data={data.trends} /></div>
                <div className="space-y-2"><h3 className="text-sm font-semibold">Strike rate</h3><StrikeRateTrendChart data={data.trends} /></div>
                <div className="space-y-2"><h3 className="text-sm font-semibold">Economy</h3><EconomyTrendChart data={data.trends} /></div>
                <div className="space-y-2"><h3 className="text-sm font-semibold">Wickets</h3><WicketsChart data={data.trends} /></div>
            </div>
            <ChartCard title="Year by year" table={<CountTable rows={data.years.map((year) => ({ label: year.year, count: year.runs }))} valueLabel="Runs" />}>
                <ScoreDistributionChart data={data.years.map((year) => ({ key: year.year, label: year.year, count: year.runs }))} />
            </ChartCard>
            <ChartCard title="Runs against strike rate" description="Each point is one batting innings.">
                <RunsVsSrScatter data={data.scatter} />
            </ChartCard>
            <section className="surface-chart space-y-3 p-4">
                <h3 className="text-sm font-semibold">Calendar</h3>
                <CalendarHeatmap cells={data.calendar} />
            </section>
        </div>
    );
}
