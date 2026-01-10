import { Suspense } from "react";
import { StatCard, Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  RunsOverTimeChart,
  FormatBreakdownChart,
  RecentFormChart,
} from "@/components/charts";
import { getCareerSummary, getFormatBreakdown, getTrendData } from "@/lib/services/analytics.service";
import { PLAYER } from "@/lib/constants";
import { formatBattingScore, formatBowlingFigures } from "@/lib/utils";
import Link from "next/link";
import { PlusCircle, ArrowRight } from "lucide-react";

async function DashboardContent() {
  const [summary, formats, trends] = await Promise.all([
    getCareerSummary(),
    getFormatBreakdown(),
    getTrendData(),
  ]);

  const hasData = summary.matches > 0;

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest">
            Welcome Back
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            {PLAYER.name}
          </h1>
          <p className="text-gray-400 font-medium max-w-md">
            Track your journey, analyze performance, and master your game with precision analytics.
          </p>
        </div>
        <Link
          href="/data-entry"
          className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] active:scale-95"
        >
          <PlusCircle size={20} />
          Add Performance
        </Link>
      </div>

      {!hasData ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center animate-float">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center text-4xl mb-6 border border-blue-500/20">
            🏏
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Ready to Start Your Career Analysis?
          </h2>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Your dashboard is currently empty. Add your first match performance to unlock detailed insights and visualizations.
          </p>
          <Link
            href="/data-entry"
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Add First Match
            <ArrowRight size={18} />
          </Link>
        </Card>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">
              Primary Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <StatCard
                title="Matches"
                value={summary.matches}
                icon="🏏"
              />
              <StatCard
                title="Runs"
                value={summary.runs.toLocaleString()}
                subtitle={`Avg: ${summary.battingAverage ?? "-"}`}
                icon="🏃"
              />
              <StatCard
                title="Highest"
                value={formatBattingScore(
                  summary.highestScore.runs,
                  summary.highestScore.isNotOut
                )}
                icon="⭐"
              />
              <StatCard
                title="Wickets"
                value={summary.wickets}
                subtitle={`Avg: ${summary.bowlingAverage ?? "-"}`}
                icon="🎯"
              />
              <StatCard
                title="Best Bowling"
                value={formatBowlingFigures(
                  summary.bestBowling.wickets,
                  summary.bestBowling.runs
                )}
                icon="🔥"
              />
              <StatCard
                title="Catches"
                value={summary.catches}
                icon="🧤"
              />
            </div>
          </div>

          {/* Secondary Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 px-1">
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
              <div key={i} className="glass-card p-4 rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{stat.label}</span>
                <span className="text-xl font-black text-white">{stat.value}</span>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Performance Trends</h2>
              {trends.length > 0 && <RunsOverTimeChart data={trends} />}
            </div>
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Format Breakdown</h2>
              {formats.length > 0 && <FormatBreakdownChart data={formats} metric="runs" />}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Bowling Efficiency</h2>
              {formats.length > 0 && <FormatBreakdownChart data={formats} metric="wickets" />}
            </div>
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Recent Form</h2>
              {trends.length > 0 && <RecentFormChart data={trends} limit={10} />}
            </div>
          </div>

          {/* Format Table */}
          {formats.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400/80 px-1">Format-wise Comparison</h2>
              <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/10">
                        <th className="text-left py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Format</th>
                        <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Mat</th>
                        <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Runs</th>
                        <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Avg</th>
                        <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">SR</th>
                        <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">50/100</th>
                        <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Wkts</th>
                        <th className="text-center py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Econ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {formats.map((f) => (
                        <tr key={f.format} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6 text-white font-bold">{f.format}</td>
                          <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.matches}</td>
                          <td className="text-center py-4 px-6 font-black text-blue-400">{f.runs}</td>
                          <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.battingAverage ?? "-"}</td>
                          <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.strikeRate}</td>
                          <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.fifties}/{f.centuries}</td>
                          <td className="text-center py-4 px-6 font-black text-emerald-400">{f.wickets}</td>
                          <td className="text-center py-4 px-6 text-gray-300 font-medium">{f.economy}</td>
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500/20 border-t-blue-500"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 animate-pulse">Analyzing Statistics...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}