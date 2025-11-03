'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
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

interface FieldingAnalyticsData {
  totalCatches: number;
  totalStumpings: number;
  totalRunOuts: number;
  totalFieldingDismissals: number;
  fieldingSuccessRate: number;
  formatStats: Array<{
    format: string;
    matches: number;
    catches: number;
    stumpings: number;
    runOuts: number;
    chances: number;
    successRate: number;
    dismissalsPerMatch: number;
  }>;
  positionStats: Array<{
    position: string;
    matches: number;
    catches: number;
    runOuts: number;
    chances: number;
    successRate: number;
  }>;
  vsOpposition: Array<{
    opponent: string;
    matches: number;
    catches: number;
    stumpings: number;
    runOuts: number;
    totalDismissals: number;
    dismissalsPerMatch: number;
  }>;
  vsVenues: Array<{
    venue: string;
    matches: number;
    catches: number;
    stumpings: number;
    runOuts: number;
    totalDismissals: number;
    dismissalsPerMatch: number;
  }>;
  bestPerformances: Array<{
    match: string;
    date: string;
    opponent: string;
    venue: string;
    catches: number;
    stumpings: number;
    runOuts: number;
    totalDismissals: number;
    matchSituation: string;
  }>;
  impactStats: {
    matchWinningFielding: number;
    pressureCatches: number;
    droppedCatches: number;
    missedRunOutChances: number;
    directHits: number;
    assistedRunOuts: number;
  };
}

