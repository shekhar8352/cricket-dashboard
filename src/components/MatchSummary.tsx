'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Match {
  _id: string;
  level: string;
  format: string;
  date: string;
  venue: string;
  opponent: string;
  result?: string;
}

interface MatchSummaryProps {
  matches: Match[];
}

export default function MatchSummary({ matches }: MatchSummaryProps) {
  // Calculate statistics
  const totalMatches = matches.length;
  const levelCounts = matches.reduce((acc, match) => {
    acc[match.level] = (acc[match.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const formatCounts = matches.reduce((acc, match) => {
    acc[match.format] = (acc[match.format] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const recentMatches = matches
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const getLevelBadgeColor = (level: string) => {
    const colors = {
      'school': 'bg-blue-100 text-blue-800',
      'domestic': 'bg-green-100 text-green-800',
      'Ranji': 'bg-purple-100 text-purple-800',
      'IPL': 'bg-orange-100 text-orange-800',
      'international': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* Total Matches */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Total Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{totalMatches}</div>
          <p className="text-sm text-muted-foreground mt-1">
            Matches recorded in the database
          </p>
        </CardContent>
      </Card>

      {/* Level Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">By Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(levelCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(level)}`}>
                    {level}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Format Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">By Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(formatCounts)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 3)
              .map(([format, count]) => (
                <div key={format} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{format}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Matches */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Matches</CardTitle>
          <CardDescription>Last 5 matches by date</CardDescription>
        </CardHeader>
        <CardContent>
          {recentMatches.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No matches found</p>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(match.level)}`}>
                      {match.level}
                    </span>
                    <div className="text-sm">
                      <span className="font-medium">{match.format}</span> vs {match.opponent}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {match.venue}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}