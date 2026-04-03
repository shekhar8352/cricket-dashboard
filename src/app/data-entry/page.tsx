import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/SectionHeader";
import { getAllSeries } from "@/lib/services/series.service";
import { getAllMatches } from "@/lib/services/match.service";
import { formatDate } from "@/lib/utils";

export default async function DataEntryPage() {
    const [series, matches] = await Promise.all([
        getAllSeries(),
        getAllMatches(),
    ]);

    // Get recent matches (last 5)
    const recentMatches = matches.slice(0, 5);

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="Input"
                title="Data entry"
                description="Create series, log matches, and attach performances from one hub."
            />

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/data-entry/series">
                    <Card className="h-full cursor-pointer transition-colors hover:border-primary/40">
                        <CardHeader>
                            <div className="text-4xl mb-2">📋</div>
                            <CardTitle>Manage Series</CardTitle>
                            <CardDescription>
                                Create or edit series and tournaments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-semibold text-primary">{series.length} series →</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/data-entry/match">
                    <Card className="h-full cursor-pointer transition-colors hover:border-primary/40">
                        <CardHeader>
                            <div className="text-4xl mb-2">🏏</div>
                            <CardTitle>Add Match</CardTitle>
                            <CardDescription>
                                Create a new match and enter performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-semibold text-primary">{matches.length} matches →</p>
                        </CardContent>
                    </Card>
                </Link>

                <Card variant="highlight" className="border-primary/20">
                    <CardHeader>
                        <div className="text-4xl mb-2">📊</div>
                        <CardTitle>Quick Stats</CardTitle>
                        <CardDescription>
                            Your data entry summary
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Series</span>
                                <span className="text-white font-medium">{series.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total Matches</span>
                                <span className="text-white font-medium">{matches.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">With Performance</span>
                                <span className="text-white font-medium">
                                    {matches.filter((m) => m.hasPerformance).length}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Matches */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Matches</CardTitle>
                    <CardDescription>
                        Your most recently added matches
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {recentMatches.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p>No matches added yet.</p>
                            <Link
                                href="/data-entry/match"
                                className="text-blue-400 hover:underline mt-2 inline-block"
                            >
                                Add your first match →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentMatches.map((match) => (
                                <Link
                                    key={match._id}
                                    href={`/data-entry/match/${match._id}`}
                                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                                            🏏
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">
                                                vs {match.opponent}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {match.format} • {match.venue} • {formatDate(match.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {match.result && (
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded ${match.result === "won"
                                                        ? "bg-green-900/50 text-green-400"
                                                        : match.result === "lost"
                                                            ? "bg-red-900/50 text-red-400"
                                                            : "bg-gray-700 text-gray-300"
                                                    }`}
                                            >
                                                {match.result.toUpperCase()}
                                            </span>
                                        )}
                                        {match.hasPerformance ? (
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-900/50 text-blue-400 rounded">
                                                ✓ Performance
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-medium bg-amber-900/50 text-amber-400 rounded">
                                                + Add Performance
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Data Entry Flow Guide */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Entry Flow</CardTitle>
                    <CardDescription>
                        Recommended steps for entering your match data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                            <div className="text-2xl mb-2">1️⃣</div>
                            <h4 className="font-medium text-white mb-1">Create Series</h4>
                            <p className="text-sm text-gray-400">
                                First, create the series or tournament the match belongs to (optional).
                            </p>
                        </div>
                        <div className="flex-1 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                            <div className="text-2xl mb-2">2️⃣</div>
                            <h4 className="font-medium text-white mb-1">Add Match</h4>
                            <p className="text-sm text-gray-400">
                                Create the match with venue, opponent, and other metadata.
                            </p>
                        </div>
                        <div className="flex-1 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                            <div className="text-2xl mb-2">3️⃣</div>
                            <h4 className="font-medium text-white mb-1">Enter Performance</h4>
                            <p className="text-sm text-gray-400">
                                Add your batting, bowling, and fielding stats for the match.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
