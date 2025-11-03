'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Calendar, MapPin, Users, Trophy, Settings } from "lucide-react";
import { indianTournamentPresets, getTournamentPreset, type TournamentPreset } from "@/data/tournamentPresets";

// Validation schemas
const seriesSchema = z.object({
  name: z.string().min(1, 'Series name is required'),
  type: z.enum(['bilateral', 'triangular', 'tournament', 'league']),
  format: z.enum(['Test', 'ODI', 'T20', 'First-class', 'List-A', 'T20-domestic', 'mixed']),
  level: z.enum(['under19-international', 'domestic', 'Ranji', 'IPL', 'List-A', 'international']),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  hostCountry: z.string().min(1, 'Host country is required'),
  description: z.string().optional(),
  trophy: z.string().optional(),
  sponsor: z.string().optional(),

  // Player team representation
  playerTeam: z.string().min(1, 'Player team is required'),
  playerRole: z.enum(['batsman', 'bowler', 'allrounder', 'wicketkeeper']).optional(),
  isCaptain: z.boolean(),
  jerseyNumber: z.number().optional(),

  teams: z.array(z.object({
    name: z.string().min(1, 'Team name is required'),
    isHome: z.boolean()
  })).min(2, 'At least 2 teams are required'),

  matches: z.array(z.object({
    date: z.string().min(1, 'Match date is required'),
    venue: z.string().min(1, 'Venue is required'),
    opponent: z.string().min(1, 'Opponent is required'),
    city: z.string().optional(),
    country: z.string().optional(),
    matchNumber: z.number().min(1),
    format: z.enum(['Test', 'ODI', 'T20', 'First-class', 'List-A', 'T20-domestic']),
    level: z.enum(['under19-international', 'domestic', 'Ranji', 'IPL', 'List-A', 'international']),
    importance: z.enum(['high', 'medium', 'low']).optional(),
    matchType: z.enum(['debut', 'milestone', 'final', 'knockout', 'regular']).optional(),
    didNotPlay: z.object({
      reason: z.enum(['injury', 'illness', 'rest', 'disciplinary', 'personal', 'team_selection', 'other']),
      details: z.string().optional(),
      replacementPlayer: z.string().optional(),
    }).optional(),
  })).min(1, 'At least 1 match is required')
});

type SeriesFormData = z.infer<typeof seriesSchema>;

interface Venue {
  _id: string;
  name: string;
  city: string;
  country: string;
  capacity?: number;
  pitchType?: string;
}

