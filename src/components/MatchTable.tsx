'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Match {
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
}

interface MatchTableProps {
    onEditMatch?: (match: Match) => void;
    onDeleteMatch?: (matchId: string) => void;
    refreshTrigger?: number;
    onRefresh?: () => void;
}

export default function MatchTable({ onEditMatch, onDeleteMatch, refreshTrigger, onRefresh }: MatchTableProps) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [filterFormat, setFilterFormat] = useState<string>('all');
    const [showDetails, setShowDetails] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    useEffect(() => {
        fetchMatches();
    }, [refreshTrigger]);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/matches');
            const data = await response.json();
            if (data.success) {
                setMatches(data.matches);
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
        setLoading(false);
    };

    // Filter matches based on search term and filters
    const filteredMatches = matches.filter(match => {
        const matchesSearch =
            match.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.manOfTheMatch?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLevel = filterLevel === 'all' || match.level === filterLevel;
        const matchesFormat = filterFormat === 'all' || match.format === filterFormat;

        return matchesSearch && matchesLevel && matchesFormat;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredMatches.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMatches = filteredMatches.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setCurrentPage(1); // Reset to first page
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getLevelBadgeColor = (level: string) => {
        const colors = {
            'school': 'bg-blue-100 text-blue-800',
            'domestic': 'bg-green-100 text-green-800',
            'Ranji': 'bg-purple-100 text-purple-800',
            'IPL': 'bg-orange-100 text-orange-800',
            'international': 'bg-red-100 text-red-800'
        };
        return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getFormatBadgeColor = (format: string) => {
        const colors = {
            'Test': 'bg-red-100 text-red-800',
            'ODI': 'bg-blue-100 text-blue-800',
            'T20': 'bg-green-100 text-green-800',
            'First-class': 'bg-purple-100 text-purple-800',
            'List-A': 'bg-yellow-100 text-yellow-800',
            'T20-domestic': 'bg-pink-100 text-pink-800'
        };
        return colors[format as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading matches...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Match Data</CardTitle>
                <CardDescription>
                    View and manage all match records with pagination and filtering
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Search by opponent, venue, series, or man of the match..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Reset to first page on search
                            }}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            {showDetails ? 'Hide Details' : 'Show Details'}
                        </Button>
                        {onRefresh && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRefresh}
                                disabled={loading}
                            >
                                Refresh
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
                        >
                            {viewMode === 'table' ? 'Card View' : 'Table View'}
                        </Button>
                        <Select value={filterLevel} onValueChange={(value) => {
                            setFilterLevel(value);
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="school">School</SelectItem>
                                <SelectItem value="domestic">Domestic</SelectItem>
                                <SelectItem value="Ranji">Ranji</SelectItem>
                                <SelectItem value="IPL">IPL</SelectItem>
                                <SelectItem value="international">International</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={filterFormat} onValueChange={(value) => {
                            setFilterFormat(value);
                            setCurrentPage(1);
                        }}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Formats</SelectItem>
                                <SelectItem value="Test">Test</SelectItem>
                                <SelectItem value="ODI">ODI</SelectItem>
                                <SelectItem value="T20">T20</SelectItem>
                                <SelectItem value="First-class">First-class</SelectItem>
                                <SelectItem value="List-A">List-A</SelectItem>
                                <SelectItem value="T20-domestic">T20 Domestic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Results count */}
                <div className="mb-4 text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredMatches.length)} of {filteredMatches.length} matches
                </div>

                {/* Table or Card View */}
                {viewMode === 'table' ? (
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full border-collapse min-w-[800px]">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="text-left p-3 font-medium whitespace-nowrap">Date</th>
                                    <th className="text-left p-3 font-medium whitespace-nowrap">Level</th>
                                    <th className="text-left p-3 font-medium whitespace-nowrap">Format</th>
                                    <th className="text-left p-3 font-medium whitespace-nowrap">Opponent</th>
                                    <th className="text-left p-3 font-medium whitespace-nowrap">Venue</th>
                                    <th className="text-left p-3 font-medium whitespace-nowrap">Result</th>
                                    {showDetails && <th className="text-left p-3 font-medium whitespace-nowrap">Toss</th>}
                                    {showDetails && <th className="text-left p-3 font-medium whitespace-nowrap">Man of Match</th>}
                                    <th className="text-left p-3 font-medium whitespace-nowrap">Series</th>
                                    <th className="text-left p-3 font-medium whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentMatches.length === 0 ? (
                                    <tr>
                                        <td colSpan={showDetails ? 10 : 8} className="text-center p-8 text-muted-foreground">
                                            No matches found
                                        </td>
                                    </tr>
                                ) : (
                                    currentMatches.map((match) => (
                                        <tr key={match._id} className="border-b hover:bg-muted/50">
                                            <td className="p-3">{formatDate(match.date)}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(match.level)}`}>
                                                    {match.level}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormatBadgeColor(match.format)}`}>
                                                    {match.format}
                                                </span>
                                            </td>
                                            <td className="p-3 font-medium">{match.opponent}</td>
                                            <td className="p-3">{match.venue}</td>
                                            <td className="p-3">{match.result || '-'}</td>
                                            {showDetails && (
                                                <td className="p-3">
                                                    {match.tossWinner ? (
                                                        <div className="text-xs">
                                                            <div>{match.tossWinner}</div>
                                                            <div className="text-muted-foreground">
                                                                {match.tossDecision ? `chose to ${match.tossDecision}` : ''}
                                                            </div>
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                            )}
                                            {showDetails && (
                                                <td className="p-3 text-sm">{match.manOfTheMatch || '-'}</td>
                                            )}
                                            <td className="p-3">{match.series || '-'}</td>
                                            <td className="p-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onEditMatch?.(match)}
                                                        disabled={!onEditMatch}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this match?')) {
                                                                onDeleteMatch?.(match._id);
                                                            }
                                                        }}
                                                        disabled={!onDeleteMatch}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {currentMatches.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground border rounded-lg">
                                No matches found
                            </div>
                        ) : (
                            currentMatches.map((match) => (
                                <div key={match._id} className="border rounded-lg p-4 hover:bg-muted/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium">{formatDate(match.date)}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(match.level)}`}>
                                                    {match.level}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFormatBadgeColor(match.format)}`}>
                                                    {match.format}
                                                </span>
                                            </div>
                                            <div className="text-lg font-semibold">vs {match.opponent}</div>
                                            <div className="text-sm text-muted-foreground">{match.venue}</div>
                                            {match.result && (
                                                <div className="text-sm font-medium text-green-600">{match.result}</div>
                                            )}
                                            {match.series && (
                                                <div className="text-sm text-muted-foreground">{match.series}</div>
                                            )}
                                            {showDetails && (match.tossWinner || match.manOfTheMatch) && (
                                                <div className="text-sm space-y-1">
                                                    {match.tossWinner && (
                                                        <div>
                                                            <span className="font-medium">Toss:</span> {match.tossWinner}
                                                            {match.tossDecision && ` (chose to ${match.tossDecision})`}
                                                        </div>
                                                    )}
                                                    {match.manOfTheMatch && (
                                                        <div>
                                                            <span className="font-medium">Man of the Match:</span> {match.manOfTheMatch}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 sm:flex-col">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onEditMatch?.(match)}
                                                disabled={!onEditMatch}
                                                className="flex-1 sm:flex-none"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this match?')) {
                                                        onDeleteMatch?.(match._id);
                                                    }
                                                }}
                                                disabled={!onDeleteMatch}
                                                className="flex-1 sm:flex-none"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Items per page:</span>
                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            <div className="flex gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(pageNum)}
                                            className="w-8 h-8 p-0"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}