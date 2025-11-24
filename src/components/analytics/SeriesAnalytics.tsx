import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, MapPin } from 'lucide-react';

interface SeriesStat {
    seriesName: string;
    matches: number;
    runs: number;
    wickets: number;
    battingAverage: number;
    bowlingAverage: number;
    strikeRate: number;
    economy: number;
    highestScore: number;
    fieldingDismissals: number;
    boundaries: number;
    details: {
        type: string;
        level: string;
        startDate: string;
        endDate: string;
        hostCountry: string;
        status: string;
    };
}

export default function SeriesAnalytics() {
    const [stats, setStats] = useState<SeriesStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/analytics/series-analytics');
                const data = await response.json();
                if (data.success) {
                    setStats(data.seriesStats);
                }
            } catch (error) {
                console.error('Error fetching series analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading series analytics...</div>;
    }

    if (stats.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    No series data available. Complete some matches to see analytics.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.seriesName} className="overflow-hidden">
                        <CardHeader className="bg-muted/50">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-primary" />
                                        {stat.seriesName}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1">
                                            <Badge variant="outline">{stat.details?.level}</Badge>
                                            <Badge variant="secondary">{stat.details?.type}</Badge>
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(stat.details?.startDate).getFullYear()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {stat.details?.hostCountry}
                                        </span>
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{stat.matches}</div>
                                    <div className="text-xs text-muted-foreground">Matches</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Runs Scored</p>
                                    <p className="text-2xl font-bold">{stat.runs}</p>
                                    <p className="text-xs text-muted-foreground">Avg: {stat.battingAverage}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Wickets Taken</p>
                                    <p className="text-2xl font-bold">{stat.wickets}</p>
                                    <p className="text-xs text-muted-foreground">Avg: {stat.bowlingAverage}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Highest Score</p>
                                    <p className="text-2xl font-bold">{stat.highestScore}</p>
                                    <p className="text-xs text-muted-foreground">SR: {stat.strikeRate}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Fielding</p>
                                    <p className="text-2xl font-bold">{stat.fieldingDismissals}</p>
                                    <p className="text-xs text-muted-foreground">Dismissals</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
