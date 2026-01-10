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

async function DashboardContent() {
  const [summary, formats, trends] = await Promise.all([
    getCareerSummary(),
    getFormatBreakdown(),
    getTrendData(),
  ]);

  const hasData = summary.matches > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{PLAYER.name}</h1>
          <p className="text-gray-400 mt-1">Career Analytics Dashboard</p>
        </div>
        <Link
          href="/data-entry"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <span>✏️</span>
          Add Performance
        </Link>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="text-center py-12">
            <span className="text-6xl mb-4 block">🏏</span>
            <h2 className="text-xl font-semibold text-white mb-2">
              Welcome to Your Cricket Analytics Dashboard
            </h2>
            <p className="text-gray-400 mb-6">
              Start by adding your first match performance to see your career statistics.
            </p>
            <Link
              href="/data-entry"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Add First Match →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Career Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <StatCard title="50s" value={summary.fifties} />
            <StatCard title="100s" value={summary.centuries} />
            <StatCard title="Strike Rate" value={summary.strikeRate} />
            <StatCard title="Economy" value={summary.economy} />
            <StatCard title="5W Hauls" value={summary.fiveWicketHauls} />
            <StatCard title="Ducks" value={summary.ducks} />
            <StatCard title="Not Outs" value={summary.notOuts} />
            <StatCard title="Win %" value={`${summary.winPercentage}%`} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trends.length > 0 && <RunsOverTimeChart data={trends} />}
            {formats.length > 0 && <FormatBreakdownChart data={formats} metric="runs" />}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {formats.length > 0 && <FormatBreakdownChart data={formats} metric="wickets" />}
            {trends.length > 0 && <RecentFormChart data={trends} limit={10} />}
          </div>

          {/* Format Breakdown Table */}
          {formats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Format-wise Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Format</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Mat</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Runs</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Avg</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">SR</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">50s</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">100s</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Wkts</th>
                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Econ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formats.map((f) => (
                        <tr key={f.format} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-3 px-4 text-white font-medium">{f.format}</td>
                          <td className="text-center py-3 px-4 text-gray-300">{f.matches}</td>
                          <td className="text-center py-3 px-4 text-gray-300">{f.runs}</td>
                          <td className="text-center py-3 px-4 text-gray-300">{f.battingAverage ?? "-"}</td>
                          <td className="text-center py-3 px-4 text-gray-300">{f.strikeRate}</td>
                          <td className="text-center py-3 px-4 text-gray-300">{f.fifties}</td>
                          <td className="text-center py-3 px-4 text-gray-300">{f.centuries}</td>
                          <td className="text-center py-3 px-4 text-gray-300">{f.wickets}</td>
                          <td className="text-center py-3 px-4 text-gray-300">{f.economy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}