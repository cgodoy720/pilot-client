import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Trophy, Medal, Award } from 'lucide-react';
import { getLeaderboard, getLeaderboardStats, handleApiError } from '../../../services/salesTrackerApi';

const Leaderboard = () => {
  const [timePeriod, setTimePeriod] = useState('7');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [leaderboardResponse, statsResponse] = await Promise.all([
          getLeaderboard(timePeriod),
          getLeaderboardStats(timePeriod)
        ]);
        
        setLeaderboardData(leaderboardResponse.leaderboard || []);
        setStats(statsResponse.stats || {});
      } catch (err) {
        console.error('Failed to fetch leaderboard data:', err);
        setError(handleApiError(err));
        
        // Fallback to mock data on error
        const mockData = [
          { rank: 1, name: 'Kirstie Chen', outreachCount: 2, icon: 'gold' },
          { rank: 1, name: 'Victoria Mayo', outreachCount: 2, icon: 'gold' },
          { rank: 3, name: 'Afiya', outreachCount: 1, icon: 'bronze' },
          { rank: 4, name: 'Carlos Godoy', outreachCount: 1, icon: 'bronze', isCurrentUser: true },
          { rank: 4, name: 'Joanna Patterson', outreachCount: 1, icon: 'bronze' },
          { rank: 6, name: 'Andrew Tein', outreachCount: 0 },
          { rank: 6, name: 'Becky Lee', outreachCount: 0 },
          { rank: 6, name: 'David Yang', outreachCount: 0 },
        ];
        setLeaderboardData(mockData);
        setStats({ topPerformer: 'Kirstie Chen', totalOutreach: 10, activeStaff: 5 });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [timePeriod]);

  const getRankIcon = (rank, icon) => {
    const iconProps = { size: 20 };
    
    switch (icon) {
      case 'gold':
        return <Trophy className="text-yellow-500" {...iconProps} />;
      case 'silver':
        return <Medal className="text-gray-400" {...iconProps} />;
      case 'bronze':
        return <Award className="text-amber-600" {...iconProps} />;
      default:
        return <span className="text-gray-500 font-medium">#{rank}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Staff Outreach Leaderboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Time Period:</span>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-hidden">
          {/* Table Header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-sm font-semibold text-gray-900">Rank</div>
              <div className="text-sm font-semibold text-gray-900">Name</div>
              <div className="text-sm font-semibold text-gray-900 text-right">Outreach Count</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="px-6 py-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading leaderboard...</p>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No data available for the selected time period.</p>
                {error && (
                  <p className="mt-2 text-sm text-orange-600">
                    Using sample data due to connection issue.
                  </p>
                )}
              </div>
            ) : (
              leaderboardData.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className={`px-6 py-4 grid grid-cols-3 gap-4 items-center ${
                    item.isCurrentUser ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center space-x-2">
                    {getRankIcon(item.rank, item.icon)}
                  </div>

                  {/* Name */}
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      item.isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {item.name}
                    </span>
                    {item.isCurrentUser && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        You
                      </span>
                    )}
                  </div>

                  {/* Outreach Count */}
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      {item.outreachCount}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Top Performer</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.topPerformer || (leaderboardData.length > 0 ? leaderboardData[0]?.name : 'N/A')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Outreach</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.totalOutreach || leaderboardData.reduce((sum, item) => sum + item.outreachCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Medal className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Staff</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.activeStaff || leaderboardData.filter(item => item.outreachCount > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;