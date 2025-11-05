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
import { indianTournamentPresets, getTournamentPreset, getVenuesForFormat } from "@/data/tournamentPresets";

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
  const [teamSuggestions, setTeamSuggestions] = useState<string[]>([]);
  const [updatingTeam, setUpdatingTeam] = useState(false);
  const [availableVenues, setAvailableVenues] = useState<string[]>([]);


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
    // Validate team names for duplicates
    if (!validateTeamNames()) {
      return;
    }

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
        setSelectedPreset('');

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
    if (preset.hostCountry) {
      seriesForm.setValue('hostCountry', preset.hostCountry);
    }

    // Update team suggestions based on preset level
    const suggestions = getTeamSuggestions(preset.level, preset.format);
    setTeamSuggestions(suggestions);

    // Update available venues based on host country and format
    if (preset.hostCountry) {
      const countryVenues = getVenuesForFormat(preset.hostCountry, preset.format);
      setAvailableVenues(countryVenues);
    } else {
      // Use preset venues if available
      if (preset.venues && preset.venues.length > 0) {
        setAvailableVenues(preset.venues);
      }
    }

    // Apply teams - limit to reasonable number for form
    const maxTeams = preset.type === 'league' ? Math.min(preset.teams.length, 10) : preset.teams.length;
    const teams = preset.teams.slice(0, maxTeams).map((teamName, index) => ({
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

      // Update player's team in database
      updatePlayerTeam(playerTeam, preset.level);
    }

    // Clear existing matches - don't auto-generate, let user click generate button
    seriesForm.setValue('matches', [{
      date: '',
      venue: '',
      opponent: '',
      matchNumber: 1,
      format: preset.format === 'mixed' ? 'ODI' : preset.format as any,
      level: preset.level,
      city: '',
      country: preset.hostCountry || ''
    }]);

    setSelectedPreset(presetId);

    // Show message about generating matches
    if (preset.type === 'league') {
      alert(`${preset.name} preset applied! Click "Generate League Matches" to create randomized league fixtures.`);
    } else {
      alert(`${preset.name} preset applied! Click "Generate Matches" to create the match schedule.`);
    }
  };

  const toggleDidNotPlay = (matchIndex: number) => {
    setShowDidNotPlay(prev => ({
      ...prev,
      [matchIndex]: !prev[matchIndex]
    }));
  };

  const updatePlayerTeam = async (teamName: string, teamLevel: string, startDate?: string) => {
    if (!teamName || !currentPlayer) return;

    setUpdatingTeam(true);
    try {
      const response = await fetch('/api/players/update-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamName,
          teamLevel,
          startDate: startDate || seriesForm.getValues('startDate')
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Player team updated successfully:', data.message);
        // Refresh current player data
        fetchCurrentPlayer();
      } else {
        console.error('Failed to update player team:', data.error);
        alert(data.error || 'Failed to update player team');
      }
    } catch (error) {
      console.error('Error updating player team:', error);
      alert('Error updating player team');
    }
    setUpdatingTeam(false);
  };

  const clearAllTeams = async () => {
    if (!currentPlayer) return;

    if (!confirm('Are you sure you want to clear all team enrollments? This action cannot be undone.')) {
      return;
    }

    setUpdatingTeam(true);
    try {
      const response = await fetch('/api/players/clear-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      if (data.success) {
        alert('All teams cleared successfully!');
        // Refresh current player data
        fetchCurrentPlayer();
        // Clear the player team in the form
        seriesForm.setValue('playerTeam', '');
      } else {
        alert(data.error || 'Failed to clear teams');
      }
    } catch (error) {
      console.error('Error clearing teams:', error);
      alert('Error clearing teams');
    }
    setUpdatingTeam(false);
  };

  const getTeamSuggestions = (level: string, format: string) => {
    const suggestions: string[] = [];

    switch (level) {
      case 'international':
        suggestions.push('India', 'Australia', 'England', 'South Africa', 'New Zealand', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'West Indies', 'Afghanistan');
        break;
      case 'IPL':
        suggestions.push('Mumbai Indians', 'Chennai Super Kings', 'Royal Challengers Bangalore', 'Kolkata Knight Riders', 'Delhi Capitals', 'Rajasthan Royals', 'Punjab Kings', 'Sunrisers Hyderabad', 'Gujarat Titans', 'Lucknow Super Giants');
        break;
      case 'Ranji':
      case 'domestic':
        suggestions.push('Mumbai', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Bengal', 'Odisha', 'Kerala', 'Andhra Pradesh', 'Telangana', 'Services', 'Railways');
        break;
      case 'List-A':
        suggestions.push('Mumbai', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Maharashtra', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Bengal', 'Odisha', 'Kerala', 'Andhra Pradesh', 'Telangana');
        break;
      case 'under19-international':
        suggestions.push('India U19', 'Australia U19', 'England U19', 'South Africa U19', 'Pakistan U19', 'Sri Lanka U19', 'Bangladesh U19', 'West Indies U19');
        break;
      default:
        suggestions.push('India', 'Mumbai', 'Delhi', 'Karnataka', 'Chennai Super Kings', 'Mumbai Indians');
    }

    return suggestions;
  };

  // Update team suggestions when level changes
  const handleLevelChange = (level: string) => {
    seriesForm.setValue('level', level as 'under19-international' | 'domestic' | 'Ranji' | 'IPL' | 'List-A' | 'international');
    const format = seriesForm.getValues('format') || 'ODI';
    const suggestions = getTeamSuggestions(level, format);
    setTeamSuggestions(suggestions);
  };

  const handlePlayerTeamChange = (teamName: string) => {
    seriesForm.setValue('playerTeam', teamName);
    const level = seriesForm.getValues('level');
    if (level && teamName) {
      updatePlayerTeam(teamName, level);
    }
  };

  const handleHostCountryChange = (country: string) => {
    seriesForm.setValue('hostCountry', country);

    // Update available venues based on host country and format
    const format = seriesForm.getValues('format') || 'ODI';
    const countryVenues = getVenuesForFormat(country, format);
    setAvailableVenues(countryVenues);

    // Clear existing venue selections in matches since country changed
    const currentMatches = seriesForm.getValues('matches') || [];
    const updatedMatches = currentMatches.map(match => ({
      ...match,
      venue: '',
      city: '',
      country: country
    }));
    seriesForm.setValue('matches', updatedMatches);
  };

  const handleFormatChange = (format: string) => {
    seriesForm.setValue('format', format as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic' | 'mixed');

    // Update venues based on new format and current host country
    const hostCountry = seriesForm.getValues('hostCountry');
    if (hostCountry) {
      const formatVenues = getVenuesForFormat(hostCountry, format);
      setAvailableVenues(formatVenues);
    }
  };

  const addTeam = () => {
    appendTeam({ name: '', isHome: false });
  };

  const validateTeamNames = () => {
    const teams = seriesForm.getValues('teams');
    const teamNames = teams.map(t => t.name.trim().toLowerCase()).filter(name => name);
    const uniqueNames = new Set(teamNames);

    if (teamNames.length !== uniqueNames.size) {
      alert('Duplicate team names are not allowed. Please ensure all team names are unique.');
      return false;
    }
    return true;
  };

  const addMatch = () => {
    const matchNumber = matchFields.length + 1;
    const currentFormat = seriesForm.getValues('format');
    const matchFormat = currentFormat === 'mixed' ? 'ODI' : currentFormat;
    const hostCountry = seriesForm.getValues('hostCountry') || '';

    appendMatch({
      date: '',
      venue: '',
      opponent: '',
      matchNumber,
      format: matchFormat as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
      level: seriesForm.getValues('level'),
      city: '',
      country: hostCountry
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

    // Shuffle function for randomness
    const shuffleArray = (array: string[]): string[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Shuffle function for matchups
    const shuffleMatchups = (array: { team1: string; team2: string }[]): { team1: string; team2: string }[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    if (seriesType === 'bilateral' && homeTeamObj && awayTeams.length === 1) {
      // Generate bilateral series matches
      const opponent = awayTeams[0].name;
      const matchCount = format === 'Test' ? 3 : format === 'ODI' ? 5 : 3; // Default match counts

      // Shuffle venues for randomness
      const shuffledVenues = shuffleArray(availableVenues);

      for (let i = 1; i <= matchCount; i++) {
        const matchFormat = format === 'mixed' ? (i % 2 === 1 ? 'ODI' : 'T20') : format;
        // Assign venue from shuffled venues (rotate through them)
        const venueIndex = (i - 1) % shuffledVenues.length;
        const assignedVenue = shuffledVenues.length > 0 ? shuffledVenues[venueIndex] : '';
        const venue = venues.find(v => v.name === assignedVenue);

        matches.push({
          date: '',
          venue: assignedVenue,
          opponent,
          matchNumber: i,
          format: matchFormat as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
          level,
          city: venue?.city || '',
          country: venue?.country || seriesForm.getValues('hostCountry') || ''
        });
      }
    } else if (seriesType === 'triangular' && teams.length === 3) {
      // Generate triangular series matches (round robin + final)
      const teamNames = teams.map(t => t.name);
      let matchNumber = 1;

      // Shuffle venues for randomness
      const shuffledVenues = shuffleArray(availableVenues);

      // Round robin matches
      for (let i = 0; i < teamNames.length; i++) {
        for (let j = i + 1; j < teamNames.length; j++) {
          const matchFormat = format === 'mixed' ? 'ODI' : format;
          // Assign venue from shuffled venues
          const venueIndex = (matchNumber - 1) % shuffledVenues.length;
          const assignedVenue = shuffledVenues.length > 0 ? shuffledVenues[venueIndex] : '';
          const venue = venues.find(v => v.name === assignedVenue);

          matches.push({
            date: '',
            venue: assignedVenue,
            opponent: teamNames[j],
            matchNumber: matchNumber++,
            format: matchFormat as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
            level,
            city: venue?.city || '',
            country: venue?.country || seriesForm.getValues('hostCountry') || ''
          });
        }
      }

      // Final match
      const finalFormat = format === 'mixed' ? 'ODI' : format;
      const finalVenueIndex = (matchNumber - 1) % shuffledVenues.length;
      const finalVenue = shuffledVenues.length > 0 ? shuffledVenues[finalVenueIndex] : '';
      const finalVenueObj = venues.find(v => v.name === finalVenue);

      matches.push({
        date: '',
        venue: finalVenue,
        opponent: 'TBD',
        matchNumber: matchNumber,
        format: finalFormat as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
        level,
        city: finalVenueObj?.city || '',
        country: finalVenueObj?.country || seriesForm.getValues('hostCountry') || '',
        matchType: 'final'
      });
    } else if (seriesType === 'league' && teams.length >= 4) {
      // Generate league matches with randomness - only for league type
      const teamNames = teams.map(t => t.name);
      const playerTeam = seriesForm.getValues('playerTeam');
      let matchNumber = 1;

      // Shuffle venues for randomness
      const shuffledVenues = shuffleArray(availableVenues);

      // Generate round-robin matches with randomness
      const allMatchups: { team1: string; team2: string }[] = [];

      // Create all possible matchups
      for (let i = 0; i < teamNames.length; i++) {
        for (let j = i + 1; j < teamNames.length; j++) {
          allMatchups.push({ team1: teamNames[i], team2: teamNames[j] });
        }
      }

      // Shuffle matchups for random order
      const shuffledMatchups = shuffleMatchups(allMatchups);

      // Generate matches from shuffled matchups
      shuffledMatchups.forEach((matchup) => {
        const matchFormat = format === 'mixed' ? (Math.random() > 0.5 ? 'ODI' : 'T20') : format;
        const venueIndex = (matchNumber - 1) % shuffledVenues.length;
        const assignedVenue = shuffledVenues.length > 0 ? shuffledVenues[venueIndex] : '';
        const venue = venues.find(v => v.name === assignedVenue);

        // Determine opponent based on player's team
        const opponent = matchup.team1 === playerTeam ? matchup.team2 : matchup.team1;

        // Only add matches where player's team is involved
        if (matchup.team1 === playerTeam || matchup.team2 === playerTeam) {
          matches.push({
            date: '',
            venue: assignedVenue,
            opponent,
            matchNumber: matchNumber++,
            format: matchFormat as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
            level,
            city: venue?.city || '',
            country: venue?.country || seriesForm.getValues('hostCountry') || '',
            importance: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
          });
        }
      });

      // Add playoff matches if it's a league
      if (matches.length > 0) {
        const playoffVenueIndex = matchNumber % shuffledVenues.length;
        const playoffVenue = shuffledVenues.length > 0 ? shuffledVenues[playoffVenueIndex] : '';
        const playoffVenueObj = venues.find(v => v.name === playoffVenue);

        matches.push({
          date: '',
          venue: playoffVenue,
          opponent: 'TBD (Playoff)',
          matchNumber: matchNumber,
          format: format === 'mixed' ? 'T20' : format as 'Test' | 'ODI' | 'T20' | 'First-class' | 'List-A' | 'T20-domestic',
          level,
          city: playoffVenueObj?.city || '',
          country: playoffVenueObj?.country || seriesForm.getValues('hostCountry') || '',
          matchType: 'knockout',
          importance: 'high'
        });
      }
    }

    if (matches.length === 0) {
      alert('Unable to generate matches. Please check your tournament configuration.');
      return;
    }

    // Clear existing matches and add generated ones
    seriesForm.setValue('matches', matches);
    alert(`Generated ${matches.length} matches successfully!`);
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
                      <Select onValueChange={handleFormatChange}>
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
                      <Select onValueChange={handleLevelChange}>
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
                      <Label>Host Country *</Label>
                      <Select onValueChange={handleHostCountryChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select host country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                          <SelectItem value="England">England</SelectItem>
                          <SelectItem value="South Africa">South Africa</SelectItem>
                          <SelectItem value="New Zealand">New Zealand</SelectItem>
                          <SelectItem value="Pakistan">Pakistan</SelectItem>
                          <SelectItem value="Sri Lanka">Sri Lanka</SelectItem>
                          <SelectItem value="Bangladesh">Bangladesh</SelectItem>
                          <SelectItem value="West Indies">West Indies</SelectItem>
                          <SelectItem value="Afghanistan">Afghanistan</SelectItem>
                          <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                          <SelectItem value="UAE">UAE</SelectItem>
                          <SelectItem value="Ireland">Ireland</SelectItem>
                          <SelectItem value="Scotland">Scotland</SelectItem>
                          <SelectItem value="Netherlands">Netherlands</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-muted-foreground">
                        Note: Selecting a new team will clear all previous team enrollments to prevent duplicates.
                      </div>
                      <Button
                        type="button"
                        onClick={clearAllTeams}
                        variant="outline"
                        size="sm"
                        disabled={updatingTeam}
                      >
                        Clear All Teams
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Playing For Team *</Label>
                        <Select onValueChange={handlePlayerTeamChange} disabled={updatingTeam}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team (choose level first)" />
                          </SelectTrigger>
                          <SelectContent>
                            {teamSuggestions.length > 0 ? (
                              teamSuggestions.map((team) => (
                                <SelectItem key={team} value={team}>
                                  {team}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="custom" disabled>
                                Select level first to see team options
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {updatingTeam && (
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                            Updating player team...
                          </p>
                        )}
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
                      {seriesForm.watch('type') === 'league' && (
                        <Button type="button" onClick={generateMatches} variant="outline" size="sm">
                          Generate League Matches
                        </Button>
                      )}
                      {(seriesForm.watch('type') === 'bilateral' || seriesForm.watch('type') === 'triangular') && (
                        <Button type="button" onClick={generateMatches} variant="outline" size="sm">
                          Generate Matches
                        </Button>
                      )}
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
                              <SelectValue placeholder={availableVenues.length > 0 ? "Select venue" : "Select host country first"} />
                            </SelectTrigger>
                            <SelectContent>
                              {availableVenues.length > 0 ? (
                                availableVenues.map((venueName) => {
                                  const venue = venues.find(v => v.name === venueName);
                                  return venue ? (
                                    <SelectItem key={venue._id} value={venue.name}>
                                      {venue.name}, {venue.city}
                                    </SelectItem>
                                  ) : null;
                                })
                              ) : (
                                <SelectItem value="no-venues" disabled>
                                  Select host country and format first
                                </SelectItem>
                              )}
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
                    Load world-famous cricket venues including Lord&apos;s, MCG, Eden Gardens, and many more
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