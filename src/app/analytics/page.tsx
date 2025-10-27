'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  battingAverage: number;
  bowlingAverage: number;
  strikeRate: number;
  economy: number;
  formatStats: Array<{
    _id: string;
    matches: number;
    totalRuns: number;
    totalWickets: number;
    avgRuns: number;
  }>;
  levelStats: Array<{
    _id: string;
    matches: number;
  }>;
  performanceOverTime: Array<{
    date: string;
    runs: number;
    strikeRate: number;
  }>;
  venueStats: Array<{
    _id: string;
    avgRuns: number;
  }>;
  opponentStats: Array<{
    _id: string;
    matches: number;
    avgRuns: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFormat !== 'all') params.append('format', selectedFormat);
      if (selectedLevel !== 'all') params.append('level', selectedLevel);

      const response = await fetch(`/api/analytics?${params}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch {
      console.error('Error fetching analytics');
    } finally {
      setLoading(false);
    }
  }, [selectedFormat, selectedLevel]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedFormat, selectedLevel, fetchAnalyticsData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              Start by adding player information and match data to see analytics.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Chart configurations
  const performanceOverTimeConfig = {
    data: {
      labels: data.performanceOverTime?.map(item => item.date) || [],
      datasets: [
        {
          label: 'Runs',
          data: data.performanceOverTime?.map(item => item.runs) || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y',
        },
        {
          label: 'Strike Rate',
          data: data.performanceOverTime?.map(item => item.strikeRate) || [],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Match Date',
          },
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Runs',
          },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Strike Rate',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: 'Performance Over Time',
        },
      },
    },
  };

  const formatStatsConfig = {
    data: {
      labels: data.formatStats?.map(item => item._id) || [],
      datasets: [
        {
          label: 'Matches',
          data: data.formatStats?.map(item => item.matches) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: 'Runs',
          data: data.formatStats?.map(item => item.totalRuns) || [],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
        },
        {
          label: 'Wickets',
          data: data.formatStats?.map(item => item.totalWickets) || [],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Performance by Format',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Format',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Count',
          },
        },
      },
    },
  };

  const levelDistributionConfig = {
    data: {
      labels: data.levelStats?.map(item => item._id) || [],
      datasets: [
        {
          data: data.levelStats?.map(item => item.matches) || [],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Matches by Level',
        },
        legend: {
          position: 'bottom' as const,
        },
      },
    },
  };

  const venuePerformanceConfig = {
    data: {
      labels: data.venueStats?.slice(0, 10).map(item => item._id) || [],
      datasets: [
        {
          label: 'Average Runs',
          data: data.venueStats?.slice(0, 10).map(item => item.avgRuns) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Top 10 Venues by Average Runs',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Venue',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Average Runs',
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Cricket Analytics Dashboard</h1>
            <p className="text-muted-foreground">Comprehensive performance insights and statistics</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Formats</option>
              <option value="Test">Test</option>
              <option value="ODI">ODI</option>
              <option value="T20">T20</option>
              <option value="First-class">First-class</option>
              <option value="List-A">List-A</option>
              <option value="T20-domestic">T20 Domestic</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Levels</option>
              <option value="school">School</option>
              <option value="domestic">Domestic</option>
              <option value="Ranji">Ranji Trophy</option>
              <option value="IPL">IPL</option>
              <option value="international">International</option>
            </select>
          </div>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                  <p className="text-2xl font-semibold">{data.totalMatches}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
                  <p className="text-2xl font-semibold">{data.totalRuns}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Wickets</p>
                  <p className="text-2xl font-semibold">{data.totalWickets}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Batting Average</p>
                  <p className="text-2xl font-semibold">{data.battingAverage?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strike Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{data.strikeRate?.toFixed(2) || '0.00'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bowling Average</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{data.bowlingAverage?.toFixed(2) || '0.00'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Economy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{data.economy?.toFixed(2) || '0.00'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Over Time */}
          <Card>
            <CardContent className="p-6">
              <Line {...performanceOverTimeConfig} />
            </CardContent>
          </Card>

          {/* Format Statistics */}
          <Card>
            <CardContent className="p-6">
              <Bar {...formatStatsConfig} />
            </CardContent>
          </Card>

          {/* Level Distribution */}
          <Card>
            <CardContent className="p-6">
              <Pie {...levelDistributionConfig} />
            </CardContent>
          </Card>

          {/* Venue Performance */}
          <Card>
            <CardContent className="p-6">
              <Bar {...venuePerformanceConfig} />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Opponent Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance vs Opponents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Opponent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Matches
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Avg Runs
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.opponentStats?.slice(0, 5).map((opponent, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {opponent._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {opponent.matches}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {opponent.avgRuns?.toFixed(2) || '0.00'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Format Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Format Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.formatStats?.map((format, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{format._id}</p>
                      <p className="text-sm text-muted-foreground">{format.matches} matches</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{format.totalRuns} runs</p>
                      <p className="text-sm text-muted-foreground">Avg: {format.avgRuns?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}