export default function FieldingAnalytics() {
  const [fieldingData, setFieldingData] = useState<FieldingAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFieldingAnalytics();
  }, []);

  const fetchFieldingAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/fielding');
      const data = await response.json();
      if (data.success) {
        setFieldingData(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching fielding analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading fielding analytics...</div>;
  }

  if (!fieldingData) {
    return <div className="text-center p-8">No fielding data available</div>;
  }

  // Chart configurations
  const fieldingByFormatChart = {
    labels: fieldingData.formatStats.map(f => f.format),
    datasets: [
      {
        label: 'Catches',
        data: fieldingData.formatStats.map(f => f.catches),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Run Outs',
        data: fieldingData.formatStats.map(f => f.runOuts),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Stumpings',
        data: fieldingData.formatStats.map(f => f.stumpings),
        backgroundColor: 'rgba(245, 158, 11, 0.8)',
      }
    ]
  };

  const successRateChart = {
    labels: fieldingData.formatStats.map(f => f.format),
    datasets: [{
      label: 'Success Rate (%)',
      data: fieldingData.formatStats.map(f => f.successRate),
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.1
    }]
  };

  const fieldingDistributionChart = {
    labels: ['Catches', 'Run Outs', 'Stumpings'],
    datasets: [{
      data: [
        fieldingData.totalCatches,
        fieldingData.totalRunOuts,
        fieldingData.totalStumpings
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)'
      ]
    }]
  };

  const impactChart = {
    labels: ['Match Winning', 'Pressure Catches', 'Direct Hits', 'Assisted Run Outs'],
    datasets: [{
      label: 'Impact Fielding',
      data: [
        fieldingData.impactStats.matchWinningFielding,
        fieldingData.impactStats.pressureCatches,
        fieldingData.impactStats.directHits,
        fieldingData.impactStats.assistedRunOuts
      ],
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 1
    }]
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Catches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldingData.totalCatches}</div>
            <p className="text-xs text-muted-foreground">Career catches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Run Outs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldingData.totalRunOuts}</div>
            <p className="text-xs text-muted-foreground">Direct & assisted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stumpings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldingData.totalStumpings}</div>
            <p className="text-xs text-muted-foreground">Behind the stumps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fieldingData.fieldingSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Chances converted</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="formats" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="opponents">Opponents</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Format-wise Fielding Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Format</th>
                      <th className="text-right p-2">Matches</th>
                      <th className="text-right p-2">Catches</th>
                      <th className="text-right p-2">Run Outs</th>
                      <th className="text-right p-2">Stumpings</th>
                      <th className="text-right p-2">Chances</th>
                      <th className="text-right p-2">Success %</th>
                      <th className="text-right p-2">Per Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldingData.formatStats.map((format, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{format.format}</td>
                        <td className="text-right p-2">{format.matches}</td>
                        <td className="text-right p-2">{format.catches}</td>
                        <td className="text-right p-2">{format.runOuts}</td>
                        <td className="text-right p-2">{format.stumpings}</td>
                        <td className="text-right p-2">{format.chances}</td>
                        <td className="text-right p-2">{format.successRate.toFixed(1)}%</td>
                        <td className="text-right p-2">{format.dismissalsPerMatch.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Position-wise Fielding Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Position</th>
                      <th className="text-right p-2">Matches</th>
                      <th className="text-right p-2">Catches</th>
                      <th className="text-right p-2">Run Outs</th>
                      <th className="text-right p-2">Chances</th>
                      <th className="text-right p-2">Success Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldingData.positionStats.map((pos, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{pos.position}</td>
                        <td className="text-right p-2">{pos.matches}</td>
                        <td className="text-right p-2">{pos.catches}</td>
                        <td className="text-right p-2">{pos.runOuts}</td>
                        <td className="text-right p-2">{pos.chances}</td>
                        <td className="text-right p-2">{pos.successRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opponents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fielding vs Opposition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Opponent</th>
                      <th className="text-right p-2">Matches</th>
                      <th className="text-right p-2">Catches</th>
                      <th className="text-right p-2">Run Outs</th>
                      <th className="text-right p-2">Stumpings</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">Per Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldingData.vsOpposition.map((opp, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{opp.opponent}</td>
                        <td className="text-right p-2">{opp.matches}</td>
                        <td className="text-right p-2">{opp.catches}</td>
                        <td className="text-right p-2">{opp.runOuts}</td>
                        <td className="text-right p-2">{opp.stumpings}</td>
                        <td className="text-right p-2">{opp.totalDismissals}</td>
                        <td className="text-right p-2">{opp.dismissalsPerMatch.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fielding by Venue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Venue</th>
                      <th className="text-right p-2">Matches</th>
                      <th className="text-right p-2">Catches</th>
                      <th className="text-right p-2">Run Outs</th>
                      <th className="text-right p-2">Stumpings</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-right p-2">Per Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldingData.vsVenues.map((venue, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{venue.venue}</td>
                        <td className="text-right p-2">{venue.matches}</td>
                        <td className="text-right p-2">{venue.catches}</td>
                        <td className="text-right p-2">{venue.runOuts}</td>
                        <td className="text-right p-2">{venue.stumpings}</td>
                        <td className="text-right p-2">{venue.totalDismissals}</td>
                        <td className="text-right p-2">{venue.dismissalsPerMatch.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Impact Fielding Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Match Winning Fielding:</span>
                    <span className="font-bold">{fieldingData.impactStats.matchWinningFielding}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pressure Catches:</span>
                    <span className="font-bold">{fieldingData.impactStats.pressureCatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Direct Hits:</span>
                    <span className="font-bold">{fieldingData.impactStats.directHits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assisted Run Outs:</span>
                    <span className="font-bold">{fieldingData.impactStats.assistedRunOuts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Missed Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Dropped Catches:</span>
                    <span className="font-bold text-red-600">{fieldingData.impactStats.droppedCatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Missed Run Out Chances:</span>
                    <span className="font-bold text-red-600">{fieldingData.impactStats.missedRunOutChances}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Success Rate:</span>
                    <span className="font-bold text-green-600">{fieldingData.fieldingSuccessRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Best Fielding Performances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Opponent</th>
                      <th className="text-left p-2">Venue</th>
                      <th className="text-right p-2">Catches</th>
                      <th className="text-right p-2">Run Outs</th>
                      <th className="text-right p-2">Stumpings</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-left p-2">Situation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fieldingData.bestPerformances.map((perf, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{new Date(perf.date).toLocaleDateString()}</td>
                        <td className="p-2">{perf.opponent}</td>
                        <td className="p-2">{perf.venue}</td>
                        <td className="text-right p-2">{perf.catches}</td>
                        <td className="text-right p-2">{perf.runOuts}</td>
                        <td className="text-right p-2">{perf.stumpings}</td>
                        <td className="text-right p-2 font-bold">{perf.totalDismissals}</td>
                        <td className="p-2 text-xs">{perf.matchSituation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Fielding by Format</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={fieldingByFormatChart} options={{ responsive: true }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={successRateChart} options={{ responsive: true }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fielding Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Doughnut data={fieldingDistributionChart} options={{ responsive: true }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Fielding</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={impactChart} options={{ responsive: true }} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}