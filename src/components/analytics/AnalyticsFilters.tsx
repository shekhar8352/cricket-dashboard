'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';

export interface AnalyticsFilters {
  // Time filters
  dateRange: {
    start?: string;
    end?: string;
  };
  
  // Cricket level filters
  levels: string[];
  formats: string[];
  
  // Match context filters
  homeAway: string[];
  matchTypes: string[];
  importance: string[];
  weather: string[];
  pitchConditions: string[];
  pitchTypes: string[];
  
  // Performance filters
  battingPositions: number[];
  bowlingPositions: string[];
  innings: number[];
  
  // Opposition filters
  opponents: string[];
  venues: string[];
  countries: string[];
  
  // Series/Tournament filters
  series: string[];
  tournaments: string[];
  seriesTypes: string[];
  
  // Statistical filters
  minRuns?: number;
  maxRuns?: number;
  minWickets?: number;
  maxWickets?: number;
  minStrikeRate?: number;
  maxStrikeRate?: number;
  minEconomy?: number;
  maxEconomy?: number;
  
  // Special filters
  isChasing?: boolean;
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
  dayNight?: boolean;
  
  // Result filters
  results: string[];
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  availableOptions?: {
    opponents?: string[];
    venues?: string[];
    countries?: string[];
    series?: string[];
    tournaments?: string[];
  };
}

