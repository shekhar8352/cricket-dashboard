'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
});

const matchSchema = z.object({
  level: z.enum(['school', 'domestic', 'Ranji', 'IPL', 'international']),
  format: z.enum(['Test', 'ODI', 'T20', 'First-class', 'List-A', 'T20-domestic']),
  date: z.string().min(1, 'Match date is required'),
  venue: z.string().min(1, 'Venue is required'),
  opponent: z.string().min(1, 'Opponent is required'),
  result: z.string().optional(),
  tossWinner: z.string().optional(),
  tossDecision: z.enum(['bat', 'bowl']).optional(),
  series: z.string().optional(),
  manOfTheMatch: z.string().optional(),
});

const performanceSchema = z.object({
  matchId: z.string().min(1, 'Match selection is required'),
  runs: z.number().min(0).optional(),
  ballsFaced: z.number().min(0).optional(),
  fours: z.number().min(0).optional(),
  sixes: z.number().min(0).optional(),
  dismissalType: z.string().optional(),
  dismissalBowler: z.string().optional(),
  overs: z.number().min(0).optional(),
  maidens: z.number().min(0).optional(),
  runsConceded: z.number().min(0).optional(),
  wickets: z.number().min(0).optional(),
  catches: z.number().min(0).optional(),
  stumpings: z.number().min(0).optional(),
  runOuts: z.number().min(0).optional(),
});

type PlayerFormData = z.infer<typeof playerSchema>;
type MatchFormData = z.infer<typeof matchSchema>;
type PerformanceFormData = z.infer<typeof performanceSchema>;

export default function DataEntryPage() {
  const [activeTab, setActiveTab] = useState<'player' | 'match' | 'performance'>('player');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const playerForm = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
  });

  const matchForm = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
  });

  const performanceForm = useForm<PerformanceFormData>({
    resolver: zodResolver(performanceSchema),
  });

  // Fetch matches when performance tab is selected
  React.useEffect(() => {
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
    } catch (error) {
      console.error('Error fetching matches:', error);
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
      } else {
        alert('Error adding player');
      }
    } catch (error) {
      alert('Error adding player');
    }
    setLoading(false);
  };

  const onSubmitMatch = async (data: MatchFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const newMatch = await response.json();
        setMatches(prev => [...prev, newMatch]);
        alert('Match added successfully!');
        matchForm.reset();
      } else {
        alert('Error adding match');
      }
    } catch (error) {
      alert('Error adding match');
    }
    setLoading(false);
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
    } catch (error) {
      alert('Error adding performance');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Cricket Data Entry</h1>
          <p className="text-muted-foreground">Enter player information, match details, and performance statistics</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="player">Player Info</TabsTrigger>
            <TabsTrigger value="match">Match Details</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="player">
            <Card>
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
                <CardDescription>
                  Enter the player's basic information and career details
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
                      <Select onValueChange={(value) => playerForm.setValue('role', value as any)}>
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
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Adding Player...' : 'Add Player'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="match">
            <Card>
              <CardHeader>
                <CardTitle>Match Details</CardTitle>
                <CardDescription>
                  Enter match information including venue, opponent, and match conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={matchForm.handleSubmit(onSubmitMatch)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Level *</Label>
                      <Select onValueChange={(value) => matchForm.setValue('level', value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="school">School</SelectItem>
                          <SelectItem value="domestic">Domestic</SelectItem>
                          <SelectItem value="Ranji">Ranji Trophy</SelectItem>
                          <SelectItem value="IPL">IPL</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                        </SelectContent>
                      </Select>
                      {matchForm.formState.errors.level && (
                        <p className="text-destructive text-sm">{matchForm.formState.errors.level.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Format *</Label>
                      <Select onValueChange={(value) => matchForm.setValue('format', value as any)}>
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
                      <Label htmlFor="result">Result</Label>
                      <Input
                        id="result"
                        {...matchForm.register('result')}
                        placeholder="e.g., Won by 5 wickets"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="series">Series</Label>
                      <Input
                        id="series"
                        {...matchForm.register('series')}
                        placeholder="e.g., India vs Australia Test Series 2023"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manOfTheMatch">Man of the Match</Label>
                      <Input
                        id="manOfTheMatch"
                        {...matchForm.register('manOfTheMatch')}
                        placeholder="Player name"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Adding Match...' : 'Add Match'}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
                <form onSubmit={performanceForm.handleSubmit(onSubmitPerformance)} className="space-y-6">
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

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Batting Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Bowling Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    </div>
                  </div>

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