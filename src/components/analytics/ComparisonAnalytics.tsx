'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, Radar, Line, Scatter } from 'react-chartjs-2';
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
  RadialLinearScale,
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
  RadialLinearScale
);

interface ComparisonData {
  formatComparison: {
    test: { matches: number; runs: number; wickets: number; average: number; strikeRate: number; economy: number; };
    odi: { matches: number; runs: number; wickets: number; average: number; strikeRate: number; economy: number; };
    t20: { matches: number; runs: number; wickets: number; average: number; strikeRate: number; economy: number; };
  };
  homeAwayComparison: {
    home: { matches: number; runs: number; wickets: number; average: number; strikeRate: number; economy: number; };
    away: { matches: number; runs: number; wickets: number; average: number; strikeRate: number; economy: number; };
  };
  inningsComparison: {
    firstInnings: { matches: number; runs: number; wickets: number; average: number; strikeRate: number; };
    chasing: { matches: number; runs: number; wickets: number; average: number; strikeRate: number; successRate: number; };
  };
  yearlyComparison: Array<{
    year: number;
    matches: number;
    runs: number;
    wickets: number;
    average: number;
    strikeRate: number;
    economy: number;
  }>;
  oppositionComparison: Array<{
    opponent: string;
    matches: number;
    runs: number;
    wickets: number;
    average: number;
    strikeRate: number;
    economy: number;
    winRate: number;
  }>;
  dayNightComparison: {
    day: { matches: number; runs: number; wickets: number; average: number; strikeRate: number; };
    dayNight: { matches: number; runs: number; wickets: number; average: number; strikeRate: number; };
  };
}