export default function AnalyticsFiltersComponent({ 
  filters, 
  onFiltersChange, 
  availableOptions = {} 
}: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (key: keyof AnalyticsFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleArrayFilter = (key: keyof AnalyticsFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const toggleNumberArrayFilter = (key: keyof AnalyticsFilters, value: number) => {
    const currentArray = (filters[key] as number[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilters(key, newArray);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: {},
      levels: [],
      formats: [],
      homeAway: [],
      matchTypes: [],
      importance: [],
      weather: [],
      pitchConditions: [],
      pitchTypes: [],
      battingPositions: [],
      bowlingPositions: [],
      innings: [],
      opponents: [],
      venues: [],
      countries: [],
      series: [],
      tournaments: [],
      seriesTypes: [],
      results: [],
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    count += filters.levels.length;
    count += filters.formats.length;
    count += filters.homeAway.length;
    count += filters.matchTypes.length;
    count += filters.importance.length;
    count += filters.weather.length;
    count += filters.pitchConditions.length;
    count += filters.pitchTypes.length;
    count += filters.battingPositions.length;
    count += filters.bowlingPositions.length;
    count += filters.innings.length;
    count += filters.opponents.length;
    count += filters.venues.length;
    count += filters.countries.length;
    count += filters.series.length;
    count += filters.tournaments.length;
    count += filters.seriesTypes.length;
    count += filters.results.length;
    if (filters.minRuns !== undefined) count++;
    if (filters.maxRuns !== undefined) count++;
    if (filters.minWickets !== undefined) count++;
    if (filters.maxWickets !== undefined) count++;
    if (filters.minStrikeRate !== undefined) count++;
    if (filters.maxStrikeRate !== undefined) count++;
    if (filters.minEconomy !== undefined) count++;
    if (filters.maxEconomy !== undefined) count++;
    if (filters.isChasing !== undefined) count++;
    if (filters.isCaptain !== undefined) count++;
    if (filters.isWicketKeeper !== undefined) count++;
    if (filters.dayNight !== undefined) count++;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analytics Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">{getActiveFiltersCount()} active</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              disabled={getActiveFiltersCount() === 0}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <div className="flex gap-2">
              <Input
                type="date"
                value={filters.dateRange.start || ''}
                onChange={(e) => updateFilters('dateRange', { ...filters.dateRange, start: e.target.value })}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={filters.dateRange.end || ''}
                onChange={(e) => updateFilters('dateRange', { ...filters.dateRange, end: e.target.value })}
                placeholder="End date"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cricket Level</Label>
            <div className="flex flex-wrap gap-1">
              {['under19-international', 'domestic', 'Ranji', 'IPL', 'List-A', 'international'].map((level) => (
                <Badge
                  key={level}
                  variant={filters.levels.includes(level) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleArrayFilter('levels', level)}
                >
                  {level === 'under19-international' ? 'U19 Intl' : level}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <div className="flex flex-wrap gap-1">
              {['Test', 'ODI', 'T20', 'First-class', 'List-A', 'T20-domestic'].map((format) => (
                <Badge
                  key={format}
                  variant={filters.formats.includes(format) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleArrayFilter('formats', format)}
                >
                  {format}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Home/Away</Label>
            <div className="flex flex-wrap gap-1">
              {['home', 'away', 'neutral'].map((ha) => (
                <Badge
                  key={ha}
                  variant={filters.homeAway.includes(ha) ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleArrayFilter('homeAway', ha)}
                >
                  {ha.charAt(0).toUpperCase() + ha.slice(1)}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 border-t pt-6">
            {/* Match Context Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Match Context</h4>
                
                <div className="space-y-2">
                  <Label>Match Type</Label>
                  <div className="flex flex-wrap gap-1">
                    {['debut', 'milestone', 'final', 'knockout', 'regular'].map((type) => (
                      <Badge
                        key={type}
                        variant={filters.matchTypes.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('matchTypes', type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Importance</Label>
                  <div className="flex flex-wrap gap-1">
                    {['high', 'medium', 'low'].map((imp) => (
                      <Badge
                        key={imp}
                        variant={filters.importance.includes(imp) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('importance', imp)}
                      >
                        {imp.charAt(0).toUpperCase() + imp.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Innings</Label>
                  <div className="flex gap-1">
                    {[1, 2].map((inning) => (
                      <Badge
                        key={inning}
                        variant={filters.innings.includes(inning) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleNumberArrayFilter('innings', inning)}
                      >
                        {inning === 1 ? '1st Innings' : '2nd Innings'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Conditions</h4>
                
                <div className="space-y-2">
                  <Label>Weather</Label>
                  <div className="flex flex-wrap gap-1">
                    {['sunny', 'cloudy', 'overcast', 'drizzle', 'rain'].map((weather) => (
                      <Badge
                        key={weather}
                        variant={filters.weather.includes(weather) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('weather', weather)}
                      >
                        {weather.charAt(0).toUpperCase() + weather.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pitch Condition</Label>
                  <div className="flex flex-wrap gap-1">
                    {['green', 'dry', 'dusty', 'flat', 'two-paced'].map((condition) => (
                      <Badge
                        key={condition}
                        variant={filters.pitchConditions.includes(condition) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('pitchConditions', condition)}
                      >
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Pitch Type</Label>
                  <div className="flex flex-wrap gap-1">
                    {['batting', 'bowling', 'balanced'].map((type) => (
                      <Badge
                        key={type}
                        variant={filters.pitchTypes.includes(type) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('pitchTypes', type)}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Player Role</h4>
                
                <div className="space-y-2">
                  <Label>Batting Position</Label>
                  <div className="flex flex-wrap gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((pos) => (
                      <Badge
                        key={pos}
                        variant={filters.battingPositions.includes(pos) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleNumberArrayFilter('battingPositions', pos)}
                      >
                        {pos}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Bowling Position</Label>
                  <div className="flex flex-wrap gap-1">
                    {['opening', 'middle', 'death'].map((pos) => (
                      <Badge
                        key={pos}
                        variant={filters.bowlingPositions.includes(pos) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleArrayFilter('bowlingPositions', pos)}
                      >
                        {pos.charAt(0).toUpperCase() + pos.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Roles</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isCaptain"
                        checked={filters.isCaptain === true}
                        onCheckedChange={(checked) => 
                          updateFilters('isCaptain', checked ? true : undefined)
                        }
                      />
                      <Label htmlFor="isCaptain" className="text-sm">Captain</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isWicketKeeper"
                        checked={filters.isWicketKeeper === true}
                        onCheckedChange={(checked) => 
                          updateFilters('isWicketKeeper', checked ? true : undefined)
                        }
                      />
                      <Label htmlFor="isWicketKeeper" className="text-sm">Wicket Keeper</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isChasing"
                        checked={filters.isChasing === true}
                        onCheckedChange={(checked) => 
                          updateFilters('isChasing', checked ? true : undefined)
                        }
                      />
                      <Label htmlFor="isChasing" className="text-sm">Chasing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dayNight"
                        checked={filters.dayNight === true}
                        onCheckedChange={(checked) => 
                          updateFilters('dayNight', checked ? true : undefined)
                        }
                      />
                      <Label htmlFor="dayNight" className="text-sm">Day-Night Match</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistical Filters */}
            <div className="border-t pt-6">
              <h4 className="font-medium mb-4">Statistical Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Runs Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minRuns || ''}
                      onChange={(e) => updateFilters('minRuns', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxRuns || ''}
                      onChange={(e) => updateFilters('maxRuns', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Wickets Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minWickets || ''}
                      onChange={(e) => updateFilters('minWickets', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxWickets || ''}
                      onChange={(e) => updateFilters('maxWickets', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Strike Rate Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Min"
                      value={filters.minStrikeRate || ''}
                      onChange={(e) => updateFilters('minStrikeRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Max"
                      value={filters.maxStrikeRate || ''}
                      onChange={(e) => updateFilters('maxStrikeRate', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Economy Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Min"
                      value={filters.minEconomy || ''}
                      onChange={(e) => updateFilters('minEconomy', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="Max"
                      value={filters.maxEconomy || ''}
                      onChange={(e) => updateFilters('maxEconomy', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Opposition & Venue Filters */}
            {(availableOptions.opponents || availableOptions.venues || availableOptions.countries) && (
              <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Opposition & Venues</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {availableOptions.opponents && (
                    <div className="space-y-2">
                      <Label>Opponents</Label>
                      <Select onValueChange={(value) => toggleArrayFilter('opponents', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select opponents" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOptions.opponents.map((opponent) => (
                            <SelectItem key={opponent} value={opponent}>
                              {opponent}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {filters.opponents.map((opponent) => (
                          <Badge key={opponent} variant="default" className="text-xs">
                            {opponent}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => toggleArrayFilter('opponents', opponent)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableOptions.venues && (
                    <div className="space-y-2">
                      <Label>Venues</Label>
                      <Select onValueChange={(value) => toggleArrayFilter('venues', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venues" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOptions.venues.map((venue) => (
                            <SelectItem key={venue} value={venue}>
                              {venue}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {filters.venues.map((venue) => (
                          <Badge key={venue} variant="default" className="text-xs">
                            {venue}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => toggleArrayFilter('venues', venue)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {availableOptions.countries && (
                    <div className="space-y-2">
                      <Label>Countries</Label>
                      <Select onValueChange={(value) => toggleArrayFilter('countries', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select countries" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOptions.countries.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {filters.countries.map((country) => (
                          <Badge key={country} variant="default" className="text-xs">
                            {country}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer" 
                              onClick={() => toggleArrayFilter('countries', country)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}