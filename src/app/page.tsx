import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Plus, TrendingUp, Target, Activity, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Cricket Analytics Dashboard
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Single player cricket performance tracking and analytics platform. 
            Enter match data, track performance, and gain insights with detailed analytics.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Data Entry Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Data Entry</CardTitle>
              <CardDescription>
                Add player information, match details, and performance data. 
                Comprehensive forms to capture all cricket statistics.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild size="lg">
                <Link href="/data-entry">
                  Enter Data
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
              <CardDescription>
                View detailed performance analytics with interactive charts. 
                Track progress, identify trends, and analyze statistics.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild size="lg" variant="secondary">
                <Link href="/analytics">
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-8">Key Features</h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <Target className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Multi-Level Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track performance across school, domestic, Ranji, IPL, and international levels
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Format Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Separate analytics for Test, ODI, T20, and domestic formats
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="text-center">
                <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg">Comprehensive Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Batting, bowling, and fielding statistics with detailed breakdowns
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}