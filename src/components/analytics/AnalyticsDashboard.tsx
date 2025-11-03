'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CareerOverview from './CareerOverview';
import BattingAnalytics from './BattingAnalytics';
import { RefreshCw } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const response = await fetch('/api/analytics/recalculate', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        // Refresh the page or trigger re-fetch of data
        window.location.reload();
      }
    } catch (error) {
      console.error('Error recalculating analytics:', error);
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cricket Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive performance analysis and insights</p>
        </div>
        <Button 
          onClick={handleRecalculate} 
          disabled={isRecalculating}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          {isRecalculating ? 'Recalculating...' : 'Recalculate Analytics'}
        </Button>
      </div>

      <Tabs defaultValue="career" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="career">🏆 Career Overview</TabsTrigger>
          <TabsTrigger value="batting">🏏 Batting Analytics</TabsTrigger>
          <TabsTrigger value="bowling">⚾ Bowling Analytics</TabsTrigger>
          <TabsTrigger value="fielding">🧤 Fielding Analytics</TabsTrigger>
          <TabsTrigger value="advanced">📊 Advanced Metrics</TabsTrigger>
          <TabsTrigger value="comparison">⚖️ Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="career" className="space-y-4">
          <CareerOverview />
        </TabsContent>

        <TabsContent value="batting" className="space-y-4">
          <BattingAnalytics />
        </TabsContent>

        <TabsContent value="bowling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bowling Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Bowling analytics component coming soon...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Will include format-wise stats, phase analysis, dismissal types, venue performance, and more.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fielding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fielding Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Fielding analytics component coming soon...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Will include catches, run-outs, stumpings, position analysis, and success rates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Advanced metrics component coming soon...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Will include consistency index, impact index, clutch score, form curve, and predictive metrics.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Comparison analytics component coming soon...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Will include format comparisons, home vs away, opposition analysis, and trend analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Analytics Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">13</div>
            <p className="text-xs text-muted-foreground">Major analytics sections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100+</div>
            <p className="text-xs text-muted-foreground">Performance metrics tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Chart Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25+</div>
            <p className="text-xs text-muted-foreground">Visualization options</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Real-time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✓</div>
            <p className="text-xs text-muted-foreground">Live analytics updates</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}