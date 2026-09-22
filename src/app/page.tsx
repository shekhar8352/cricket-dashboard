import { Suspense } from "react";
import { StatCard, Card } from "@/components/ui/Card";
import { PageHeader, SectionHeader } from "@/components/ui/SectionHeader";
import {
  RunsOverTimeChart,
  FormatBreakdownChart,
  RecentFormChart,
  SkillsRadarChart,
} from "@/components/charts";
import { getHomeDashboard } from "@/lib/services/analytics.service";
import { PLAYER } from "@/lib/constants";
import { formatBattingScore, formatBowlingFigures } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, Crosshair, Flame, Hand, PlusCircle, Star, Swords, Trophy } from "lucide-react";

async function DashboardContent() {
  const { summary, formats, trends, form, radar } = await getHomeDashboard();

  const hasData = summary.matches > 0;

  return (
    <div className="space-y-10 pb-12">
      <PageHeader
        eyebrow="Dashboard"
        title={PLAYER.name}
        description="Track performances, spot trends, and keep your career stats in one calm workspace."
        action={
          <Link
            href="/data-entry"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            <PlusCircle size={20} strokeWidth={1.75} aria-hidden />
            Add performance
          </Link>
        }
      />

      {!hasData ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center sm:p-12">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card text-primary">
            <Trophy size={28} aria-hidden />
          </div>
          <h2 className="mb-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Start your career log
          </h2>
          <p className="mb-8 max-w-sm text-muted-foreground">
            Add a match and performance to unlock charts, filters, and opponent breakdowns.
          </p>
          <Link
            href="/data-entry"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            Add first match
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden />
          </Link>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            <SectionHeader
              eyebrow="Summary"
              title="Career snapshot"
              description="Numbers pulled from every performance you have logged."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 sm:gap-5">
              <StatCard title="Matches" value={summary.matches} icon={Trophy} />
              <StatCard
                title="Runs"
                value={summary.runs.toLocaleString()}
                subtitle={`Avg: ${summary.battingAverage ?? "-"}`}
                icon={Swords}
              />
              <StatCard
                title="Highest"
                value={formatBattingScore(
                  summary.highestScore.runs,
                  summary.highestScore.isNotOut
                )}
                icon={Star}
              />
              <StatCard
                title="Wickets"
                value={summary.wickets}
                subtitle={`Avg: ${summary.bowlingAverage ?? "-"}`}
                icon={Crosshair}
              />
              <StatCard
                title="Best Bowling"
                value={formatBowlingFigures(
                  summary.bestBowling.wickets,
                  summary.bestBowling.runs
                )}
                icon={Flame}
              />
              <StatCard title="Catches" value={summary.catches} icon={Hand} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8 sm:gap-4">
            {[
              { label: "50s", value: summary.fifties },
              { label: "100s", value: summary.centuries },
              { label: "SR", value: summary.strikeRate },
              { label: "Econ", value: summary.economy },
              { label: "5W", value: summary.fiveWicketHauls },
              { label: "0s", value: summary.ducks },
              { label: "NO", value: summary.notOuts },
              { label: "Win %", value: `${summary.winPercentage}%` },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-card flex flex-col items-center justify-center rounded-lg px-2 py-3.5 text-center sm:py-4"
              >
                <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </span>
                <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="surface-panel space-y-2 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last 5 average</p>
              <p className="font-mono text-3xl font-semibold tabular-nums">{form.last5.average ?? "—"}</p>
              <p className="text-sm text-muted-foreground">Career {form.careerAverage ?? "—"} · SR {form.last5.strikeRate}</p>
            </div>
            <div className="surface-panel space-y-2 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last 10 average</p>
              <p className="font-mono text-3xl font-semibold tabular-nums">{form.last10.average ?? "—"}</p>
              <p className="text-sm text-muted-foreground">Career SR {form.careerStrikeRate}</p>
              <Link href="/analytics?tab=batting" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">
                Open batting
                <ArrowRight size={16} className="ml-1" aria-hidden />
              </Link>
            </div>
            <div className="surface-chart h-64 p-4">
              <SkillsRadarChart data={radar} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3">
              <SectionHeader
                title="Performance trend"
                description="Runs by match with cumulative total on the secondary axis."
              />
              {trends.length > 0 && <RunsOverTimeChart data={trends} />}
            </div>
            <div className="space-y-3">
              <SectionHeader title="Runs by format" description="Share of runs across formats you play." />
              {formats.length > 0 && <FormatBreakdownChart data={formats} metric="runs" />}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="space-y-3">
              <SectionHeader title="Wickets by format" description="Where your bowling shows up most." />
              {formats.length > 0 && <FormatBreakdownChart data={formats} metric="wickets" />}
            </div>
            <div className="space-y-3">
              <SectionHeader title="Recent form" description="Last ten innings scores at a glance." />
              {trends.length > 0 && <RecentFormChart data={trends} limit={10} />}
            </div>
          </div>

          {formats.length > 0 && (
            <div className="space-y-3">
              <SectionHeader title="Format comparison" description="Side-by-side batting and bowling columns." />
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Format</th>
                        <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Mat</th>
                        <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Runs</th>
                        <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Avg</th>
                        <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">SR</th>
                        <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">50/100</th>
                        <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Wkts</th>
                        <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:px-6">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {formats.map((f) => (
                        <tr key={f.format} className="transition-colors hover:bg-muted/20">
                          <td className="px-4 py-3.5 font-semibold text-foreground sm:px-6">{f.format}</td>
                          <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.matches}</td>
                          <td className="px-4 py-3.5 text-center font-mono font-semibold tabular-nums text-primary sm:px-6">{f.runs}</td>
                          <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.battingAverage ?? "-"}</td>
                          <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.strikeRate}</td>
                          <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.fifties}/{f.centuries}</td>
                          <td className="px-4 py-3.5 text-center font-mono font-semibold tabular-nums text-accent-foreground sm:px-6">{f.wickets}</td>
                          <td className="px-4 py-3.5 text-center font-mono tabular-nums text-muted-foreground sm:px-6">{f.economy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary"
            role="status"
            aria-label="Loading"
          />
          <p className="text-xs font-medium text-muted-foreground">Loading dashboard…</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}