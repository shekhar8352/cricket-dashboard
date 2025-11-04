'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trophy, Calendar, Star, Shield } from "lucide-react";

interface SeriesParticipation {
  _id: string;
  teamRepresented: string;
  teamLevel: string;
  role: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  jerseyNumber?: number;
  status: string;
  matchesPlayed: number;
  series: {
    _id: string;
    name: string;
    type: string;
    format: string;
    level: string;
  };
  createdAt: string;
}

export default function SeriesParticipationList() {
  const [participations, setParticipations] = useState<SeriesParticipation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipations();
  }, []);

  const fetchParticipations = async () => {
    try {
      const response = await fetch('/api/series-participation');
      const data = await response.json();
      if (data.success) {
        setParticipations(data.participations);
      }
    } catch (error) {
      console.error('Error fetching participations:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'playing': return 'bg-green-100 text-green-800';
      case 'selected': return 'bg-blue-100 text-blue-800';
      case 'benched': return 'bg-yellow-100 text-yellow-800';
      case 'injured': return 'bg-red-100 text-red-800';
      case 'dropped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'batsman': return 'bg-blue-100 text-blue-800';
      case 'bowler': return 'bg-green-100 text-green-800';
      case 'allrounder': return 'bg-purple-100 text-purple-800';
      case 'wicketkeeper': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading series participations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Series Participations
        </CardTitle>
        <CardDescription>
          Teams and tournaments you&apos;ve represented
        </CardDescription>
      </CardHeader>
      <CardContent>
        {participations.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No series participations</h3>
            <p className="text-muted-foreground">
              Create a series to start tracking your team representations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {participations.map((participation) => (
              <div key={participation._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-lg">{participation.series.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {participation.series.format} • {participation.series.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(participation.status)} variant="secondary">
                      {participation.status}
                    </Badge>
                    <Badge className={getRoleColor(participation.role)} variant="secondary">
                      {participation.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{participation.teamRepresented}</span>
                  </div>
                  
                  {participation.jerseyNumber && (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-center text-xs font-bold border rounded">
                        #
                      </span>
                      <span>Jersey {participation.jerseyNumber}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(participation.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <span>{participation.matchesPlayed || 0} matches</span>
                  </div>
                </div>

                {(participation.isCaptain || participation.isViceCaptain) && (
                  <div className="flex gap-2 mt-3">
                    {participation.isCaptain && (
                      <Badge variant="outline" className="text-xs">
                        <Shield className="w-3 h-3 mr-1" />
                        Captain
                      </Badge>
                    )}
                    {participation.isViceCaptain && (
                      <Badge variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Vice Captain
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}