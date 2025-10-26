'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsData {
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  battingAverage: number;
  bowlingAverage: number;
  strikeRate: number;
  economy: number;
  formatStats: any[];
  levelStats: any[];
  performanceOverTime: any[];
  venueStats: any[];
  opponentStats: any[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedFormat, selectedLevel]);

  const fetchAnalyticsData = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFormat !== 'all') params.append('format', selectedFormat);
      if (selectedLevel !== 'all') params.append('level', selectedLevel);

      const response = await fetch(`/api/analytics?${params}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">No data available</div>
      </div>
    );
  }

  // Chart configurations
  const performanceOverTimeConfig = {
    data: {
      labels: data.performanceOverTime?.map(item => item.date) || [],
      datasets: [
        {
          label: 'Runs',
          data: data.performanceOverTime?.map(item => item.runs) || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y',
        },
        {
          label: 'Strike Rate',
          data: data.performanceOverTime?.map(item => item.strikeRate) || [],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Match Date',
          },
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          title: {
            display: true,
            text: 'Runs',
          },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          title: {
            display: true,
            text: 'Strike Rate',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: 'Performance Over Time',
        },
      },
    },
  };

  const formatStatsConfig = {
    data: {
      labels: data.formatStats?.map(item => item._id) || [],
      datasets: [
        {
          label: 'Matches',
          data: data.formatStats?.map(item => item.matches) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
        {
          label: 'Runs',
          data: data.formatStats?.map(item => item.totalRuns) || [],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
        },
        {
          label: 'Wickets',
          data: data.formatStats?.map(item => item.totalWickets) || [],
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Performance by Format',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Format',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Count',
          },
        },
      },
    },
  };

  const levelDistributionConfig = {
    data: {
      labels: data.levelStats?.map(item => item._id) || [],
      datasets: [
        {
          data: data.levelStats?.map(item => item.matches) || [],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Matches by Level',
        },
        legend: {
          position: 'bottom' as const,
        },
      },
    },
  };

  const venuePerformanceConfig = {
    data: {
      labels: data.venueStats?.slice(0, 10).map(item => item._id) || [],
      datasets: [
        {
          label: 'Average Runs',
          data: data.venueStats?.slice(0, 10).map(item => item.avgRuns) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Top 10 Venues by Average Runs',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Venue',
          },
        },
        y: {
          title: {
            display: true,
            text: 'Average Runs',
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cricket Analytics Dashboard</h1>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Formats</option>
              <option value="Test">Test</option>
              <option value="ODI">ODI</option>
              <option value="T20">T20</option>
              <option value="First-class">First-class</option>
              <option value="List-A">List-A</option>
              <option value="T20-domestic">T20 Domestic</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="school">School</option>
              <option value="domestic">Domestic</option>
              <option value="Ranji">Ranji Trophy</option>
              <option value="IPL">IPL</option>
              <option value="international">International</option>
            </select>
          </div>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Matches</p>
                <p className="text-2xl font-semibold text-gray-900">{data.totalMatches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Runs</p>
                <p className="text-2xl font-semibold text-gray-900">{data.totalRuns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Wickets</p>
                <p className="text-2xl font-semibold text-gray-900">{data.totalWickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Batting Average</p>
                <p className="text-2xl font-semibold text-gray-900">{data.battingAverage?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Strike Rate</h3>
            <p className="text-3xl font-bold text-blue-600">{data.strikeRate?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bowling Average</h3>
            <p className="text-3xl font-bold text-green-600">{data.bowlingAverage?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Economy Rate</h3>
            <p className="text-3xl font-bold text-red-600">{data.economy?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Over Time */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <Line {...performanceOverTimeConfig} />
          </div>

          {/* Format Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <Bar {...formatStatsConfig} />
          </div>

          {/* Level Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <Pie {...levelDistributionConfig} />
          </div>

          {/* Venue Performance */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <Bar {...venuePerformanceConfig} />
          </div>
        </div>

        {/* Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Opponent Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance vs Opponents</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opponent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matches
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Runs
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.opponentStats?.slice(0, 5).map((opponent, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {opponent._id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {opponent.matches}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {opponent.avgRuns?.toFixed(2) || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Format Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Breakdown</h3>
            <div className="space-y-4">
              {data.formatStats?.map((format, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{format._id}</p>
                    <p className="text-sm text-gray-500">{format.matches} matches</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{format.totalRuns} runs</p>
                    <p className="text-sm text-gray-500">Avg: {format.avgRuns?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}