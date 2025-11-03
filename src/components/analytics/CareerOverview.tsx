'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    ArcElement
);

interface CareerStats {
    totalMatches: {
        overall: number;
        test: number;
        odi: number;
        t20: number;
        firstClass: number;
        listA: number;
        t20Domestic: number;
    };
    totalRuns: number;
    totalWickets: number;
    battingAverage: number;
    bowlingAverage: number;
    battingStrikeRate: number;
    bowlingStrikeRate: number;
    centuries: number;
    halfCenturies: number;
    thirties: number;
    bestBowlingFigures: string;
    fiveWicketHauls: number;
    tenWicketHauls: number;
    totalCatches: number;
    totalStumpings: number;
    totalRunOuts: number;
    notOuts: number;
    highestScore: number;
    careerSpan: {
        startYear: number;
        endYear?: number;
        duration: number;
    };
    formatStats: Array<{
        format: string;
        matches: number;
        runs: number;
        wickets: number;
        average: number;
        strikeRate: number;
        economy: number;
    }>;
    yearlyStats: Array<{
        year: number;
        matches: number;
        runs: number;
        wickets: number;
        average: number;
        strikeRate: number;
        economy: number;
        impactScore: number;
    }>;
}

export default function CareerOverview() {
    const [careerStats, setCareerStats] = useState<CareerStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCareerStats();
    }, []);

    const fetchCareerStats = async () => {
        try {
            const response = await fetch('/api/analytics/career');
            const data = await response.json();
            if (data.success) {
                setCareerStats(data.analytics);
            }
        } catch (error) {
            console.error('Error fetching career stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8">Loading career overview...</div>;
    }

    if (!careerStats) {
        return <div className="text-center p-8">No career data available</div>;
    }

    // Chart configurations
    const formatComparisonChart = {
        labels: careerStats.formatStats.map(f => f.format),
        datasets: [
            {
                label: 'Runs',
                data: careerStats.formatStats.map(f => f.runs),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                yAxisID: 'y',
            },
            {
                label: 'Wickets',
                data: careerStats.formatStats.map(f => f.wickets),
                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                yAxisID: 'y1',
            }
        ]
    };

    const careerProgressionChart = {
        labels: careerStats.yearlyStats?.map((y: any) => y.year.toString()) || [],
        datasets: [
            {
                label: 'Runs per Year',
                data: careerStats.yearlyStats?.map((y: any) => y.runs) || [],
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.1
            },
            {
                label: 'Wickets per Year',
                data: careerStats.yearlyStats?.map((y: any) => y.wickets) || [],
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                tension: 0.1,
                yAxisID: 'y1'
            }
        ]
    };

    const contributionChart = {
        labels: ['Batting', 'Bowling', 'Fielding'],
        datasets: [{
            data: [
                careerStats.totalRuns / 100, // Scale for visibility
                careerStats.totalWickets * 10, // Scale for visibility
                (careerStats.totalCatches + careerStats.totalStumpings + careerStats.totalRunOuts) * 5
            ],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)'
            ]
        }]
    };

    const milestonesChart = {
        labels: ['100s', '50s', '30s', '5W', '10W'],
        datasets: [{
            label: 'Milestones',
            data: [
                careerStats.centuries,
                careerStats.halfCenturies,
                careerStats.thirties,
                careerStats.fiveWicketHauls,
                careerStats.tenWicketHauls
            ],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ]
        }]
    };

    return (
        <div className="space-y-6">
            {/* Career Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{careerStats.totalMatches.overall}</div>
                        <p className="text-xs text-muted-foreground">
                            {careerStats.careerSpan.startYear} - {careerStats.careerSpan.endYear || 'Present'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{careerStats.totalRuns.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Avg: {careerStats.battingAverage.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Wickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{careerStats.totalWickets}</div>
                        <p className="text-xs text-muted-foreground">
                            Avg: {careerStats.bowlingAverage.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Strike Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {careerStats.battingStrikeRate.toFixed(1)} / {careerStats.bowlingStrikeRate.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">Bat / Bowl</p>
                    </CardContent>
                </Card>
            </div>

            {/* Batting Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Centuries & Fifties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>100s:</span>
                                <span className="font-bold">{careerStats.centuries}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>50s:</span>
                                <span className="font-bold">{careerStats.halfCenturies}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>30s:</span>
                                <span className="font-bold">{careerStats.thirties}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Bowling Milestones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>5W Hauls:</span>
                                <span className="font-bold">{careerStats.fiveWicketHauls}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>10W Hauls:</span>
                                <span className="font-bold">{careerStats.tenWicketHauls}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Best Figures:</span>
                                <span className="font-bold">{careerStats.bestBowlingFigures || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Fielding</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Catches:</span>
                                <span className="font-bold">{careerStats.totalCatches}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Stumpings:</span>
                                <span className="font-bold">{careerStats.totalStumpings}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Run Outs:</span>
                                <span className="font-bold">{careerStats.totalRunOuts}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Format-wise Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle>Format-wise Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2">Format</th>
                                    <th className="text-right p-2">Matches</th>
                                    <th className="text-right p-2">Runs</th>
                                    <th className="text-right p-2">Wickets</th>
                                    <th className="text-right p-2">Bat Avg</th>
                                    <th className="text-right p-2">Strike Rate</th>
                                    <th className="text-right p-2">Economy</th>
                                </tr>
                            </thead>
                            <tbody>
                                {careerStats.formatStats.map((format, index) => (
                                    <tr key={index} className="border-b">
                                        <td className="p-2 font-medium">{format.format}</td>
                                        <td className="text-right p-2">{format.matches}</td>
                                        <td className="text-right p-2">{format.runs.toLocaleString()}</td>
                                        <td className="text-right p-2">{format.wickets}</td>
                                        <td className="text-right p-2">{format.average.toFixed(2)}</td>
                                        <td className="text-right p-2">{format.strikeRate.toFixed(1)}</td>
                                        <td className="text-right p-2">{format.economy.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Career Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Career Highlights</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span>Highest Score:</span>
                                <span className="font-bold">{careerStats.highestScore}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Not Outs:</span>
                                <span className="font-bold">{careerStats.notOuts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Career Span:</span>
                                <span className="font-bold">{careerStats.careerSpan.duration} years</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Match Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Test:</span>
                                <span className="font-bold">{careerStats.totalMatches.test}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ODI:</span>
                                <span className="font-bold">{careerStats.totalMatches.odi}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>T20:</span>
                                <span className="font-bold">{careerStats.totalMatches.t20}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>First-class:</span>
                                <span className="font-bold">{careerStats.totalMatches.firstClass}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <Tabs defaultValue="progression" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="progression">Career Progression</TabsTrigger>
                    <TabsTrigger value="formats">Format Comparison</TabsTrigger>
                    <TabsTrigger value="contribution">Contribution</TabsTrigger>
                    <TabsTrigger value="milestones">Milestones</TabsTrigger>
                </TabsList>

                <TabsContent value="progression" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Career Progression Over Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Line
                                data={careerProgressionChart}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Runs and Wickets by Year'
                                        }
                                    },
                                    scales: {
                                        y: {
                                            type: 'linear',
                                            display: true,
                                            position: 'left',
                                            title: {
                                                display: true,
                                                text: 'Runs'
                                            }
                                        },
                                        y1: {
                                            type: 'linear',
                                            display: true,
                                            position: 'right',
                                            title: {
                                                display: true,
                                                text: 'Wickets'
                                            },
                                            grid: {
                                                drawOnChartArea: false,
                                            },
                                        },
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="formats" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance by Format</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Bar
                                data={formatComparisonChart}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Runs and Wickets by Format'
                                        }
                                    },
                                    scales: {
                                        y: {
                                            type: 'linear',
                                            display: true,
                                            position: 'left',
                                            title: {
                                                display: true,
                                                text: 'Runs'
                                            }
                                        },
                                        y1: {
                                            type: 'linear',
                                            display: true,
                                            position: 'right',
                                            title: {
                                                display: true,
                                                text: 'Wickets'
                                            },
                                            grid: {
                                                drawOnChartArea: false,
                                            },
                                        },
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contribution" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Contribution Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Doughnut
                                data={contributionChart}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Batting vs Bowling vs Fielding Contribution'
                                        },
                                        legend: {
                                            position: 'bottom'
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="milestones" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Career Milestones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Bar
                                data={milestonesChart}
                                options={{
                                    responsive: true,
                                    plugins: {
                                        title: {
                                            display: true,
                                            text: 'Major Career Milestones'
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Count'
                                            }
                                        }
                                    }
                                }}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}