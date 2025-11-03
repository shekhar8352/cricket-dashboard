'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MatchTable from "@/components/MatchTable";
import MatchSummary from "@/components/MatchSummary";
import SeriesCreationForm from "@/components/SeriesCreationForm";
import SeriesParticipationList from "@/components/SeriesParticipationList";

// Form validation schemas
const playerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  country: z.string().min(1, 'Country is required'),
  role: z.enum(['batsman', 'bowler', 'allrounder', 'wicketkeeper']),
  battingStyle: z.string().min(1, 'Batting style is required'),
  bowlingStyle: z.string().optional(),
  careerStart: z.string().min(1, 'Career start date is required'),
  careerEnd: z.string().optional(),
  
  // Additional player details
  height: z.number().optional(),
  weight: z.number().optional(),
  birthPlace: z.string().optional(),
  nickname: z.string().optional(),
  education: z.string().optional(),
});

const matchSchema = z.object({
  level: z.enum(['under19-international', 'domestic', 'Ranji', 'IPL', 'List-A', 'international']),
  format: z.enum(['Test', 'ODI', 'T20', 'First-class', 'List-A', 'T20-domestic']),
  date: z.string().min(1, 'Match date is required'),
  venue: z.string().min(1, 'Venue is required'),
  opponent: z.string().min(1, 'Opponent is required'),
  result: z.string().optional(),
  
  // Match details
  tossWinner: z.string().optional(),
  tossDecision: z.enum(['bat', 'bowl']).optional(),
  series: z.string().optional(),
  seriesType: z.enum(['bilateral', 'triangular', 'tournament', 'league']).optional(),
  tournament: z.string().optional(),
  manOfTheMatch: z.string().optional(),
  
  // Match conditions
  weather: z.enum(['sunny', 'cloudy', 'overcast', 'drizzle', 'rain']).optional(),
  pitchCondition: z.enum(['green', 'dry', 'dusty', 'flat', 'two-paced']).optional(),
  pitchType: z.enum(['batting', 'bowling', 'balanced']).optional(),
  
  // Match context
  homeAway: z.enum(['home', 'away', 'neutral']).optional(),
  dayNight: z.boolean().optional(),
  matchNumber: z.number().optional(),
  totalMatches: z.number().optional(),
  
  // Team details
  captain: z.string().optional(),
  wicketKeeper: z.string().optional(),
  
  // Stadium details
  city: z.string().optional(),
  country: z.string().optional(),
  stadiumCapacity: z.number().optional(),
  
  // Match importance
  importance: z.enum(['high', 'medium', 'low']).optional(),
  matchType: z.enum(['debut', 'milestone', 'final', 'knockout', 'regular']).optional(),
});

const performanceSchema = z.object({
  matchId: z.string().min(1, 'Match selection is required'),
  
  // Match context
  battingPosition: z.number().optional(),
  bowlingPosition: z.enum(['opening', 'middle', 'death']).optional(),
  innings: z.number().min(1).max(2).optional(),
  isChasing: z.boolean().optional(),
  target: z.number().optional(),
  requiredRunRate: z.number().optional(),
  isCaptain: z.boolean().optional(),
  isWicketKeeper: z.boolean().optional(),
  fieldingPosition: z.string().optional(),
  
  // Batting performance
  runs: z.number().min(0).optional(),
  ballsFaced: z.number().min(0).optional(),
  fours: z.number().min(0).optional(),
  sixes: z.number().min(0).optional(),
  singles: z.number().min(0).optional(),
  twos: z.number().min(0).optional(),
  threes: z.number().min(0).optional(),
  dotBalls: z.number().min(0).optional(),
  
  // Batting phases
  powerplayRuns: z.number().min(0).optional(),
  powerplayBalls: z.number().min(0).optional(),
  middleOversRuns: z.number().min(0).optional(),
  middleOversBalls: z.number().min(0).optional(),
  deathOversRuns: z.number().min(0).optional(),
  deathOversBalls: z.number().min(0).optional(),
  
  // Dismissal
  dismissalType: z.string().optional(),
  dismissalBowler: z.string().optional(),
  dismissalFielder: z.string().optional(),
  dismissalOver: z.number().optional(),
  dismissalBall: z.number().optional(),
  
  // Bowling performance
  overs: z.number().min(0).optional(),
  maidens: z.number().min(0).optional(),
  runsConceded: z.number().min(0).optional(),
  wickets: z.number().min(0).optional(),
  dotBallsBowled: z.number().min(0).optional(),
  wides: z.number().min(0).optional(),
  noBalls: z.number().min(0).optional(),
  
  // Wicket types
  caughtWickets: z.number().min(0).optional(),
  bowledWickets: z.number().min(0).optional(),
  lbwWickets: z.number().min(0).optional(),
  stumpedWickets: z.number().min(0).optional(),
  
  // Fielding
  catches: z.number().min(0).optional(),
  stumpings: z.number().min(0).optional(),
  runOuts: z.number().min(0).optional(),
});

