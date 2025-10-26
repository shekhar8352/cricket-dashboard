'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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
  // Batting
  runs: z.number().min(0).optional(),
  ballsFaced: z.number().min(0).optional(),
  fours: z.number().min(0).optional(),
  sixes: z.number().min(0).optional(),
  dismissalType: z.string().optional(),
  dismissalBowler: z.string().optional(),
  dismissalFielder: z.string().optional(),
  // Bowling
  overs: z.number().min(0).optional(),
  maidens: z.number().min(0).optional(),
  runsConceded: z.number().min(0).optional(),
  wickets: z.number().min(0).optional(),
  // Fielding
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

  // Fetch matches when performance tab is selected
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

  // Fetch matches when component mounts or when switching to performance tab
  React.useEffect(() => {
    if (activeTab === 'performance') {
      fetchMatches();
    }
  }, [activeTab]);

  const matchForm = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
  });

  const performanceForm = useForm<PerformanceFormData>({
    resolver: zodResolver(performanceSchema),
  });

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cricket Data Entry</h1>
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg mb-8">
          {[
            { key: 'player', label: 'Player Info' },
            { key: 'match', label: 'Match Details' },
            { key: 'performance', label: 'Performance' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Player Form */}
        {activeTab === 'player' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Player Information</h2>
            <form onSubmit={playerForm.handleSubmit(onSubmitPlayer)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    {...playerForm.register('fullName')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter full name"
                  />
                  {playerForm.formState.errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{playerForm.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    {...playerForm.register('dob')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {playerForm.formState.errors.dob && (
                    <p className="text-red-500 text-sm mt-1">{playerForm.formState.errors.dob.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    {...playerForm.register('country')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., India, Australia"
                  />
                  {playerForm.formState.errors.country && (
                    <p className="text-red-500 text-sm mt-1">{playerForm.formState.errors.country.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    {...playerForm.register('role')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select role</option>
                    <option value="batsman">Batsman</option>
                    <option value="bowler">Bowler</option>
                    <option value="allrounder">All-rounder</option>
                    <option value="wicketkeeper">Wicket-keeper</option>
                  </select>
                  {playerForm.formState.errors.role && (
                    <p className="text-red-500 text-sm mt-1">{playerForm.formState.errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batting Style *
                  </label>
                  <input
                    {...playerForm.register('battingStyle')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Right-handed, Left-handed"
                  />
                  {playerForm.formState.errors.battingStyle && (
                    <p className="text-red-500 text-sm mt-1">{playerForm.formState.errors.battingStyle.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bowling Style
                  </label>
                  <input
                    {...playerForm.register('bowlingStyle')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Right-arm fast, Left-arm spin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Career Start *
                  </label>
                  <input
                    type="date"
                    {...playerForm.register('careerStart')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {playerForm.formState.errors.careerStart && (
                    <p className="text-red-500 text-sm mt-1">{playerForm.formState.errors.careerStart.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Career End
                  </label>
                  <input
                    type="date"
                    {...playerForm.register('careerEnd')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Adding Player...' : 'Add Player'}
              </button>
            </form>
          </div>
        )}

        {/* Match Form */}
        {activeTab === 'match' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Match Details</h2>
            <form onSubmit={matchForm.handleSubmit(onSubmitMatch)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    {...matchForm.register('level')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select level</option>
                    <option value="school">School</option>
                    <option value="domestic">Domestic</option>
                    <option value="Ranji">Ranji Trophy</option>
                    <option value="IPL">IPL</option>
                    <option value="international">International</option>
                  </select>
                  {matchForm.formState.errors.level && (
                    <p className="text-red-500 text-sm mt-1">{matchForm.formState.errors.level.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format *
                  </label>
                  <select
                    {...matchForm.register('format')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select format</option>
                    <option value="Test">Test</option>
                    <option value="ODI">ODI</option>
                    <option value="T20">T20</option>
                    <option value="First-class">First-class</option>
                    <option value="List-A">List-A</option>
                    <option value="T20-domestic">T20 Domestic</option>
                  </select>
                  {matchForm.formState.errors.format && (
                    <p className="text-red-500 text-sm mt-1">{matchForm.formState.errors.format.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Match Date *
                  </label>
                  <input
                    type="date"
                    {...matchForm.register('date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {matchForm.formState.errors.date && (
                    <p className="text-red-500 text-sm mt-1">{matchForm.formState.errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Venue *
                  </label>
                  <input
                    {...matchForm.register('venue')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Eden Gardens, Kolkata"
                  />
                  {matchForm.formState.errors.venue && (
                    <p className="text-red-500 text-sm mt-1">{matchForm.formState.errors.venue.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opponent *
                  </label>
                  <input
                    {...matchForm.register('opponent')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Australia, Mumbai Indians"
                  />
                  {matchForm.formState.errors.opponent && (
                    <p className="text-red-500 text-sm mt-1">{matchForm.formState.errors.opponent.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Result
                  </label>
                  <input
                    {...matchForm.register('result')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Won by 5 wickets, Lost by 20 runs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Toss Winner
                  </label>
                  <input
                    {...matchForm.register('tossWinner')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Team that won the toss"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Toss Decision
                  </label>
                  <select
                    {...matchForm.register('tossDecision')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select decision</option>
                    <option value="bat">Bat first</option>
                    <option value="bowl">Bowl first</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Series
                  </label>
                  <input
                    {...matchForm.register('series')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., India vs Australia Test Series 2023"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Man of the Match
                  </label>
                  <input
                    {...matchForm.register('manOfTheMatch')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Player name"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Adding Match...' : 'Add Match'}
              </button>
            </form>
          </div>
        )}

        {/* Performance Form */}
        {activeTab === 'performance' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Performance Data</h2>
            <form onSubmit={performanceForm.handleSubmit(onSubmitPerformance)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Match *
                </label>
                <select
                  {...performanceForm.register('matchId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a match</option>
                  {matches.map((match) => (
                    <option key={match._id} value={match._id}>
                      {match.opponent} - {match.format} - {new Date(match.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {performanceForm.formState.errors.matchId && (
                  <p className="text-red-500 text-sm mt-1">{performanceForm.formState.errors.matchId.message}</p>
                )}
              </div>

              {/* Batting Performance */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Batting Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Runs</label>
                    <input
                      type="number"
                      {...performanceForm.register('runs', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Balls Faced</label>
                    <input
                      type="number"
                      {...performanceForm.register('ballsFaced', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fours</label>
                    <input
                      type="number"
                      {...performanceForm.register('fours', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sixes</label>
                    <input
                      type="number"
                      {...performanceForm.register('sixes', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dismissal Type</label>
                    <input
                      {...performanceForm.register('dismissalType')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., caught, bowled, lbw"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dismissal Bowler</label>
                    <input
                      {...performanceForm.register('dismissalBowler')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bowler name"
                    />
                  </div>
                </div>
              </div>

              {/* Bowling Performance */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Bowling Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Overs</label>
                    <input
                      type="number"
                      step="0.1"
                      {...performanceForm.register('overs', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maidens</label>
                    <input
                      type="number"
                      {...performanceForm.register('maidens', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Runs Conceded</label>
                    <input
                      type="number"
                      {...performanceForm.register('runsConceded', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wickets</label>
                    <input
                      type="number"
                      {...performanceForm.register('wickets', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Fielding Performance */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Fielding Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catches</label>
                    <input
                      type="number"
                      {...performanceForm.register('catches', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stumpings</label>
                    <input
                      type="number"
                      {...performanceForm.register('stumpings', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Run Outs</label>
                    <input
                      type="number"
                      {...performanceForm.register('runOuts', { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Adding Performance...' : 'Add Performance'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}