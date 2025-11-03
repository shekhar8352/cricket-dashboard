'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BattingAnalyticsData {
  formatStats: Array<{
    format: string;
    matches: number;
    innings: number;
    runs: number;
    average: number;
    strikeRate: number;
    hundreds: number;
    fifties: number;
    thirties: number;
    ducks: number;
    notOuts: number;
    highestScore: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    boundaryPercentage: number;
    dotBallPercentage: number;
  }>;
  positionStats: Array<{
    position: number;
    innings: number;
    runs: number;
    average: number;
    strikeRate: number;
    hundreds: number;
    fifties: number;
  }>;
  dismissalTypes: {
    caught: number;
    bowled: number;
    lbw: number;
    runOut: number;
    stumped: number;
    hitWicket: number;
    notOut: number;
  };
  situationalStats: {
    firstInnings: {
      matches: number;
      runs: number;
      average: number;
      strikeRate: number;
    };
    chasing: {
      matches: number;
      runs: number;
      average: number;
      strikeRate: number;
      successRate: number;
    };
    pressure: {
      matches: number;
      runs: number;
      average: number;
      strikeRate: number;
    };
  };
  conversionRates: {
    thirtyToFifty: number;
    fiftyToHundred: number;
    startToThirty: number;
  };
  vsOpposition: Array<{
    opponent: string;
    matches: number;
    runs: number;
    average: number;
    strikeRate: number;
    hundreds: number;
    fifties: number;
    highestScore: number;
  }>;
  homeAwayStats: {
    home: {
      matches: number;
      runs: number;
      average: number;
      strikeRate: number;
      hundreds: number;
      fifties: number;
    };
    away: {
      matches: number;
      runs: number;
      average: number;
      strikeRate: number;
      hundreds: number;
      fifties: number;
    };
  };
}

export default function BattingAnalytics() {
  const [battingData, setBattingData] = useState<BattingAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBattingAnalytics();
  }, []);

  const fetchBattingAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/batting');
      const data = await response.json();
      if (data.success) {
        setBattingData(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching batting analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading batting analytics...</div>;
  }

  if (!battingData) {
    return <div className="text-center p-8">No batting data available</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="formats" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="formats">Formats</TabsTrigger>
          <TabsTrigger value="positions">Positions</TabsTrigger>
          <TabsTrigger value="dismissals">Dismissals</TabsTrigger>
          <TabsTrigger value="situations">Situations</TabsTrigger>
          <TabsTrigger value="opponents">Opponents</TabsTrigger>
        </TabsList>

        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Format-wise Batting Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Format</th>
                      <th className="text-right p-2">Mat</th>
                      <th className="text-right p-2">Inn</th>
                      <th className="text-right p-2">Runs</th>
                      <th className="text-right p-2">Avg</th>
                      <th className="text-right p-2">SR</th>
                      <th className="text-right p-2">100s</th>
                      <th className="text-right p-2">50s</th>
                      <th className="text-right p-2">HS</th>
                      <th className="text-right p-2">4s</th>
                      <th className="text-right p-2">6s</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battingData.formatStats.map((format, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{format.format}</td>
                        <td className="text-right p-2">{format.matches}</td>
                        <td className="text-right p-2">{format.innings}</td>
                        <td className="text-right p-2">{format.runs.toLocaleString()}</td>
                        <td className="text-right p-2">{format.average.toFixed(2)}</td>
                        <td className="text-right p-2">{format.strikeRate.toFixed(1)}</td>
                        <td className="text-right p-2">{format.hundreds}</td>
                        <td className="text-right p-2">{format.fifties}</td>
                        <td className="text-right p-2">{format.highestScore}</td>
                        <td className="text-right p-2">{format.fours}</td>
                        <td className="text-right p-2">{format.sixes}</td>
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
              <CardTitle>Batting Position Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Position</th>
                      <th className="text-right p-2">Innings</th>
                      <th className="text-right p-2">Runs</th>
                      <th className="text-right p-2">Average</th>
                      <th className="text-right p-2">Strike Rate</th>
                      <th className="text-right p-2">100s</th>
                      <th className="text-right p-2">50s</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battingData.positionStats.map((pos, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">#{pos.position}</td>
                        <td className="text-right p-2">{pos.innings}</td>
                        <td className="text-right p-2">{pos.runs.toLocaleString()}</td>
                        <td className="text-right p-2">{pos.average.toFixed(2)}</td>
                        <td className="text-right p-2">{pos.strikeRate.toFixed(1)}</td>
                        <td className="text-right p-2">{pos.hundreds}</td>
                        <td className="text-right p-2">{pos.fifties}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dismissals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Dismissal Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(battingData.dismissalTypes).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="capitalize">{type.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Start to 30:</span>
                    <span className="font-bold">{battingData.conversionRates.startToThirty?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30 to 50:</span>
                    <span className="font-bold">{battingData.conversionRates.thirtyToFifty?.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>50 to 100:</span>
                    <span className="font-bold">{battingData.conversionRates.fiftyToHundred?.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="situations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>First Innings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{battingData.situationalStats.firstInnings.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{battingData.situationalStats.firstInnings.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{battingData.situationalStats.firstInnings.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{battingData.situationalStats.firstInnings.strikeRate.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chasing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{battingData.situationalStats.chasing.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{battingData.situationalStats.chasing.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{battingData.situationalStats.chasing.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-bold">{battingData.situationalStats.chasing.successRate.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Under Pressure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Matches:</span>
                    <span className="font-bold">{battingData.situationalStats.pressure.matches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Runs:</span>
                    <span className="font-bold">{battingData.situationalStats.pressure.runs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average:</span>
                    <span className="font-bold">{battingData.situationalStats.pressure.average.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strike Rate:</span>
                    <span className="font-bold">{battingData.situationalStats.pressure.strikeRate.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <span>Matches:</span>
                        <span>{battingData.homeAwayStats.home.matches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Runs:</span>
                        <span>{battingData.homeAwayStats.home.runs.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average:</span>
                        <span>{battingData.homeAwayStats.home.average.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Away</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Matches:</span>
                        <span>{battingData.homeAwayStats.away.matches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Runs:</span>
                        <span>{battingData.homeAwayStats.away.runs.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average:</span>
                        <span>{battingData.homeAwayStats.away.average.toFixed(2)}</span>
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
                      <th className="text-right p-2">Runs</th>
                      <th className="text-right p-2">Average</th>
                      <th className="text-right p-2">Strike Rate</th>
                      <th className="text-right p-2">100s</th>
                      <th className="text-right p-2">50s</th>
                      <th className="text-right p-2">Highest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battingData.vsOpposition.map((opp, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{opp.opponent}</td>
                        <td className="text-right p-2">{opp.matches}</td>
                        <td className="text-right p-2">{opp.runs.toLocaleString()}</td>
                        <td className="text-right p-2">{opp.average.toFixed(2)}</td>
                        <td className="text-right p-2">{opp.strikeRate.toFixed(1)}</td>
                        <td className="text-right p-2">{opp.hundreds}</td>
                        <td className="text-right p-2">{opp.fifties}</td>
                        <td className="text-right p-2">{opp.highestScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}