// Schema for updating existing player (only teams and career end date)
const playerUpdateSchema = z.object({
  teams: z.array(z.object({
    name: z.string().min(1, 'Team name is required'),
    level: z.enum(['under19-international', 'domestic', 'Ranji', 'IPL', 'List-A', 'international']),
    from: z.string().min(1, 'Start date is required'),
    to: z.string().optional(),
  })).optional(),
  careerEnd: z.string().optional(),
});

type PlayerFormData = z.infer<typeof playerSchema>;
type PlayerUpdateFormData = z.infer<typeof playerUpdateSchema>;
type MatchFormData = z.infer<typeof matchSchema>;
type PerformanceFormData = z.infer<typeof performanceSchema>;

export default function DataEntryPage() {
  const [activeTab, setActiveTab] = useState<'player' | 'match' | 'performance' | 'series'>('player');
  const [matches, setMatches] = useState<Array<{
    _id: string;
    opponent: string;
    format: string;
    date: string;
    venue: string;
    level: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [existingPlayer, setExistingPlayer] = useState<{
    _id: string;
    fullName: string;
    dob: string;
    country: string;
    role: string;
    careerStart: string;
    careerEnd?: string;
    isActive: boolean;
    teams?: Array<{
      name: string;
      level: string;
      from: string;
      to?: string;
    }>;
  } | null>(null);
  const [checkingPlayer, setCheckingPlayer] = useState(true);
  const [editingMatch, setEditingMatch] = useState<{
    _id: string;
    level: string;
    format: string;
    date: string;
    venue: string;
    opponent: string;
    result?: string;
    tossWinner?: string;
    tossDecision?: string;
    series?: string;
    manOfTheMatch?: string;
  } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const playerForm = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
  });

  const playerUpdateForm = useForm<PlayerUpdateFormData>({
    resolver: zodResolver(playerUpdateSchema),
  });

  const matchForm = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
  });

  const performanceForm = useForm<PerformanceFormData>({
    resolver: zodResolver(performanceSchema),
  });

  const checkExistingPlayer = useCallback(async () => {
    setCheckingPlayer(true);
    try {
      const response = await fetch('/api/players');
      const data = await response.json();
      if (data.success && data.players.length > 0) {
        const activePlayer = data.players.find((p: { isActive: boolean }) => p.isActive);
        if (activePlayer) {
          setExistingPlayer(activePlayer);
          // Pre-populate the update form with existing data
          playerUpdateForm.setValue('careerEnd', activePlayer.careerEnd ? new Date(activePlayer.careerEnd).toISOString().split('T')[0] : '');
          if (activePlayer.teams && activePlayer.teams.length > 0) {
            playerUpdateForm.setValue('teams', activePlayer.teams.map((team: {
              name: string;
              level: string;
              from: string;
              to?: string;
            }) => ({
              name: team.name,
              level: team.level,
              from: new Date(team.from).toISOString().split('T')[0],
              to: team.to ? new Date(team.to).toISOString().split('T')[0] : '',
            })));
          }
        }
      }
    } catch {
      console.error('Error checking for existing player');
    }
    setCheckingPlayer(false);
  }, [playerUpdateForm]);

  // Check for existing player on component mount
  useEffect(() => {
    checkExistingPlayer();
  }, [checkExistingPlayer]);

  // Fetch matches when performance tab is selected
  useEffect(() => {
    if (activeTab === 'performance') {
      fetchMatches();
    }
  }, [activeTab]);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch {
      console.error('Error fetching matches');
    }
  };

  const onSubmitPlayer = async (data: PlayerFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        alert('Player added successfully!');
        playerForm.reset();
        // Refresh to check for the new player
        checkExistingPlayer();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error adding player');
      }
    } catch {
      alert('Error adding player');
    }
    setLoading(false);
  };

  const onSubmitPlayerUpdate = async (data: PlayerUpdateFormData) => {
    if (!existingPlayer) {
      alert('No existing player found');
      return;
    }
    
    setLoading(true);
    try {
      const updateData = {
        playerId: existingPlayer._id,
        ...data,
      };

      const response = await fetch('/api/players', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        alert('Player updated successfully!');
        // Refresh player data
        checkExistingPlayer();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error updating player');
      }
    } catch {
      alert('Error updating player');
    }
    setLoading(false);
  };

  const onSubmitMatch = async (data: MatchFormData) => {
    const isEditing = editingMatch !== null;
    setLoading(true);
    try {
      const url = isEditing ? `/api/matches/${editingMatch._id}` : '/api/matches';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (isEditing) {
          setMatches(prev => prev.map(match => 
            match._id === editingMatch._id ? result.match : match
          ));
          alert('Match updated successfully!');
          setEditingMatch(null);
        } else {
          setMatches(prev => [...prev, result.match]);
          alert('Match added successfully!');
        }
        matchForm.reset();
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert(isEditing ? 'Error updating match' : 'Error adding match');
      }
    } catch {
      alert(isEditing ? 'Error updating match' : 'Error adding match');
    }
    setLoading(false);
  };

  const handleEditMatch = (match: {
    _id: string;
    level: string;
    format: string;
    date: string;
    venue: string;
    opponent: string;
    result?: string;
    tossWinner?: string;
    tossDecision?: string;
    series?: string;
    manOfTheMatch?: string;
  }) => {
    setEditingMatch(match);
    // Pre-populate the form with match data
    matchForm.setValue('level', match.level as 'under19-international' | 'domestic' | 'Ranji' | 'IPL' | 'List-A' | 'international');
    matchForm.setValue('format', match.format as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic');
    matchForm.setValue('date', new Date(match.date).toISOString().split('T')[0]);
    matchForm.setValue('venue', match.venue);
    matchForm.setValue('opponent', match.opponent);
    matchForm.setValue('result', match.result || '');
    matchForm.setValue('tossWinner', match.tossWinner || '');
    matchForm.setValue('tossDecision', match.tossDecision as 'bat' | 'bowl' | undefined);
    matchForm.setValue('series', match.series || '');
    matchForm.setValue('manOfTheMatch', match.manOfTheMatch || '');
  };

  const handleCancelEdit = () => {
    setEditingMatch(null);
    matchForm.reset();
  };

  const handleDeleteMatch = async (matchId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setMatches(prev => prev.filter(match => match._id !== matchId));
        alert('Match deleted successfully!');
        // If we were editing this match, cancel the edit
        if (editingMatch && editingMatch._id === matchId) {
          handleCancelEdit();
        }
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert('Error deleting match');
      }
    } catch {
      alert('Error deleting match');
    }
    setLoading(false);
  };

  const handleRefreshMatches = () => {
    fetchMatches();
    setRefreshTrigger(prev => prev + 1);
  };

  const onSubmitPerformance = async (data: PerformanceFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/performances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        alert('Performance added successfully!');
        performanceForm.reset();
      } else {
        alert('Error adding performance');
      }
    } catch {
      alert('Error adding performance');
    }
    setLoading(false);
  };

  // Component for creating a new player
  const NewPlayerForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Player Information</CardTitle>
        <CardDescription>
          Enter the player&apos;s basic information and career details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={playerForm.handleSubmit(onSubmitPlayer)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                {...playerForm.register('fullName')}
                placeholder="Enter full name"
              />
              {playerForm.formState.errors.fullName && (
                <p className="text-destructive text-sm">{playerForm.formState.errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                {...playerForm.register('dob')}
              />
              {playerForm.formState.errors.dob && (
                <p className="text-destructive text-sm">{playerForm.formState.errors.dob.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                {...playerForm.register('country')}
                placeholder="e.g., India, Australia"
              />
              {playerForm.formState.errors.country && (
                <p className="text-destructive text-sm">{playerForm.formState.errors.country.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <Select onValueChange={(value) => playerForm.setValue('role', value as 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper')}>
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
              {playerForm.formState.errors.role && (
                <p className="text-destructive text-sm">{playerForm.formState.errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="battingStyle">Batting Style *</Label>
              <Input
                id="battingStyle"
                {...playerForm.register('battingStyle')}
                placeholder="e.g., Right-handed, Left-handed"
              />
              {playerForm.formState.errors.battingStyle && (
                <p className="text-destructive text-sm">{playerForm.formState.errors.battingStyle.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bowlingStyle">Bowling Style</Label>
              <Input
                id="bowlingStyle"
                {...playerForm.register('bowlingStyle')}
                placeholder="e.g., Right-arm fast, Left-arm spin"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="careerStart">Career Start *</Label>
              <Input
                id="careerStart"
                type="date"
                {...playerForm.register('careerStart')}
              />
              {playerForm.formState.errors.careerStart && (
                <p className="text-destructive text-sm">{playerForm.formState.errors.careerStart.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="careerEnd">Career End</Label>
              <Input
                id="careerEnd"
                type="date"
                {...playerForm.register('careerEnd')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                {...playerForm.register('height', { valueAsNumber: true })}
                placeholder="e.g., 175"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                {...playerForm.register('weight', { valueAsNumber: true })}
                placeholder="e.g., 70"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthPlace">Birth Place</Label>
              <Input
                id="birthPlace"
                {...playerForm.register('birthPlace')}
                placeholder="e.g., Mumbai, India"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                {...playerForm.register('nickname')}
                placeholder="e.g., Captain Cool"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education</Label>
              <Input
                id="education"
                {...playerForm.register('education')}
                placeholder="e.g., St. Xavier's College"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Adding Player...' : 'Add Player'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  // Component for updating existing player (only teams and career end date)
  const PlayerUpdateForm = () => {
    type TeamType = {
      name: string;
      level: 'under19-international' | 'domestic' | 'Ranji' | 'IPL' | 'List-A' | 'international';
      from: string;
      to: string;
    };

    const [teams, setTeams] = useState<TeamType[]>(
      existingPlayer?.teams?.map((team: {
        name: string;
        level: string;
        from: string;
        to?: string;
      }) => ({
        name: team.name || '',
        level: (team.level as 'under19-international' | 'domestic' | 'Ranji' | 'IPL' | 'List-A' | 'international') || 'domestic',
        from: team.from ? new Date(team.from).toISOString().split('T')[0] : '',
        to: team.to ? new Date(team.to).toISOString().split('T')[0] : '',
      })) || [{ name: '', level: 'domestic' as const, from: '', to: '' }]
    );

    const addTeam = () => {
      setTeams([...teams, { name: '', level: 'domestic', from: '', to: '' }]);
    };

    const removeTeam = (index: number) => {
      setTeams(teams.filter((_: TeamType, i: number) => i !== index));
    };

    const updateTeam = (index: number, field: keyof TeamType, value: string) => {
      const updatedTeams = teams.map((team: TeamType, i: number) => 
        i === index ? { ...team, [field]: value } : team
      );
      setTeams(updatedTeams);
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const formData = playerUpdateForm.getValues();
      onSubmitPlayerUpdate({
        ...formData,
        teams: teams.filter((team: TeamType) => team.name && team.from), // Only include teams with name and from date
      });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Player Information</CardTitle>
          <CardDescription>
            You can only update teams and career end date for {existingPlayer?.fullName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display read-only player info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <p className="text-sm text-muted-foreground">{existingPlayer?.fullName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Date of Birth</Label>
                <p className="text-sm text-muted-foreground">
                  {existingPlayer?.dob ? new Date(existingPlayer.dob).toLocaleDateString() : ''}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Country</Label>
                <p className="text-sm text-muted-foreground">{existingPlayer?.country}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Role</Label>
                <p className="text-sm text-muted-foreground">{existingPlayer?.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Career Start</Label>
                <p className="text-sm text-muted-foreground">
                  {existingPlayer?.careerStart ? new Date(existingPlayer.careerStart).toLocaleDateString() : ''}
                </p>
              </div>
            </div>

            {/* Editable fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="careerEndUpdate">Career End Date</Label>
                <Input
                  id="careerEndUpdate"
                  type="date"
                  {...playerUpdateForm.register('careerEnd')}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-medium">Teams</Label>
                  <Button type="button" onClick={addTeam} variant="outline" size="sm">
                    Add Team
                  </Button>
                </div>
                
                {teams.map((team: TeamType, index: number) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>Team Name *</Label>
                      <Input
                        value={team.name}
                        onChange={(e) => updateTeam(index, 'name', e.target.value)}
                        placeholder="e.g., Mumbai Indians"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Level *</Label>
                      <Select 
                        value={team.level} 
                        onValueChange={(value) => updateTeam(index, 'level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                    </div>
                    
                    <div className="space-y-2">
                      <Label>From Date *</Label>
                      <Input
                        type="date"
                        value={team.from}
                        onChange={(e) => updateTeam(index, 'from', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <Input
                        type="date"
                        value={team.to}
                        onChange={(e) => updateTeam(index, 'to', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={() => removeTeam(index)} 
                        variant="destructive" 
                        size="sm"
                        disabled={teams.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating Player...' : 'Update Player'}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  if (checkingPlayer) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking for existing player...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Cricket Data Entry</h1>
          <p className="text-muted-foreground">
            {existingPlayer 
              ? `Managing data for ${existingPlayer?.fullName}` 
              : 'Enter player information, match details, and performance statistics'
            }
          </p>
          {existingPlayer && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Player exists: You can only edit teams and career end date
              </p>
            </div>
          )}
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'player' | 'match' | 'performance' | 'series')} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="player">Player Info</TabsTrigger>
            <TabsTrigger value="match">Match Details</TabsTrigger>
            <TabsTrigger value="series">Series/Tournament</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="player">
            {existingPlayer ? (
              <PlayerUpdateForm />
            ) : (
              <NewPlayerForm />
            )}
          </TabsContent>

          <TabsContent value="match">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingMatch ? 'Edit Match Details' : 'Match Details'}
                  </CardTitle>
                  <CardDescription>
                    {editingMatch 
                      ? 'Update match information including venue, opponent, and match conditions'
                      : 'Enter match information including venue, opponent, and match conditions'
                    }
                  </CardDescription>
                  {editingMatch && (
                    <div className="flex gap-2 mt-2">
                      <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                        Cancel Edit
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                <form onSubmit={matchForm.handleSubmit(onSubmitMatch)} className="space-y-8">
                  {/* Basic Match Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Match Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Level *</Label>
                        <Select onValueChange={(value) => matchForm.setValue('level', value as 'under19-international' | 'domestic' | 'Ranji' | 'IPL' | 'List-A' | 'international')}>
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
                        {matchForm.formState.errors.level && (
                          <p className="text-destructive text-sm">{matchForm.formState.errors.level.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Format *</Label>
                        <Select onValueChange={(value) => matchForm.setValue('format', value as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic')}>
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
                          </SelectContent>
                        </Select>
                        {matchForm.formState.errors.format && (
                          <p className="text-destructive text-sm">{matchForm.formState.errors.format.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">Match Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          {...matchForm.register('date')}
                        />
                        {matchForm.formState.errors.date && (
                          <p className="text-destructive text-sm">{matchForm.formState.errors.date.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="opponent">Opponent *</Label>
                        <Input
                          id="opponent"
                          {...matchForm.register('opponent')}
                          placeholder="e.g., Australia, Mumbai Indians"
                        />
                        {matchForm.formState.errors.opponent && (
                          <p className="text-destructive text-sm">{matchForm.formState.errors.opponent.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="venue">Venue *</Label>
                        <Input
                          id="venue"
                          {...matchForm.register('venue')}
                          placeholder="e.g., Eden Gardens, Kolkata"
                        />
                        {matchForm.formState.errors.venue && (
                          <p className="text-destructive text-sm">{matchForm.formState.errors.venue.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          {...matchForm.register('city')}
                          placeholder="e.g., Mumbai"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          {...matchForm.register('country')}
                          placeholder="e.g., India"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stadiumCapacity">Stadium Capacity</Label>
                        <Input
                          id="stadiumCapacity"
                          type="number"
                          {...matchForm.register('stadiumCapacity', { valueAsNumber: true })}
                          placeholder="e.g., 68000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Series & Tournament Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Series & Tournament Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="series">Series</Label>
                        <Input
                          id="series"
                          {...matchForm.register('series')}
                          placeholder="e.g., India vs Australia Test Series 2023"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Series Type</Label>
                        <Select onValueChange={(value) => matchForm.setValue('seriesType', value as 'bilateral' | 'triangular' | 'tournament' | 'league')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select series type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bilateral">Bilateral</SelectItem>
                            <SelectItem value="triangular">Triangular</SelectItem>
                            <SelectItem value="tournament">Tournament</SelectItem>
                            <SelectItem value="league">League</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tournament">Tournament</Label>
                        <Input
                          id="tournament"
                          {...matchForm.register('tournament')}
                          placeholder="e.g., World Cup, IPL"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="matchNumber">Match Number</Label>
                        <Input
                          id="matchNumber"
                          type="number"
                          {...matchForm.register('matchNumber', { valueAsNumber: true })}
                          placeholder="e.g., 3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="totalMatches">Total Matches in Series</Label>
                        <Input
                          id="totalMatches"
                          type="number"
                          {...matchForm.register('totalMatches', { valueAsNumber: true })}
                          placeholder="e.g., 5"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Match Conditions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Match Conditions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Weather</Label>
                        <Select onValueChange={(value) => matchForm.setValue('weather', value as 'sunny' | 'cloudy' | 'overcast' | 'drizzle' | 'rain')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select weather" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sunny">Sunny</SelectItem>
                            <SelectItem value="cloudy">Cloudy</SelectItem>
                            <SelectItem value="overcast">Overcast</SelectItem>
                            <SelectItem value="drizzle">Drizzle</SelectItem>
                            <SelectItem value="rain">Rain</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Pitch Condition</Label>
                        <Select onValueChange={(value) => matchForm.setValue('pitchCondition', value as 'green' | 'dry' | 'dusty' | 'flat' | 'two-paced')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pitch condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="dry">Dry</SelectItem>
                            <SelectItem value="dusty">Dusty</SelectItem>
                            <SelectItem value="flat">Flat</SelectItem>
                            <SelectItem value="two-paced">Two-paced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Pitch Type</Label>
                        <Select onValueChange={(value) => matchForm.setValue('pitchType', value as 'batting' | 'bowling' | 'balanced')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pitch type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="batting">Batting</SelectItem>
                            <SelectItem value="bowling">Bowling</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Home/Away</Label>
                        <Select onValueChange={(value) => matchForm.setValue('homeAway', value as 'home' | 'away' | 'neutral')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select home/away" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="away">Away</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="dayNight"
                          {...matchForm.register('dayNight')}
                          className="rounded"
                        />
                        <Label htmlFor="dayNight">Day-Night Match</Label>
                      </div>
                    </div>
                  </div>

                  {/* Match Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Match Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="result">Result</Label>
                        <Input
                          id="result"
                          {...matchForm.register('result')}
                          placeholder="e.g., Won by 5 wickets"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tossWinner">Toss Winner</Label>
                        <Input
                          id="tossWinner"
                          {...matchForm.register('tossWinner')}
                          placeholder="Team that won the toss"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Toss Decision</Label>
                        <Select onValueChange={(value) => matchForm.setValue('tossDecision', value as 'bat' | 'bowl')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select decision" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bat">Bat</SelectItem>
                            <SelectItem value="bowl">Bowl</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="manOfTheMatch">Man of the Match</Label>
                        <Input
                          id="manOfTheMatch"
                          {...matchForm.register('manOfTheMatch')}
                          placeholder="Player name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="captain">Captain</Label>
                        <Input
                          id="captain"
                          {...matchForm.register('captain')}
                          placeholder="Team captain"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="wicketKeeper">Wicket Keeper</Label>
                        <Input
                          id="wicketKeeper"
                          {...matchForm.register('wicketKeeper')}
                          placeholder="Wicket keeper name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Match Importance</Label>
                        <Select onValueChange={(value) => matchForm.setValue('importance', value as 'high' | 'medium' | 'low')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select importance" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Match Type</Label>
                        <Select onValueChange={(value) => matchForm.setValue('matchType', value as 'debut' | 'milestone' | 'final' | 'knockout' | 'regular')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select match type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debut">Debut</SelectItem>
                            <SelectItem value="milestone">Milestone</SelectItem>
                            <SelectItem value="final">Final</SelectItem>
                            <SelectItem value="knockout">Knockout</SelectItem>
                            <SelectItem value="regular">Regular</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading 
                      ? (editingMatch ? 'Updating Match...' : 'Adding Match...') 
                      : (editingMatch ? 'Update Match' : 'Add Match')
                    }
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Match Summary */}
            <MatchSummary matches={matches} />

            {/* Match Table */}
            <MatchTable 
              onEditMatch={handleEditMatch} 
              onDeleteMatch={handleDeleteMatch}
              refreshTrigger={refreshTrigger}
              onRefresh={handleRefreshMatches}
            />
            </div>
          </TabsContent>

          <TabsContent value="series">
            <div className="space-y-6">
              <SeriesCreationForm />
              <SeriesParticipationList />
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance Data</CardTitle>
                <CardDescription>
                  Enter batting, bowling, and fielding performance for a specific match
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={performanceForm.handleSubmit(onSubmitPerformance)} className="space-y-8">
                  {/* Match Selection */}
                  <div className="space-y-2">
                    <Label>Select Match *</Label>
                    <Select onValueChange={(value) => performanceForm.setValue('matchId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a match" />
                      </SelectTrigger>
                      <SelectContent>
                        {matches.map((match) => (
                          <SelectItem key={match._id} value={match._id}>
                            {match.opponent} - {match.format} - {new Date(match.date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {performanceForm.formState.errors.matchId && (
                      <p className="text-destructive text-sm">{performanceForm.formState.errors.matchId.message}</p>
                    )}
                  </div>

                  {/* Match Context */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Match Context</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="battingPosition">Batting Position</Label>
                        <Input
                          id="battingPosition"
                          type="number"
                          {...performanceForm.register('battingPosition', { valueAsNumber: true })}
                          min="1"
                          max="11"
                          placeholder="e.g., 3"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Bowling Position</Label>
                        <Select onValueChange={(value) => performanceForm.setValue('bowlingPosition', value as 'opening' | 'middle' | 'death')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bowling position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="opening">Opening</SelectItem>
                            <SelectItem value="middle">Middle</SelectItem>
                            <SelectItem value="death">Death</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Innings</Label>
                        <Select onValueChange={(value) => performanceForm.setValue('innings', parseInt(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select innings" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">First Innings</SelectItem>
                            <SelectItem value="2">Second Innings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="target">Target (if chasing)</Label>
                        <Input
                          id="target"
                          type="number"
                          {...performanceForm.register('target', { valueAsNumber: true })}
                          min="0"
                          placeholder="e.g., 250"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requiredRunRate">Required Run Rate</Label>
                        <Input
                          id="requiredRunRate"
                          type="number"
                          step="0.1"
                          {...performanceForm.register('requiredRunRate', { valueAsNumber: true })}
                          min="0"
                          placeholder="e.g., 6.5"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fieldingPosition">Fielding Position</Label>
                        <Input
                          id="fieldingPosition"
                          {...performanceForm.register('fieldingPosition')}
                          placeholder="e.g., slip, mid-off"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isCaptain"
                            {...performanceForm.register('isCaptain')}
                            className="rounded"
                          />
                          <Label htmlFor="isCaptain">Captain</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isWicketKeeper"
                            {...performanceForm.register('isWicketKeeper')}
                            className="rounded"
                          />
                          <Label htmlFor="isWicketKeeper">Wicket Keeper</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isChasing"
                            {...performanceForm.register('isChasing')}
                            className="rounded"
                          />
                          <Label htmlFor="isChasing">Chasing</Label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Batting Performance */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Batting Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="runs">Runs</Label>
                        <Input
                          id="runs"
                          type="number"
                          {...performanceForm.register('runs', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ballsFaced">Balls Faced</Label>
                        <Input
                          id="ballsFaced"
                          type="number"
                          {...performanceForm.register('ballsFaced', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fours">Fours</Label>
                        <Input
                          id="fours"
                          type="number"
                          {...performanceForm.register('fours', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sixes">Sixes</Label>
                        <Input
                          id="sixes"
                          type="number"
                          {...performanceForm.register('sixes', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="singles">Singles</Label>
                        <Input
                          id="singles"
                          type="number"
                          {...performanceForm.register('singles', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twos">Twos</Label>
                        <Input
                          id="twos"
                          type="number"
                          {...performanceForm.register('twos', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="threes">Threes</Label>
                        <Input
                          id="threes"
                          type="number"
                          {...performanceForm.register('threes', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dotBalls">Dot Balls</Label>
                        <Input
                          id="dotBalls"
                          type="number"
                          {...performanceForm.register('dotBalls', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Batting Phases */}
                    <h4 className="text-md font-medium mt-6">Batting by Phases</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="powerplayRuns">Powerplay Runs</Label>
                        <Input
                          id="powerplayRuns"
                          type="number"
                          {...performanceForm.register('powerplayRuns', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="powerplayBalls">Powerplay Balls</Label>
                        <Input
                          id="powerplayBalls"
                          type="number"
                          {...performanceForm.register('powerplayBalls', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="middleOversRuns">Middle Overs Runs</Label>
                        <Input
                          id="middleOversRuns"
                          type="number"
                          {...performanceForm.register('middleOversRuns', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="middleOversBalls">Middle Overs Balls</Label>
                        <Input
                          id="middleOversBalls"
                          type="number"
                          {...performanceForm.register('middleOversBalls', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deathOversRuns">Death Overs Runs</Label>
                        <Input
                          id="deathOversRuns"
                          type="number"
                          {...performanceForm.register('deathOversRuns', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deathOversBalls">Death Overs Balls</Label>
                        <Input
                          id="deathOversBalls"
                          type="number"
                          {...performanceForm.register('deathOversBalls', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Dismissal Details */}
                    <h4 className="text-md font-medium mt-6">Dismissal Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dismissalType">Dismissal Type</Label>
                        <Input
                          id="dismissalType"
                          {...performanceForm.register('dismissalType')}
                          placeholder="e.g., caught, bowled, lbw"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dismissalBowler">Dismissal Bowler</Label>
                        <Input
                          id="dismissalBowler"
                          {...performanceForm.register('dismissalBowler')}
                          placeholder="Bowler name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dismissalFielder">Dismissal Fielder</Label>
                        <Input
                          id="dismissalFielder"
                          {...performanceForm.register('dismissalFielder')}
                          placeholder="Fielder name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dismissalOver">Dismissal Over</Label>
                        <Input
                          id="dismissalOver"
                          type="number"
                          {...performanceForm.register('dismissalOver', { valueAsNumber: true })}
                          min="1"
                          placeholder="e.g., 15"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dismissalBall">Dismissal Ball</Label>
                        <Input
                          id="dismissalBall"
                          type="number"
                          {...performanceForm.register('dismissalBall', { valueAsNumber: true })}
                          min="1"
                          max="6"
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bowling Performance */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bowling Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="overs">Overs</Label>
                        <Input
                          id="overs"
                          type="number"
                          step="0.1"
                          {...performanceForm.register('overs', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maidens">Maidens</Label>
                        <Input
                          id="maidens"
                          type="number"
                          {...performanceForm.register('maidens', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="runsConceded">Runs Conceded</Label>
                        <Input
                          id="runsConceded"
                          type="number"
                          {...performanceForm.register('runsConceded', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wickets">Wickets</Label>
                        <Input
                          id="wickets"
                          type="number"
                          {...performanceForm.register('wickets', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dotBallsBowled">Dot Balls Bowled</Label>
                        <Input
                          id="dotBallsBowled"
                          type="number"
                          {...performanceForm.register('dotBallsBowled', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="wides">Wides</Label>
                        <Input
                          id="wides"
                          type="number"
                          {...performanceForm.register('wides', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="noBalls">No Balls</Label>
                        <Input
                          id="noBalls"
                          type="number"
                          {...performanceForm.register('noBalls', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Wicket Types */}
                    <h4 className="text-md font-medium mt-6">Wicket Types</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="caughtWickets">Caught</Label>
                        <Input
                          id="caughtWickets"
                          type="number"
                          {...performanceForm.register('caughtWickets', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bowledWickets">Bowled</Label>
                        <Input
                          id="bowledWickets"
                          type="number"
                          {...performanceForm.register('bowledWickets', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lbwWickets">LBW</Label>
                        <Input
                          id="lbwWickets"
                          type="number"
                          {...performanceForm.register('lbwWickets', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stumpedWickets">Stumped</Label>
                        <Input
                          id="stumpedWickets"
                          type="number"
                          {...performanceForm.register('stumpedWickets', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fielding Performance */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Fielding Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="catches">Catches</Label>
                        <Input
                          id="catches"
                          type="number"
                          {...performanceForm.register('catches', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stumpings">Stumpings</Label>
                        <Input
                          id="stumpings"
                          type="number"
                          {...performanceForm.register('stumpings', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="runOuts">Run Outs</Label>
                        <Input
                          id="runOuts"
                          type="number"
                          {...performanceForm.register('runOuts', { valueAsNumber: true })}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Adding Performance...' : 'Add Performance'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}