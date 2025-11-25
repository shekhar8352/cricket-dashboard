'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';
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
  ArcElement,
  RadialLinearScale
);

interface BowlingAnalyticsData {
  formatStats: Array<{
    format: string;
    matches: number;
    innings: number;
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
    average: number;
    economy: number;
    strikeRate: number;
    bestFigures: string;
    fiveWickets: number;
    tenWickets: number;
    dotBallPercentage: number;
  }>;
  positionStats: {
    opening: {
      matches: number;
      overs: number;
      wickets: number;
      economy: number;
      average: number;
      strikeRate: number;
    };
    middle: {
      matches: number;
      overs: number;
      wickets: number;
      economy: number;
      average: number;
      strikeRate: number;
    };
    death: {
      matches: number;
      overs: number;
      wickets: number;
      economy: number;
      average: number;
      strikeRate: number;
    };
  };
  phaseAnalysis: {
    powerplay: {
      overs: number;
      runs: number;
      wickets: number;
      economy: number;
      dotBallPercentage: number;
    };
    middleOvers: {
      overs: number;
      runs: number;
      wickets: number;
      economy: number;
      dotBallPercentage: number;
    };
    deathOvers: {
      overs: number;
      runs: number;
      wickets: number;
      economy: number;
      dotBallPercentage: number;
    };
  };
  dismissalTypes: {
    caught: number;
    bowled: number;
    lbw: number;
    stumped: number;
    hitWicket: number;
  };
  vsOpposition: Array<{
    opponent: string;
    matches: number;
    overs: number;
    wickets: number;
    runs: number;
    average: number;
    economy: number;
    strikeRate: number;
    bestFigures: string;
  }>;
  homeAwayStats: {
    home: {
      matches: number;
      overs: number;
      wickets: number;
      runs: number;
      average: number;
      economy: number;
      strikeRate: number;
    };
    away: {
      matches: number;
      overs: number;
      wickets: number;
      runs: number;
      average: number;
      economy: number;
      strikeRate: number;
    };
  };
  wicketDistribution: Array<{
    over: number;
    wickets: number;
  }>;
}

