'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Line, Radar, Bar, Scatter } from 'react-chartjs-2';
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

interface AdvancedMetricsData {
  consistencyIndex: {
    batting: number;
    bowling: number;
    overall: number;
    calculation: {
      battingVariance: number;
      bowlingVariance: number;
      matchCount: number;
    };
  };
  impactIndex: {
    batting: number;
    bowling: number;
    fielding: number;
    overall: number;
  };
  clutchScore: {
    batting: number;
    bowling: number;
    overall: number;
    pressureMatches: number;
  };
  playerValueIndex: {
    total: number;
    battingContribution: number;
    bowlingContribution: number;
    fieldingContribution: number;
  };
  formCurve: {
    current: number;
    trend: "improving" | "declining" | "stable";
    last5Average: number;
    last10Average: number;
    careerAverage: number;
    peakForm: {
      rating: number;
      period: string;
      matches: number;
    };
  };
  matchImpact: {
    winContribution: number;
    matchWinningPerformances: number;
    matchLosingPerformances: number;
    drawSavingPerformances: number;
    averageImpactScore: number;
    highImpactMatches: Array<{
      match: string;
      date: string;
      opponent: string;
      impactScore: number;
      description: string;
    }>;
  };
  situationalMetrics: {
    homeAdvantage: {
      homePerformance: number;
      awayPerformance: number;
      advantage: number;
    };
    formatAdaptability: {
      testRating: number;
      odiRating: number;
      t20Rating: number;
      adaptabilityScore: number;
    };
    oppositionStrength: {
      vsStrongTeams: number;
      vsWeakTeams: number;
      strengthIndex: number;
    };
    matchPhase: {
      earlyCareer: number;
      midCareer: number;
      lateCareer: number;
      careerProgression: number;
    };
  };
  predictiveMetrics: {
    formMomentum: number;
    injuryRisk: number;
    careerTrajectory: "ascending" | "peak" | "declining";
    expectedPerformance: {
      nextMatch: {
        battingScore: number;
        bowlingScore: number;
        confidence: number;
      };
      next5Matches: {
        averageBattingScore: number;
        averageBowlingScore: number;
        confidence: number;
      };
    };
  };
  milestonePredictions: {
    nextMilestone: {
      type: string;
      target: number;
      current: number;
      estimatedMatches: number;
      probability: number;
    };
    careerProjections: {
      totalRuns: number;
      totalWickets: number;
      totalMatches: number;
      confidence: number;
    };
  };
}

