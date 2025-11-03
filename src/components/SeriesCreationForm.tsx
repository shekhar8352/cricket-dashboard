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
import { Plus, Trash2, Calendar, MapPin, Users } from "lucide-react";

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
  })).min(1, 'At least 1 match is required')
});

const venueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  capacity: z.number().optional(),
  pitchType: z.enum(['batting', 'bowling', 'balanced']).optional(),
  floodlights: z.boolean(),
  roofed: z.boolean(),
});

type SeriesFormData = z.infer<typeof seriesSchema>;
type VenueFormData = z.infer<typeof venueSchema>;

interface Venue {
  _id: string;
  name: string;
  city: string;
  country: string;
  capacity?: number;
}

export default function SeriesCreationForm() {
  const [activeTab, setActiveTab] = useState<'series' | 'venue'>('series');
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);


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
      }]
    }
  });

  const venueForm = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      floodlights: false,
      roofed: false,
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

  // Fetch venues on component mount
  useEffect(() => {
    fetchVenues();
  }, []);

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

  const onSubmitVenue = async (data: VenueFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert('Venue created successfully!');
        venueForm.reset();
        fetchVenues(); // Refresh venues list
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error creating venue');
      }
    } catch (error) {
      console.error('Error creating venue:', error);
      alert('Error creating venue');
    }
    setLoading(false);
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
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'series' | 'venue')} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="series" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Create Series/Tournament
          </TabsTrigger>
          <TabsTrigger value="venue" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Add Venue
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
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
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

                      <div className="flex items-end">
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

        <TabsContent value="venue">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Add New Venue
              </CardTitle>
              <CardDescription>
                Add a new cricket venue with details about facilities and characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={venueForm.handleSubmit(onSubmitVenue)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="venueName">Venue Name *</Label>
                    <Input
                      id="venueName"
                      {...venueForm.register('name')}
                      placeholder="e.g., Eden Gardens"
                    />
                    {venueForm.formState.errors.name && (
                      <p className="text-destructive text-sm">{venueForm.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venueCity">City *</Label>
                    <Input
                      id="venueCity"
                      {...venueForm.register('city')}
                      placeholder="e.g., Kolkata"
                    />
                    {venueForm.formState.errors.city && (
                      <p className="text-destructive text-sm">{venueForm.formState.errors.city.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venueCountry">Country *</Label>
                    <Input
                      id="venueCountry"
                      {...venueForm.register('country')}
                      placeholder="e.g., India"
                    />
                    {venueForm.formState.errors.country && (
                      <p className="text-destructive text-sm">{venueForm.formState.errors.country.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      {...venueForm.register('capacity', { valueAsNumber: true })}
                      placeholder="e.g., 68000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Pitch Type</Label>
                    <Select onValueChange={(value) => venueForm.setValue('pitchType', value as 'batting' | 'bowling' | 'balanced')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pitch type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="batting">Batting Friendly</SelectItem>
                        <SelectItem value="bowling">Bowling Friendly</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="floodlights"
                        {...venueForm.register('floodlights')}
                        className="rounded"
                      />
                      <Label htmlFor="floodlights">Has Floodlights</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="roofed"
                        {...venueForm.register('roofed')}
                        className="rounded"
                      />
                      <Label htmlFor="roofed">Roofed Stadium</Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Adding Venue...' : 'Add Venue'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Venues List */}
          {venues.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Existing Venues</CardTitle>
                <CardDescription>
                  {venues.length} venue{venues.length !== 1 ? 's' : ''} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {venues.map((venue) => (
                    <div key={venue._id} className="p-4 border rounded-lg">
                      <h4 className="font-medium">{venue.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {venue.city}, {venue.country}
                      </p>
                      {venue.capacity && (
                        <p className="text-sm text-muted-foreground">
                          Capacity: {venue.capacity.toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}