export default function BowlingAnalytics() {
  const [bowlingData, setBowlingData] = useState<BowlingAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBowlingAnalytics();
  }, []);

  const fetchBowlingAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/bowling');
      const data = await response.json();
      if (data.success) {
        setBowlingData(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching bowling analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading bowling analytics...</div>;
  }

  if (!bowlingData) {
    return <div className="text-center p-8">No bowling data available</div>;
  }

  // Safe bowling data with defaults
  const safeBowlingData = {
    formatStats: bowlingData.formatStats || [],
    positionStats: bowlingData.positionStats || {
      opening: { matches: 0, overs: 0, wickets: 0, economy: 0, average: 0, strikeRate: 0 },
      middle: { matches: 0, overs: 0, wickets: 0, economy: 0, average: 0, strikeRate: 0 },
      death: { matches: 0, overs: 0, wickets: 0, economy: 0, average: 0, strikeRate: 0 }
    },
    phaseAnalysis: bowlingData.phaseAnalysis || {
      powerplay: { overs: 0, runs: 0, wickets: 0, economy: 0, dotBallPercentage: 0 },
      middleOvers: { overs: 0, runs: 0, wickets: 0, economy: 0, dotBallPercentage: 0 },
      deathOvers: { overs: 0, runs: 0, wickets: 0, economy: 0, dotBallPercentage: 0 }
    },
    dismissalTypes: bowlingData.dismissalTypes || {
      caught: 0, bowled: 0, lbw: 0, stumped: 0, hitWicket: 0
    },
    vsOpposition: bowlingData.vsOpposition || [],
    homeAwayStats: bowlingData.homeAwayStats || {
      home: { matches: 0, overs: 0, wickets: 0, runs: 0, average: 0, economy: 0, strikeRate: 0 },
      away: { matches: 0, overs: 0, wickets: 0, runs: 0, average: 0, economy: 0, strikeRate: 0 }
    },
    wicketDistribution: bowlingData.wicketDistribution || []
  };

  // Chart configurations
  const formatWicketsChart = {
    labels: safeBowlingData.formatStats.map(f => f.format),
    datasets: [{
      label: 'Wickets',
      data: safeBowlingData.formatStats.map(f => f.wickets),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };

  const economyTrendChart = {
    labels: safeBowlingData.formatStats.map(f => f.format),
    datasets: [{
      label: 'Economy Rate',
      data: safeBowlingData.formatStats.map(f => f.economy),
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.1
    }]
  };

  const dismissalTypesChart = {
    labels: Object.keys(safeBowlingData.dismissalTypes).map(key =>
      key.charAt(0).toUpperCase() + key.slice(1)
    ),
    datasets: [{
      data: Object.values(safeBowlingData.dismissalTypes),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]
    }]
  };

  const phaseAnalysisChart = {
    labels: ['Economy', 'Wickets', 'Dot Ball %'],
    datasets: [
      {
        label: 'Powerplay',
        data: [
          safeBowlingData.phaseAnalysis.powerplay.economy,
          safeBowlingData.phaseAnalysis.powerplay.wickets,
          safeBowlingData.phaseAnalysis.powerplay.dotBallPercentage
        ],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)'
      },
      {
        label: 'Middle Overs',
        data: [
          safeBowlingData.phaseAnalysis.middleOvers.economy,
          safeBowlingData.phaseAnalysis.middleOvers.wickets,
          safeBowlingData.phaseAnalysis.middleOvers.dotBallPercentage
        ],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)'
      },
      {
        label: 'Death Overs',
        data: [
          safeBowlingData.phaseAnalysis.deathOvers.economy,
          safeBowlingData.phaseAnalysis.deathOvers.wickets,
          safeBowlingData.phaseAnalysis.deathOvers.dotBallPercentage
        ],
        borderColor: 'rgba(245, 158, 11, 1)',
        backgroundColor: 'rgba(245, 158, 11, 0.2)'
      }
    ]
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="formats" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="dismissals">Dismissals</TabsTrigger>
          <TabsTrigger value="opponents">Opponents</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Format-wise Bowling Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Format</th>
                      <th className="text-right p-2">Mat</th>
                      <th className="text-right p-2">Inn</th>
                      <th className="text-right p-2">Overs</th>
                      <th className="text-right p-2">Wkts</th>
                      <th className="text-right p-2">Runs</th>
                      <th className="text-right p-2">Avg</th>
                      <th className="text-right p-2">Econ</th>
                      <th className="text-right p-2">SR</th>
                      <th className="text-right p-2">5W</th>
                      <th className="text-right p-2">Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeBowlingData.formatStats.map((format, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{format.format}</td>
                        <td className="text-right p-2">{format.matches || 0}</td>
                        <td className="text-right p-2">{format.innings || 0}</td>
                        <td className="text-right p-2">{(format.overs || 0).toFixed(1)}</td>
                        <td className="text-right p-2">{format.wickets || 0}</td>
                        <td className="text-right p-2">{format.runs || 0}</td>
                        <td className="text-right p-2">{(format.average || 0).toFixed(2)}</td>
                        <td className="text-right p-2">{(format.economy || 0).toFixed(2)}</td>
                        <td className="text-right p-2">{(format.strikeRate || 0).toFixed(1)}</td>
                        <td className="text-right p-2">{format.fiveWickets || 0}</td>
                        <td className="text-right p-2">{format.bestFigures || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Powerplay (1-6 overs)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overs:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.powerplay.overs.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.powerplay.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economy:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.powerplay.economy.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dot Ball %:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.powerplay.dotBallPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Middle Overs (7-15)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overs:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.middleOvers.overs.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.middleOvers.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economy:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.middleOvers.economy.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dot Ball %:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.middleOvers.dotBallPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Death Overs (16-20)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overs:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.deathOvers.overs.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.deathOvers.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economy:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.deathOvers.economy.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dot Ball %:</span>
                    <span className="font-bold">{safeBowlingData.phaseAnalysis.deathOvers.dotBallPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Opening Bowler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.opening.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.opening.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economy:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.opening.economy.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.opening.average.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Middle Overs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.middle.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.middle.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economy:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.middle.economy.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.middle.average.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Death Bowler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.death.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wickets:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.death.wickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economy:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.death.economy.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{safeBowlingData.positionStats.death.average.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dismissals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Dismissal Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(safeBowlingData.dismissalTypes).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="capitalize">{type}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Home vs Away</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Home</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Wickets:</span>
                        <span>{safeBowlingData.homeAwayStats.home.wickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Economy:</span>
                        <span>{safeBowlingData.homeAwayStats.home.economy.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average:</span>
                        <span>{safeBowlingData.homeAwayStats.home.average.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Away</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Wickets:</span>
                        <span>{safeBowlingData.homeAwayStats.away.wickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Economy:</span>
                        <span>{safeBowlingData.homeAwayStats.away.economy.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average:</span>
                        <span>{safeBowlingData.homeAwayStats.away.average.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="opponents" className="space-y-4">
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
                      <th className="text-right p-2">Overs</th>
                      <th className="text-right p-2">Wickets</th>
                      <th className="text-right p-2">Runs</th>
                      <th className="text-right p-2">Average</th>
                      <th className="text-right p-2">Economy</th>
                      <th className="text-right p-2">Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeBowlingData.vsOpposition.map((opp, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{opp.opponent}</td>
                        <td className="text-right p-2">{opp.matches || 0}</td>
                        <td className="text-right p-2">{(opp.overs || 0).toFixed(1)}</td>
                        <td className="text-right p-2">{opp.wickets || 0}</td>
                        <td className="text-right p-2">{opp.runs || 0}</td>
                        <td className="text-right p-2">{(opp.average || 0).toFixed(2)}</td>
                        <td className="text-right p-2">{(opp.economy || 0).toFixed(2)}</td>
                        <td className="text-right p-2">{opp.bestFigures || 'N/A'}</td>
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
                <CardTitle>Wickets by Format</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={formatWicketsChart} options={{ responsive: true }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Economy Rate Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={economyTrendChart} options={{ responsive: true }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dismissal Types Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <Pie data={dismissalTypesChart} options={{ responsive: true }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phase-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Radar data={phaseAnalysisChart} options={{ responsive: true }} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}