export default function ComparisonAnalytics() {
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, we'll use mock data since the API endpoint doesn't exist yet
    // In a real implementation, this would fetch from /api/analytics/comparison
    setComparisonData({
      formatComparison: {
        test: { matches: 45, runs: 3200, wickets: 85, average: 42.5, strikeRate: 58.2, economy: 3.2 },
        odi: { matches: 78, runs: 2850, wickets: 92, average: 38.7, strikeRate: 89.4, economy: 5.1 },
        t20: { matches: 65, runs: 1650, wickets: 68, average: 28.9, strikeRate: 135.6, economy: 7.8 }
      },
      homeAwayComparison: {
        home: { matches: 94, runs: 3850, wickets: 125, average: 41.2, strikeRate: 82.5, economy: 4.8 },
        away: { matches: 94, runs: 3845, wickets: 120, average: 39.8, strikeRate: 78.9, economy: 5.2 }
      },
      inningsComparison: {
        firstInnings: { matches: 95, runs: 4200, wickets: 130, average: 42.8, strikeRate: 75.6 },
        chasing: { matches: 93, runs: 3495, wickets: 115, average: 38.2, strikeRate: 88.4, successRate: 68.5 }
      },
      yearlyComparison: [
        { year: 2020, matches: 12, runs: 580, wickets: 18, average: 38.7, strikeRate: 82.1, economy: 4.9 },
        { year: 2021, matches: 18, runs: 920, wickets: 28, average: 42.3, strikeRate: 85.2, economy: 4.6 },
        { year: 2022, matches: 22, runs: 1150, wickets: 35, average: 45.2, strikeRate: 88.7, economy: 4.2 },
        { year: 2023, matches: 28, runs: 1380, wickets: 42, average: 41.8, strikeRate: 91.3, economy: 4.8 },
        { year: 2024, matches: 32, runs: 1620, wickets: 48, average: 43.2, strikeRate: 89.5, economy: 4.5 }
      ],
      oppositionComparison: [
        { opponent: 'Australia', matches: 25, runs: 1150, wickets: 32, average: 42.6, strikeRate: 85.2, economy: 4.8, winRate: 64.0 },
        { opponent: 'England', matches: 22, runs: 980, wickets: 28, average: 39.2, strikeRate: 88.1, economy: 5.1, winRate: 59.1 },
        { opponent: 'South Africa', matches: 18, runs: 820, wickets: 24, average: 41.0, strikeRate: 82.5, economy: 4.6, winRate: 66.7 },
        { opponent: 'New Zealand', matches: 15, runs: 680, wickets: 20, average: 40.0, strikeRate: 86.3, economy: 4.9, winRate: 73.3 },
        { opponent: 'Pakistan', matches: 20, runs: 850, wickets: 26, average: 37.8, strikeRate: 89.7, economy: 5.3, winRate: 55.0 }
      ],
      dayNightComparison: {
        day: { matches: 145, runs: 6200, wickets: 195, average: 41.3, strikeRate: 79.8 },
        dayNight: { matches: 43, runs: 1495, wickets: 50, average: 38.7, strikeRate: 85.2 }
      }
    });
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Loading comparison analytics...</div>;
  }

  if (!comparisonData) {
    return <div className="text-center p-8">No comparison data available</div>;
  }

  // Chart configurations
  const formatComparisonChart = {
    labels: ['Matches', 'Runs', 'Wickets', 'Average', 'Strike Rate'],
    datasets: [
      {
        label: 'Test',
        data: [
          comparisonData.formatComparison.test.matches,
          comparisonData.formatComparison.test.runs / 100, // Scale down for visibility
          comparisonData.formatComparison.test.wickets,
          comparisonData.formatComparison.test.average,
          comparisonData.formatComparison.test.strikeRate
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'ODI',
        data: [
          comparisonData.formatComparison.odi.matches,
          comparisonData.formatComparison.odi.runs / 100,
          comparisonData.formatComparison.odi.wickets,
          comparisonData.formatComparison.odi.average,
          comparisonData.formatComparison.odi.strikeRate
        ],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'T20',
        data: [
          comparisonData.formatComparison.t20.matches,
          comparisonData.formatComparison.t20.runs / 100,
          comparisonData.formatComparison.t20.wickets,
          comparisonData.formatComparison.t20.average,
          comparisonData.formatComparison.t20.strikeRate
        ],
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      }
    ]
  };

  const homeAwayRadarChart = {
    labels: ['Matches', 'Runs (÷100)', 'Wickets', 'Average', 'Strike Rate'],
    datasets: [
      {
        label: 'Home',
        data: [
          comparisonData.homeAwayComparison.home.matches,
          comparisonData.homeAwayComparison.home.runs / 100,
          comparisonData.homeAwayComparison.home.wickets,
          comparisonData.homeAwayComparison.home.average,
          comparisonData.homeAwayComparison.home.strikeRate
        ],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
      },
      {
        label: 'Away',
        data: [
          comparisonData.homeAwayComparison.away.matches,
          comparisonData.homeAwayComparison.away.runs / 100,
          comparisonData.homeAwayComparison.away.wickets,
          comparisonData.homeAwayComparison.away.average,
          comparisonData.homeAwayComparison.away.strikeRate
        ],
        borderColor: 'rgba(239, 68, 68, 1)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
      }
    ]
  };

  const yearlyTrendChart = {
    labels: comparisonData.yearlyComparison.map(y => y.year.toString()),
    datasets: [
      {
        label: 'Runs',
        data: comparisonData.yearlyComparison.map(y => y.runs),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Wickets',
        data: comparisonData.yearlyComparison.map(y => y.wickets),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        yAxisID: 'y1',
      }
    ]
  };

  const oppositionPerformanceChart = {
    labels: comparisonData.oppositionComparison.map(o => o.opponent),
    datasets: [
      {
        label: 'Average',
        data: comparisonData.oppositionComparison.map(o => o.average),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Strike Rate',
        data: comparisonData.oppositionComparison.map(o => o.strikeRate),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Win Rate',
        data: comparisonData.oppositionComparison.map(o => o.winRate),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      }
    ]
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="formats" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="homeaway">Home vs Away</TabsTrigger>
          <TabsTrigger value="innings">Innings</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
          <TabsTrigger value="opposition">Opposition</TabsTrigger>
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="formats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Cricket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{comparisonData.formatComparison.test.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{comparisonData.formatComparison.test.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{comparisonData.formatComparison.test.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{comparisonData.formatComparison.test.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{comparisonData.formatComparison.test.strikeRate.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economy:</span>
                    <span className="font-bold">{comparisonData.formatComparison.test.economy.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ODI Cricket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{comparisonData.formatComparison.odi.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{comparisonData.formatComparison.odi.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{comparisonData.formatComparison.odi.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{comparisonData.formatComparison.odi.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{comparisonData.formatComparison.odi.strikeRate.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economy:</span>
                    <span className="font-bold">{comparisonData.formatComparison.odi.economy.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>T20 Cricket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{comparisonData.formatComparison.t20.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{comparisonData.formatComparison.t20.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{comparisonData.formatComparison.t20.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{comparisonData.formatComparison.t20.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{comparisonData.formatComparison.t20.strikeRate.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economy:</span>
                    <span className="font-bold">{comparisonData.formatComparison.t20.economy.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Format Comparison Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={formatComparisonChart} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homeaway" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Home Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.home.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.home.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.home.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.home.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.home.strikeRate.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Away Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.away.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.away.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.away.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.away.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{comparisonData.homeAwayComparison.away.strikeRate.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Home vs Away Radar Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Radar data={homeAwayRadarChart} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="innings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>First Innings Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.firstInnings.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.firstInnings.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.firstInnings.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.firstInnings.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.firstInnings.strikeRate.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chasing Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.chasing.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.chasing.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.chasing.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.chasing.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{comparisonData.inningsComparison.chasing.strikeRate.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-bold text-green-600">{comparisonData.inningsComparison.chasing.successRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">Matches</th>
                      <th className="text-right p-2">Runs</th>
                      <th className="text-right p-2">Wickets</th>
                      <th className="text-right p-2">Average</th>
                      <th className="text-right p-2">Strike Rate</th>
                      <th className="text-right p-2">Economy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.yearlyComparison.map((year, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{year.year}</td>
                        <td className="text-right p-2">{year.matches}</td>
                        <td className="text-right p-2">{year.runs.toLocaleString()}</td>
                        <td className="text-right p-2">{year.wickets}</td>
                        <td className="text-right p-2">{year.average.toFixed(2)}</td>
                        <td className="text-right p-2">{year.strikeRate.toFixed(1)}</td>
                        <td className="text-right p-2">{year.economy.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yearly Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Line 
                data={yearlyTrendChart} 
                options={{ 
                  responsive: true,
                  scales: {
                    y: {
                      type: 'linear',
                      display: true,
                      position: 'left',
                    },
                    y1: {
                      type: 'linear',
                      display: true,
                      position: 'right',
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

        <TabsContent value="opposition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance vs Opposition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Opponent</th>
                      <th className="text-right p-2">Matches</th>
                      <th className="text-right p-2">Runs</th>
                      <th className="text-right p-2">Wickets</th>
                      <th className="text-right p-2">Average</th>
                      <th className="text-right p-2">Strike Rate</th>
                      <th className="text-right p-2">Economy</th>
                      <th className="text-right p-2">Win Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.oppositionComparison.map((opp, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{opp.opponent}</td>
                        <td className="text-right p-2">{opp.matches}</td>
                        <td className="text-right p-2">{opp.runs.toLocaleString()}</td>
                        <td className="text-right p-2">{opp.wickets}</td>
                        <td className="text-right p-2">{opp.average.toFixed(2)}</td>
                        <td className="text-right p-2">{opp.strikeRate.toFixed(1)}</td>
                        <td className="text-right p-2">{opp.economy.toFixed(2)}</td>
                        <td className="text-right p-2">{opp.winRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Opposition Performance Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={oppositionPerformanceChart} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Day Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.day.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.day.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.day.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.day.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.day.strikeRate.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Day-Night Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.dayNight.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.dayNight.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.dayNight.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.dayNight.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{comparisonData.dayNightComparison.dayNight.strikeRate.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}