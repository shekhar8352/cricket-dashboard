'use client';

import React, { useState } from 'react';
import { indianTournamentPresets, getTournamentPreset } from '@/data/tournamentPresets';
import TournamentPresetCard from '@/components/TournamentPresetCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Filter, Search } from "lucide-react";

export default function TournamentPresetsPage() {
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');

  const filteredPresets = indianTournamentPresets.filter(preset => {
    const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         preset.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = !filterLevel || filterLevel === 'all' || preset.level === filterLevel;
    const matchesFormat = !filterFormat || filterFormat === 'all' || preset.format === filterFormat;
    
    return matchesSearch && matchesLevel && matchesFormat;
  });

  const selectedPresetData = selectedPreset ? getTournamentPreset(selectedPreset) : null;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8" />
            Tournament Presets
          </h1>
          <p className="text-muted-foreground">
            Explore famous Indian domestic and international cricket tournaments
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search tournaments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="IPL">IPL</SelectItem>
                    <SelectItem value="Ranji">Ranji Trophy</SelectItem>
                    <SelectItem value="List-A">List-A</SelectItem>
                    <SelectItem value="domestic">Domestic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={filterFormat} onValueChange={setFilterFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="All formats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All formats</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                    <SelectItem value="ODI">ODI</SelectItem>
                    <SelectItem value="T20">T20</SelectItem>
                    <SelectItem value="First-class">First-class</SelectItem>
                    <SelectItem value="List-A">List-A</SelectItem>
                    <SelectItem value="T20-domestic">T20 Domestic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterLevel('all');
                    setFilterFormat('all');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tournament Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPresets.map((preset) => (
                <TournamentPresetCard
                  key={preset.id}
                  preset={preset}
                  onSelect={setSelectedPreset}
                  isSelected={selectedPreset === preset.id}
                />
              ))}
            </div>
            
            {filteredPresets.length === 0 && (
              <Card className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tournaments found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </Card>
            )}
          </div>

          {/* Tournament Details */}
          <div className="lg:col-span-1">
            {selectedPresetData ? (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    {selectedPresetData.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedPresetData.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Tournament Structure</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total Teams:</span>
                        <span>{selectedPresetData.structure.totalTeams}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Matches:</span>
                        <span>{selectedPresetData.structure.totalMatches}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span>{selectedPresetData.format}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level:</span>
                        <span>{selectedPresetData.level}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Duration</h4>
                    <div className="text-sm">
                      <p>
                        {new Date(2024, selectedPresetData.duration.startMonth - 1).toLocaleString('default', { month: 'long' })} - {' '}
                        {new Date(2024, selectedPresetData.duration.endMonth - 1).toLocaleString('default', { month: 'long' })}
                      </p>
                      <p className="text-muted-foreground">
                        Approximately {selectedPresetData.duration.durationDays} days
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Sample Teams</h4>
                    <div className="text-sm space-y-1">
                      {selectedPresetData.teams.slice(0, 6).map((team, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span>{team}</span>
                        </div>
                      ))}
                      {selectedPresetData.teams.length > 6 && (
                        <p className="text-muted-foreground">
                          +{selectedPresetData.teams.length - 6} more teams
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Preferred Venues</h4>
                    <div className="text-sm space-y-1">
                      {selectedPresetData.venues.map((venue, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          <span>{venue}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Tournament</h3>
                <p className="text-muted-foreground">
                  Click on any tournament card to view detailed information
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}