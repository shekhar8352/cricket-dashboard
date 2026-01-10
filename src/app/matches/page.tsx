import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { getAllMatches } from "@/lib/services/match.service";
import { formatDate, formatBattingScore } from "@/lib/utils";
import { getPerformanceByMatchId } from "@/lib/services/performance.service";

export default async function MatchesPage() {
    const matches = await getAllMatches();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Match History</h1>
                <p className="text-gray-400 mt-1">
                    All your recorded matches ({matches.length} total)
                </p>
            </div>

            {/* Match List */}
            <Card>
                <CardContent>
                    {matches.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <p>No matches recorded yet.</p>
                            <Link
                                href="/data-entry/match"
                                className="text-blue-400 hover:underline mt-2 inline-block"
                            >
                                Add your first match →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Opponent</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Format</th>
                                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Venue</th>
                                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Result</th>
                                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Performance</th>
                                        <th className="text-center py-3 px-4 text-gray-400 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matches.map((match) => (
                                        <tr
                                            key={match._id}
                                            className="border-b border-gray-800/50 hover:bg-gray-800/30"
                                        >
                                            <td className="py-4 px-4 text-gray-300">
                                                {formatDate(match.date)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-white font-medium">{match.opponent}</span>
                                                {match.series && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {match.series.name}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded">
                                                    {match.format}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-300">
                                                {match.venue}, {match.city}
                                            </td>
                                            <td className="text-center py-4 px-4">
                                                {match.result ? (
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium rounded ${match.result === "won"
                                                                ? "bg-green-900/50 text-green-400"
                                                                : match.result === "lost"
                                                                    ? "bg-red-900/50 text-red-400"
                                                                    : match.result === "draw"
                                                                        ? "bg-yellow-900/50 text-yellow-400"
                                                                        : "bg-gray-700 text-gray-300"
                                                            }`}
                                                    >
                                                        {match.result.toUpperCase()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="text-center py-4 px-4">
                                                {match.hasPerformance ? (
                                                    <span className="text-emerald-400">✓</span>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="text-center py-4 px-4">
                                                <Link
                                                    href={`/data-entry/match/${match._id}`}
                                                    className="text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    View/Edit
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Summary */}
            {matches.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent>
                            <p className="text-gray-400 text-sm">Total Matches</p>
                            <p className="text-2xl font-bold text-white">{matches.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <p className="text-gray-400 text-sm">Matches Won</p>
                            <p className="text-2xl font-bold text-green-400">
                                {matches.filter((m) => m.result === "won").length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <p className="text-gray-400 text-sm">Matches Lost</p>
                            <p className="text-2xl font-bold text-red-400">
                                {matches.filter((m) => m.result === "lost").length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent>
                            <p className="text-gray-400 text-sm">With Performance</p>
                            <p className="text-2xl font-bold text-blue-400">
                                {matches.filter((m) => m.hasPerformance).length}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