export default function AdvancedMetrics() {
  const [metricsData, setMetricsData] = useState<AdvancedMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvancedMetrics();
  }, []);

  const fetchAdvancedMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/advanced');
      const data = await response.json();
      if (data.success) {
        setMetricsData(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching advanced metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading advanced metrics...</div>;
  }

  if (!metricsData) {
    return <div className="text-center p-8">No advanced metrics data available</div>;
  }

  // Chart configurations
  const consistencyRadarChart = {
    labels: ['Batting Consistency', 'Bowling Consistency', 'Overall Consistency'],
    datasets: [{
      label: 'Consistency Index',
      data: [
        metricsData.consistencyIndex.batting,
        metricsData.consistencyIndex.bowling,
        metricsData.consistencyIndex.overall
      ],
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
    }]
  };

  const impactIndexChart = {
    labels: ['Batting', 'Bowling', 'Fielding', 'Overall'],
    datasets: [{
      label: 'Impact Index',
      data: [
        metricsData.impactIndex.batting,
        metricsData.impactIndex.bowling,
        metricsData.impactIndex.fielding,
        metricsData.impactIndex.overall
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ]
    }]
  };

  const formCurveChart = {
    labels: ['Last 10', 'Last 5', 'Current', 'Career Avg'],
    datasets: [{
      label: 'Form Rating',
      data: [
        metricsData.formCurve.last10Average,
        metricsData.formCurve.last5Average,
        metricsData.formCurve.current,
        metricsData.formCurve.careerAverage
      ],
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      tension: 0.4
    }]
  };

  const formatAdaptabilityChart = {
    labels: ['Test Rating', 'ODI Rating', 'T20 Rating', 'Adaptability Score'],
    datasets: [{
      label: 'Format Performance',
      data: [
        metricsData.situationalMetrics.formatAdaptability.testRating,
        metricsData.situationalMetrics.formatAdaptability.odiRating,
        metricsData.situationalMetrics.formatAdaptability.t20Rating,
        metricsData.situationalMetrics.formatAdaptability.adaptabilityScore
      ],
      borderColor: 'rgba(245, 158, 11, 1)',
      backgroundColor: 'rgba(245, 158, 11, 0.2)',
    }]
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case 'ascending': return 'text-green-600';
      case 'declining': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consistency Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.consistencyIndex.overall.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Overall consistency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Impact Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.impactIndex.overall.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Match impact score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clutch Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.clutchScore.overall.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Pressure performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Player Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricsData.playerValueIndex.total.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Overall value index</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="consistency" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="consistency">Consistency</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="form">Form</TabsTrigger>
          <TabsTrigger value="situational">Situational</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="consistency" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Consistency Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Batting Consistency:</span>
                    <span className="font-bold">{metricsData.consistencyIndex.batting.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bowling Consistency:</span>
                    <span className="font-bold">{metricsData.consistencyIndex.bowling.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Consistency:</span>
                    <span className="font-bold">{metricsData.consistencyIndex.overall.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-sm text-muted-foreground">
                      <p>Based on {metricsData.consistencyIndex.calculation.matchCount} matches</p>
                      <p>Batting Variance: {metricsData.consistencyIndex.calculation.battingVariance.toFixed(2)}</p>
                      <p>Bowling Variance: {metricsData.consistencyIndex.calculation.bowlingVariance.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Player Value Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Batting Contribution:</span>
                    <span className="font-bold">{metricsData.playerValueIndex.battingContribution.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bowling Contribution:</span>
                    <span className="font-bold">{metricsData.playerValueIndex.bowlingContribution.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fielding Contribution:</span>
                    <span className="font-bold">{metricsData.playerValueIndex.fieldingContribution.toFixed(1)}%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="font-semibold">Total Value Index:</span>
                      <span className="font-bold text-lg">{metricsData.playerValueIndex.total.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Impact Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Batting Impact:</span>
                    <span className="font-bold">{metricsData.impactIndex.batting.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bowling Impact:</span>
                    <span className="font-bold">{metricsData.impactIndex.bowling.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fielding Impact:</span>
                    <span className="font-bold">{metricsData.impactIndex.fielding.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Impact:</span>
                    <span className="font-bold">{metricsData.impactIndex.overall.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Impact Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Win Contribution:</span>
                    <span className="font-bold">{metricsData.matchImpact.winContribution.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Match Winning Performances:</span>
                    <span className="font-bold">{metricsData.matchImpact.matchWinningPerformances}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Draw Saving Performances:</span>
                    <span className="font-bold">{metricsData.matchImpact.drawSavingPerformances}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Impact Score:</span>
                    <span className="font-bold">{metricsData.matchImpact.averageImpactScore.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>High Impact Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Opponent</th>
                      <th className="text-right p-2">Impact Score</th>
                      <th className="text-left p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricsData.matchImpact.highImpactMatches.map((match, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{new Date(match.date).toLocaleDateString()}</td>
                        <td className="p-2">{match.opponent}</td>
                        <td className="text-right p-2 font-bold">{match.impactScore.toFixed(2)}</td>
                        <td className="p-2 text-xs">{match.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Form Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Current Form Rating:</span>
                    <span className="font-bold text-lg">{metricsData.formCurve.current.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Form Trend:</span>
                    <span className={`font-bold capitalize ${getTrendColor(metricsData.formCurve.trend)}`}>
                      {metricsData.formCurve.trend}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last 5 Matches Avg:</span>
                    <span className="font-bold">{metricsData.formCurve.last5Average.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last 10 Matches Avg:</span>
                    <span className="font-bold">{metricsData.formCurve.last10Average.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Career Average:</span>
                    <span className="font-bold">{metricsData.formCurve.careerAverage.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Form Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Peak Rating:</span>
                    <span className="font-bold text-lg">{metricsData.formCurve.peakForm.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Period:</span>
                    <span className="font-bold">{metricsData.formCurve.peakForm.period}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Matches in Peak:</span>
                    <span className="font-bold">{metricsData.formCurve.peakForm.matches}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clutch Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metricsData.clutchScore.batting.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Batting Clutch</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metricsData.clutchScore.bowling.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Bowling Clutch</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metricsData.clutchScore.overall.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Overall Clutch</p>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Based on {metricsData.clutchScore.pressureMatches} pressure situations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="situational" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Home Advantage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Home Performance:</span>
                    <span className="font-bold">{metricsData.situationalMetrics.homeAdvantage.homePerformance.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Away Performance:</span>
                    <span className="font-bold">{metricsData.situationalMetrics.homeAdvantage.awayPerformance.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Home Advantage:</span>
                    <span className="font-bold">{metricsData.situationalMetrics.homeAdvantage.advantage.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Opposition Strength Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>vs Strong Teams:</span>
                    <span className="font-bold">{metricsData.situationalMetrics.oppositionStrength.vsStrongTeams.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>vs Weak Teams:</span>
                    <span className="font-bold">{metricsData.situationalMetrics.oppositionStrength.vsWeakTeams.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Strength Index:</span>
                    <span className="font-bold">{metricsData.situationalMetrics.oppositionStrength.strengthIndex.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Career Phase Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold">{metricsData.situationalMetrics.matchPhase.earlyCareer.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Early Career</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{metricsData.situationalMetrics.matchPhase.midCareer.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Mid Career</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{metricsData.situationalMetrics.matchPhase.lateCareer.toFixed(1)}</div>
                  <p className="text-sm text-muted-foreground">Late Career</p>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold">{metricsData.situationalMetrics.matchPhase.careerProgression.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Progression</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Form Momentum:</span>
                    <span className="font-bold">{metricsData.predictiveMetrics.formMomentum.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Injury Risk:</span>
                    <span className="font-bold">{metricsData.predictiveMetrics.injuryRisk.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Career Trajectory:</span>
                    <span className={`font-bold capitalize ${getTrajectoryColor(metricsData.predictiveMetrics.careerTrajectory)}`}>
                      {metricsData.predictiveMetrics.careerTrajectory}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next Match Prediction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Expected Batting Score:</span>
                    <span className="font-bold">{metricsData.predictiveMetrics.expectedPerformance.nextMatch.battingScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Bowling Score:</span>
                    <span className="font-bold">{metricsData.predictiveMetrics.expectedPerformance.nextMatch.bowlingScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Confidence Level:</span>
                    <span className="font-bold">{metricsData.predictiveMetrics.expectedPerformance.nextMatch.confidence.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Milestone Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Next Milestone</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Type:</span>
                      <span className="font-bold">{metricsData.milestonePredictions.nextMilestone.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Target:</span>
                      <span className="font-bold">{metricsData.milestonePredictions.nextMilestone.target}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current:</span>
                      <span className="font-bold">{metricsData.milestonePredictions.nextMilestone.current}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Matches:</span>
                      <span className="font-bold">{metricsData.milestonePredictions.nextMilestone.estimatedMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Probability:</span>
                      <span className="font-bold">{metricsData.milestonePredictions.nextMilestone.probability.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Career Projections</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Projected Runs:</span>
                      <span className="font-bold">{metricsData.milestonePredictions.careerProjections.totalRuns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Wickets:</span>
                      <span className="font-bold">{metricsData.milestonePredictions.careerProjections.totalWickets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Matches:</span>
                      <span className="font-bold">{metricsData.milestonePredictions.careerProjections.totalMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="font-bold">{metricsData.milestonePredictions.careerProjections.confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Consistency Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <Radar data={consistencyRadarChart} options={{ responsive: true }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Index</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar data={impactIndexChart} options={{ responsive: true }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Form Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <Line data={formCurveChart} options={{ responsive: true }} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Format Adaptability</CardTitle>
              </CardHeader>
              <CardContent>
                <Radar data={formatAdaptabilityChart} options={{ responsive: true }} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}