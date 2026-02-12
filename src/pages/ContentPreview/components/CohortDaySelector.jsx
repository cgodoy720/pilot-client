import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Search, Calendar, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';

function CohortDaySelector({ token, selectedCohort, selectedDay, onCohortSelect, onDaySelect }) {
  const [cohorts, setCohorts] = useState([]);
  const [days, setDays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCohorts();
  }, []);

  useEffect(() => {
    if (selectedCohort) {
      fetchDays(selectedCohort.cohort_name);
    } else {
      setDays([]);
    }
  }, [selectedCohort]);

  const fetchCohorts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/preview/cohorts`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCohorts(response.data.cohorts || []);
    } catch (error) {
      console.error('Error fetching cohorts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDays = async (cohortName) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/curriculum/calendar?cohort=${encodeURIComponent(cohortName)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // The calendar endpoint returns weeks with days
      const weeks = response.data || [];
      const allDays = weeks.flatMap(week => week.days || []);
      setDays(allDays);
    } catch (error) {
      console.error('Error fetching days:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCohorts = cohorts.filter(cohort =>
    cohort.cohort_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cohort.organization_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cohort.program_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group cohorts by organization
  const groupedCohorts = filteredCohorts.reduce((acc, cohort) => {
    const org = cohort.organization_name || 'No Organization';
    if (!acc[org]) {
      acc[org] = [];
    }
    acc[org].push(cohort);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col">
      {/* Cohort Selection */}
      {!selectedCohort ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-3 font-proxima">
              Select Cohort
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search cohorts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 font-proxima"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500 font-proxima">
                Loading cohorts...
              </div>
            ) : Object.keys(groupedCohorts).length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-proxima">
                No cohorts found
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedCohorts).map(([org, orgCohorts]) => (
                  <div key={org}>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2 font-proxima">
                      {org}
                    </h3>
                    <div className="space-y-2">
                      {orgCohorts.map(cohort => (
                        <button
                          key={cohort.cohort_id}
                          onClick={() => onCohortSelect(cohort)}
                          className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <div className="font-medium text-slate-900 font-proxima">
                            {cohort.cohort_name}
                          </div>
                          {cohort.program_name && (
                            <div className="text-sm text-slate-600 font-proxima">
                              {cohort.program_name}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {cohort.course_level && (
                              <Badge variant="outline" className="text-xs font-proxima">
                                {cohort.course_level}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs font-proxima">
                              {cohort.day_count || 0} days
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Day Selection */
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <button
              onClick={() => onCohortSelect(null)}
              className="text-sm text-blue-600 hover:text-blue-700 mb-3 font-proxima flex items-center gap-1"
            >
              ← Back to Cohorts
            </button>
            <h2 className="text-lg font-bold text-slate-900 font-proxima">
              {selectedCohort.cohort_name}
            </h2>
            {selectedCohort.program_name && (
              <p className="text-sm text-slate-600 font-proxima">
                {selectedCohort.program_name}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500 font-proxima">
                Loading days...
              </div>
            ) : days.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-proxima">
                No curriculum days found for this cohort
              </div>
            ) : (
              <div className="space-y-2">
                {days.map(day => (
                  <button
                    key={day.id}
                    onClick={() => onDaySelect(day)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedDay?.id === day.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 font-proxima">
                          Day {day.day_number}
                        </div>
                        <div className="text-sm text-slate-600 font-proxima">
                          {new Date(day.day_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        {day.daily_goal && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2 font-proxima">
                            {day.daily_goal}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs font-proxima">
                            Week {day.week}
                          </Badge>
                          {day.day_type && (
                            <Badge variant="secondary" className="text-xs font-proxima">
                              {day.day_type}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CohortDaySelector;