export default function SeriesCreationForm() {
  const [activeTab, setActiveTab] = useState<'series' | 'venues'>('series');
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [showDidNotPlay, setShowDidNotPlay] = useState<{ [key: number]: boolean }>({});
  const [currentPlayer, setCurrentPlayer] = useState<{ _id: string; fullName: string } | null>(null);


  const seriesForm = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      teams: [{ name: '', isHome: true }],
      matches: [{
        date: '',
        venue: '',
        opponent: '',
        matchNumber: 1,
        format: 'ODI',
        level: 'international',
        city: '',
        country: ''
      }],
      isCaptain: false
    }
  });



  const { fields: teamFields, append: appendTeam, remove: removeTeam } = useFieldArray({
    control: seriesForm.control,
    name: "teams"
  });

  const { fields: matchFields, append: appendMatch, remove: removeMatch } = useFieldArray({
    control: seriesForm.control,
    name: "matches"
  });

  // Fetch venues and current player on component mount
  useEffect(() => {
    fetchVenues();
    fetchCurrentPlayer();
  }, []);

  const fetchCurrentPlayer = async () => {
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      if (data.success && data.players.length > 0) {
        const activePlayer = data.players.find((p: { isActive: boolean }) => p.isActive);
        if (activePlayer) {
          setCurrentPlayer(activePlayer);
        }
      }
    } catch (error) {
      console.error('Error fetching current player:', error);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues');
      const data = await response.json();
      if (data.success) {
        setVenues(data.venues);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const onSubmitSeries = async (data: SeriesFormData) => {
    setLoading(true);
    try {
      // Calculate total matches
      const totalMatches = data.matches.length;

      // Prepare series data
      const seriesData: Record<string, unknown> = {
        ...data,
        totalMatches,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        matches: data.matches.map((match, index) => ({
          ...match,
          date: new Date(match.date),
          matchNumber: index + 1,
          totalMatches,
          series: data.name,
          seriesType: data.type,
        }))
      };

      const response = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seriesData),
      });

      if (response.ok) {
        const result = await response.json();

        // Create series participation record
        if (result.series && data.playerTeam && currentPlayer) {
          try {
            await fetch('/api/series-participation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                playerId: currentPlayer._id,
                seriesId: result.series._id,
                teamRepresented: data.playerTeam,
                teamLevel: data.level,
                role: data.playerRole || 'batsman',
                isCaptain: data.isCaptain || false,
                jerseyNumber: data.jerseyNumber,
                status: 'selected'
              }),
            });
          } catch (error) {
            console.error('Error creating participation record:', error);
          }
        }

        alert('Series created successfully!');
        seriesForm.reset();

      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error creating series');
      }
    } catch (error) {
      console.error('Error creating series:', error);
      alert('Error creating series');
    }
    setLoading(false);
  };

  const seedVenues = async () => {
    setSeeding(true);
    try {
      const response = await fetch('/api/venues/seed', {
        method: 'POST',
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Successfully seeded ${data.count} cricket venues from around the world!`);
        fetchVenues(); // Refresh venues list
      } else {
        alert(data.error || 'Error seeding venues');
      }
    } catch (error) {
      console.error('Error seeding venues:', error);
      alert('Error seeding venues');
    }
    setSeeding(false);
  };

  const applyTournamentPreset = (presetId: string) => {
    const preset = getTournamentPreset(presetId);
    if (!preset) return;

    // Apply basic tournament info
    seriesForm.setValue('name', preset.name);
    seriesForm.setValue('type', preset.type);
    seriesForm.setValue('format', preset.format);
    seriesForm.setValue('level', preset.level);
    seriesForm.setValue('description', preset.description);

    // Apply teams
    const teams = preset.teams.map((teamName, index) => ({
      name: teamName,
      isHome: index === 0 // First team is home team
    }));
    seriesForm.setValue('teams', teams);

    // Set player team (default to first team for Indian tournaments)
    if (preset.teams.length > 0) {
      const playerTeam = preset.teams.find(team =>
        team.includes('India') ||
        team.includes('Mumbai') ||
        team.includes('Delhi') ||
        team.includes('Karnataka') ||
        team.includes('Chennai')
      ) || preset.teams[0];
      seriesForm.setValue('playerTeam', playerTeam);
    }

    // Generate matches based on preset structure
    type MatchData = {
      date: string;
      venue: string;
      opponent: string;
      matchNumber: number;
      format: 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic';
      level: 'under19-international' | 'domestic' | 'Ranji' | 'IPL' | 'List-A' | 'international';
      city?: string;
      country?: string;
      importance?: 'high' | 'medium' | 'low';
      matchType?: 'debut' | 'milestone' | 'final' | 'knockout' | 'regular';
    };

    const matches: MatchData[] = [];
    const totalMatches = preset.structure.totalMatches;

    for (let i = 1; i <= Math.min(totalMatches, 10); i++) { // Limit to 10 matches for demo
      matches.push({
        date: '',
        venue: '',
        opponent: preset.teams[1] || 'TBD',
        matchNumber: i,
        format: preset.format === 'mixed' ? 'ODI' : preset.format as any,
        level: preset.level,
        city: '',
        country: '',
        importance: i === totalMatches ? 'high' : 'medium',
        matchType: i === totalMatches ? 'final' : 'regular'
      });
    }

    seriesForm.setValue('matches', matches);
    setSelectedPreset(presetId);
  };

  const toggleDidNotPlay = (matchIndex: number) => {
    setShowDidNotPlay(prev => ({
      ...prev,
      [matchIndex]: !prev[matchIndex]
    }));
  };

  const addTeam = () => {
    appendTeam({ name: '', isHome: false });
  };

  const addMatch = () => {
    const matchNumber = matchFields.length + 1;
    const currentFormat = seriesForm.getValues('format');
    const matchFormat = currentFormat === 'mixed' ? 'ODI' : currentFormat;

    appendMatch({
      date: '',
      venue: '',
      opponent: '',
      matchNumber,
      format: matchFormat as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
      level: seriesForm.getValues('level'),
      city: '',
      country: ''
    });
  };

  const generateMatches = () => {
    const teams = seriesForm.getValues('teams');
    const seriesType = seriesForm.getValues('type');
    const format = seriesForm.getValues('format');
    const level = seriesForm.getValues('level');

    if (teams.length < 2) {
      alert('Please add at least 2 teams first');
      return;
    }

    type MatchData = {
      date: string;
      venue: string;
      opponent: string;
      matchNumber: number;
      format: 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic';
      level: 'under19-international' | 'domestic' | 'Ranji' | 'IPL' | 'List-A' | 'international';
      city?: string;
      country?: string;
      importance?: 'high' | 'medium' | 'low';
      matchType?: 'debut' | 'milestone' | 'final' | 'knockout' | 'regular';
    };

    const matches: MatchData[] = [];
    const homeTeamObj = teams.find(t => t.isHome);
    const awayTeams = teams.filter(t => !t.isHome);

    if (seriesType === 'bilateral' && homeTeamObj && awayTeams.length === 1) {
      // Generate bilateral series matches
      const opponent = awayTeams[0].name;
      const matchCount = format === 'Test' ? 3 : format === 'ODI' ? 5 : 3; // Default match counts

      for (let i = 1; i <= matchCount; i++) {
        const matchFormat = format === 'mixed' ? (i % 2 === 1 ? 'ODI' : 'T20') : format;
        matches.push({
          date: '',
          venue: '',
          opponent,
          matchNumber: i,
          format: matchFormat as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
          level,
          city: '',
          country: ''
        });
      }
    } else if (seriesType === 'triangular' && teams.length === 3) {
      // Generate triangular series matches (round robin + final)
      const teamNames = teams.map(t => t.name);
      let matchNumber = 1;

      // Round robin matches
      for (let i = 0; i < teamNames.length; i++) {
        for (let j = i + 1; j < teamNames.length; j++) {
          const matchFormat = format === 'mixed' ? 'ODI' : format;
          matches.push({
            date: '',
            venue: '',
            opponent: teamNames[j],
            matchNumber: matchNumber++,
            format: matchFormat as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
            level,
            city: '',
            country: ''
          });
        }
      }

      // Final match
      const finalFormat = format === 'mixed' ? 'ODI' : format;
      matches.push({
        date: '',
        venue: '',
        opponent: 'TBD',
        matchNumber: matchNumber,
        format: finalFormat as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
        level,
        city: '',
        country: '',
        matchType: 'final'
      });
    }

    // Clear existing matches and add generated ones
    seriesForm.setValue('matches', matches);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Series & Tournament Management</h1>
        <p className="text-muted-foreground">
          Create series, tournaments, and manage venues for cricket matches
        </p>
        {currentPlayer && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg inline-block">
            <p className="text-sm font-medium">
              Creating series for: <span className="text-primary">{currentPlayer.fullName}</span>
            </p>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'series' | 'venues')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="series" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Create Series/Tournament
          </TabsTrigger>
          <TabsTrigger value="venues" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            World Cricket Venues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="series">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Create Series or Tournament
              </CardTitle>
              <CardDescription>
                Set up a new series or tournament with multiple matches, teams, and venues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={seriesForm.handleSubmit(onSubmitSeries)} className="space-y-8">
                {/* Tournament Presets */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Tournament Presets
                    </h3>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Label>Select a Tournament Preset</Label>
                    <Select onValueChange={(value) => {
                      if (value === 'custom') {
                        setSelectedPreset('');
                        // Reset form to default values
                        seriesForm.reset({
                          teams: [{ name: '', isHome: true }],
                          matches: [{
                            date: '',
                            venue: '',
                            opponent: '',
                            matchNumber: 1,
                            format: 'ODI',
                            level: 'international',
                            city: '',
                            country: ''
                          }]
                        });
                      } else {
                        applyTournamentPreset(value);
                      }
                    }} value={selectedPreset || 'custom'}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose from famous tournaments..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom">Custom Tournament</SelectItem>
                        {indianTournamentPresets.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.name} ({preset.format})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedPreset && selectedPreset !== 'custom' && (
                      <div className="mt-3 p-3 bg-background rounded border">
                        <p className="text-sm text-muted-foreground">
                          {getTournamentPreset(selectedPreset)?.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Teams: {getTournamentPreset(selectedPreset)?.structure.totalTeams}</span>
                          <span>Matches: {getTournamentPreset(selectedPreset)?.structure.totalMatches}</span>
                          <span>Format: {getTournamentPreset(selectedPreset)?.format}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Basic Series Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Series/Tournament Name *</Label>
                      <Input
                        id="name"
                        {...seriesForm.register('name')}
                        placeholder="e.g., India vs Australia Test Series 2024"
                      />
                      {seriesForm.formState.errors.name && (
                        <p className="text-destructive text-sm">{seriesForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select onValueChange={(value) => seriesForm.setValue('type', value as 'bilateral' | 'triangular' | 'tournament' | 'league')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bilateral">Bilateral Series</SelectItem>
                          <SelectItem value="triangular">Triangular Series</SelectItem>
                          <SelectItem value="tournament">Tournament</SelectItem>
                          <SelectItem value="league">League</SelectItem>
                        </SelectContent>
                      </Select>
                      {seriesForm.formState.errors.type && (
                        <p className="text-destructive text-sm">{seriesForm.formState.errors.type.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Format *</Label>
                      <Select onValueChange={(value) => seriesForm.setValue('format', value as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic' | 'mixed')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Test">Test</SelectItem>
                          <SelectItem value="ODI">ODI</SelectItem>
                          <SelectItem value="T20">T20</SelectItem>
                          <SelectItem value="First-class">First-class</SelectItem>
                          <SelectItem value="List-A">List-A</SelectItem>
                          <SelectItem value="T20-domestic">T20 Domestic</SelectItem>
                          <SelectItem value="mixed">Mixed Format</SelectItem>
                        </SelectContent>
                      </Select>
                      {seriesForm.formState.errors.format && (
                        <p className="text-destructive text-sm">{seriesForm.formState.errors.format.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Level *</Label>
                      <Select onValueChange={(value) => seriesForm.setValue('level', value as 'under19-international' | 'domestic' | 'Ranji' | 'IPL' | 'List-A' | 'international')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under19-international">Under-19 International</SelectItem>
                          <SelectItem value="domestic">Domestic</SelectItem>
                          <SelectItem value="Ranji">Ranji Trophy</SelectItem>
                          <SelectItem value="IPL">IPL</SelectItem>
                          <SelectItem value="List-A">List-A</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                        </SelectContent>
                      </Select>
                      {seriesForm.formState.errors.level && (
                        <p className="text-destructive text-sm">{seriesForm.formState.errors.level.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...seriesForm.register('startDate')}
                      />
                      {seriesForm.formState.errors.startDate && (
                        <p className="text-destructive text-sm">{seriesForm.formState.errors.startDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...seriesForm.register('endDate')}
                      />
                      {seriesForm.formState.errors.endDate && (
                        <p className="text-destructive text-sm">{seriesForm.formState.errors.endDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hostCountry">Host Country *</Label>
                      <Input
                        id="hostCountry"
                        {...seriesForm.register('hostCountry')}
                        placeholder="e.g., India"
                      />
                      {seriesForm.formState.errors.hostCountry && (
                        <p className="text-destructive text-sm">{seriesForm.formState.errors.hostCountry.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trophy">Trophy Name</Label>
                      <Input
                        id="trophy"
                        {...seriesForm.register('trophy')}
                        placeholder="e.g., Border-Gavaskar Trophy"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sponsor">Sponsor</Label>
                      <Input
                        id="sponsor"
                        {...seriesForm.register('sponsor')}
                        placeholder="e.g., Paytm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...seriesForm.register('description')}
                      placeholder="Brief description of the series/tournament"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Player Team Representation */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Player Team Representation
                  </h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="playerTeam">Playing For Team *</Label>
                        <Input
                          id="playerTeam"
                          {...seriesForm.register('playerTeam')}
                          placeholder="e.g., India, Mumbai Indians, Karnataka"
                        />
                        {seriesForm.formState.errors.playerTeam && (
                          <p className="text-destructive text-sm">{seriesForm.formState.errors.playerTeam.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Player Role</Label>
                        <Select onValueChange={(value) => seriesForm.setValue('playerRole', value as 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="batsman">Batsman</SelectItem>
                            <SelectItem value="bowler">Bowler</SelectItem>
                            <SelectItem value="allrounder">All-rounder</SelectItem>
                            <SelectItem value="wicketkeeper">Wicket-keeper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jerseyNumber">Jersey Number</Label>
                        <Input
                          id="jerseyNumber"
                          type="number"
                          {...seriesForm.register('jerseyNumber', { valueAsNumber: true })}
                          placeholder="e.g., 18"
                          min="1"
                          max="99"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-4">
                      <input
                        type="checkbox"
                        id="isCaptain"
                        {...seriesForm.register('isCaptain')}
                        className="rounded"
                      />
                      <Label htmlFor="isCaptain">Captain of the team</Label>
                    </div>
                  </div>
                </div>

                {/* Teams Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Participating Teams</h3>
                    <Button type="button" onClick={addTeam} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team
                    </Button>
                  </div>

                  {teamFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Label>Team Name *</Label>
                        <Input
                          {...seriesForm.register(`teams.${index}.name`)}
                          placeholder="e.g., India, Australia"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          {...seriesForm.register(`teams.${index}.isHome`)}
                          className="rounded"
                        />
                        <Label>Home Team</Label>
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={() => removeTeam(index)}
                          variant="destructive"
                          size="sm"
                          disabled={teamFields.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {seriesForm.formState.errors.teams && (
                    <p className="text-destructive text-sm">{seriesForm.formState.errors.teams.message}</p>
                  )}
                </div>

                {/* Matches Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Matches</h3>
                    <div className="flex gap-2">
                      <Button type="button" onClick={generateMatches} variant="outline" size="sm">
                        Generate Matches
                      </Button>
                      <Button type="button" onClick={addMatch} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Match
                      </Button>
                    </div>
                  </div>

                  {matchFields.map((field, index) => (
                    <div key={field.id} className="p-4 border rounded-lg space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Match #{index + 1} Date *</Label>
                          <Input
                            type="date"
                            {...seriesForm.register(`matches.${index}.date`)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Venue *</Label>
                          <Select onValueChange={(value) => {
                            seriesForm.setValue(`matches.${index}.venue`, value);
                            const selectedVenue = venues.find(v => v.name === value);
                            if (selectedVenue) {
                              seriesForm.setValue(`matches.${index}.city`, selectedVenue.city);
                              seriesForm.setValue(`matches.${index}.country`, selectedVenue.country);
                            }
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select venue" />
                            </SelectTrigger>
                            <SelectContent>
                              {venues.map((venue) => (
                                <SelectItem key={venue._id} value={venue.name}>
                                  {venue.name}, {venue.city}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Opponent *</Label>
                          <Input
                            {...seriesForm.register(`matches.${index}.opponent`)}
                            placeholder="Opponent team"
                          />
                        </div>

                        <div className="flex items-end gap-2">
                          <Button
                            type="button"
                            onClick={() => toggleDidNotPlay(index)}
                            variant={showDidNotPlay[index] ? "default" : "outline"}
                            size="sm"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            {showDidNotPlay[index] ? "Hide" : "DNP"}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => removeMatch(index)}
                            variant="destructive"
                            size="sm"
                            disabled={matchFields.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Did Not Play Section */}
                      {showDidNotPlay[index] && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Did Not Play Configuration
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Reason for Not Playing</Label>
                              <Select onValueChange={(value) =>
                                seriesForm.setValue(`matches.${index}.didNotPlay.reason`, value as any)
                              }>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="injury">Injury</SelectItem>
                                  <SelectItem value="illness">Illness</SelectItem>
                                  <SelectItem value="rest">Rest/Rotation</SelectItem>
                                  <SelectItem value="disciplinary">Disciplinary</SelectItem>
                                  <SelectItem value="personal">Personal Reasons</SelectItem>
                                  <SelectItem value="team_selection">Team Selection</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label>Details</Label>
                              <Input
                                {...seriesForm.register(`matches.${index}.didNotPlay.details`)}
                                placeholder="Additional details..."
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Replacement Player</Label>
                              <Input
                                {...seriesForm.register(`matches.${index}.didNotPlay.replacementPlayer`)}
                                placeholder="Player name"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {seriesForm.formState.errors.matches && (
                    <p className="text-destructive text-sm">{seriesForm.formState.errors.matches.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Creating Series...' : 'Create Series/Tournament'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="venues">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                World Cricket Venues
              </CardTitle>
              <CardDescription>
                Load famous cricket venues from around the world into your database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {venues.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No venues loaded</h3>
                  <p className="text-muted-foreground mb-4">
                    Load world-famous cricket venues including Lord's, MCG, Eden Gardens, and many more
                  </p>
                  <Button onClick={seedVenues} disabled={seeding} size="lg">
                    {seeding ? 'Loading Venues...' : 'Load World Cricket Venues'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Available Venues</h3>
                      <p className="text-muted-foreground">
                        {venues.length} cricket venue{venues.length !== 1 ? 's' : ''} from around the world
                      </p>
                    </div>
                    <Button onClick={seedVenues} disabled={seeding} variant="outline">
                      {seeding ? 'Reloading...' : 'Reload Venues'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {venues.map((venue) => (
                      <div key={venue._id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <h4 className="font-medium text-lg">{venue.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {venue.city}, {venue.country}
                        </p>
                        {venue.capacity && (
                          <p className="text-sm text-muted-foreground">
                            Capacity: {venue.capacity.toLocaleString()}
                          </p>
                        )}
                        {venue.pitchType && (
                          <p className="text-sm text-muted-foreground capitalize">
                            Pitch: {venue.pitchType} friendly
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}