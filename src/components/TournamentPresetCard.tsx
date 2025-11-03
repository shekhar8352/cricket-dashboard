'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Calendar, MapPin } from "lucide-react";
import { type TournamentPreset } from "@/data/tournamentPresets";

interface TournamentPresetCardProps {
  preset: TournamentPreset;
  onSelect: (presetId: string) => void;
  isSelected?: boolean;
}

export default function TournamentPresetCard({ preset, onSelect, isSelected = false }: TournamentPresetCardProps) {
  const getMonthName = (month: number) => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'tournament': return 'bg-blue-100 text-blue-800';
      case 'league': return 'bg-green-100 text-green-800';
      case 'bilateral': return 'bg-purple-100 text-purple-800';
      case 'triangular': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'Test': return 'bg-red-100 text-red-800';
      case 'ODI': return 'bg-blue-100 text-blue-800';
      case 'T20': return 'bg-green-100 text-green-800';
      case 'First-class': return 'bg-yellow-100 text-yellow-800';
      case 'List-A': return 'bg-indigo-100 text-indigo-800';
      case 'T20-domestic': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(preset.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">{preset.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Badge className={getTypeColor(preset.type)} variant="secondary">
              {preset.type}
            </Badge>
            <Badge className={getFormatColor(preset.format)} variant="secondary">
              {preset.format}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm">
          {preset.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{preset.structure.totalTeams} teams</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-muted-foreground" />
            <span>{preset.structure.totalMatches} matches</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {getMonthName(preset.duration.startMonth)} - {getMonthName(preset.duration.endMonth)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{preset.venues.length} venues</span>
          </div>
        </div>
        
        {preset.structure.groupStage && (
          <div className="mt-3 flex gap-1">
            {preset.structure.groupStage && (
              <Badge variant="outline" className="text-xs">Group Stage</Badge>
            )}
            {preset.structure.knockoutStage && (
              <Badge variant="outline" className="text-xs">Knockout</Badge>
            )}
            {preset.structure.finalStage && (
              <Badge variant="outline" className="text-xs">Final</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}