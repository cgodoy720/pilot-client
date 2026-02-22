import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '../../../components/ui/accordion';
import { Search, ChevronRight, Upload } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';

function CohortDaySelector({ token, selectedCohort, selectedDay, onCohortSelect, onDaySelect, onUploadCurriculum, canEdit }) {
  const [cohorts, setCohorts] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCohorts();
  }, []);

  useEffect(() => {
    if (selectedCohort) {
      fetchDays(selectedCohort.cohort_name);
    } else {
      setWeeks([]);
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

      // Keep the week structure from the API
      setWeeks(response.data || []);
    } catch (error) {
      console.error('Error fetching days:', error);
    } finally {
      setLoading(false);
    }
  };

  // Expose a refresh function for parent to call after upload
  const refreshDays = () => {
    if (selectedCohort) {
      fetchDays(selectedCohort.cohort_name);
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
              <Accordion type="multiple" className="space-y-1">
                {Object.entries(groupedCohorts).map(([org, orgCohorts]) => (
                  <AccordionItem
                    key={org}
                    value={org}
                    className="border border-slate-200 rounded-lg overflow-hidden"
                  >
                    <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-slate-50 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 font-proxima">
                          {org}
                        </span>
                        <Badge variant="secondary" className="text-xs font-proxima">
                          {orgCohorts.length} {orgCohorts.length === 1 ? 'cohort' : 'cohorts'}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pb-2">
                      <div className="space-y-1.5">
                        {orgCohorts.map(cohort => (
                          <button
                            key={cohort.cohort_id}
                            onClick={() => onCohortSelect(cohort)}
                            className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          >
                            <div className="font-medium text-slate-900 font-proxima text-sm">
                              {cohort.cohort_name}
                            </div>
                            {cohort.program_name && (
                              <div className="text-xs text-slate-600 font-proxima">
                                {cohort.program_name}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
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
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
              &larr; Back to Cohorts
            </button>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900 font-proxima truncate">
                {selectedCohort.cohort_name}
              </h2>
              {canEdit && onUploadCurriculum && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUploadCurriculum(selectedCohort)}
                  className="font-proxima shrink-0 text-xs"
                >
                  <Upload className="h-3.5 w-3.5 mr-1" />
                  Upload
                </Button>
              )}
            </div>
            {selectedCohort.program_name && (
              <p className="text-sm text-slate-600 font-proxima mt-1">
                {selectedCohort.program_name}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500 font-proxima">
                Loading days...
              </div>
            ) : weeks.length === 0 ? (
              <div className="text-center py-8 text-slate-500 font-proxima">
                No curriculum days found for this cohort
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-1">
                {weeks.map((week) => {
                  const weekDays = week.days || [];
                  const weekNumber = week.weekNumber ?? week.week_number ?? week.week;

                  return (
                    <AccordionItem
                      key={`week-${weekNumber}`}
                      value={`week-${weekNumber}`}
                      className="border border-slate-200 rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-slate-50 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 font-proxima">
                            Week {weekNumber}
                          </span>
                          <Badge variant="secondary" className="text-xs font-proxima">
                            {weekDays.length} {weekDays.length === 1 ? 'day' : 'days'}
                          </Badge>
                        </div>
                        {(week.weeklyGoal || week.weekly_goal) && (
                          <span className="text-xs text-slate-500 font-proxima truncate max-w-[120px] ml-auto mr-2">
                            {week.weeklyGoal || week.weekly_goal}
                          </span>
                        )}
                      </AccordionTrigger>
                      <AccordionContent className="px-2 pb-2">
                        <div className="space-y-1.5">
                          {weekDays.map(day => (
                            <button
                              key={day.id}
                              onClick={() => onDaySelect(day)}
                              className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                                selectedDay?.id === day.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 font-proxima text-sm">
                                    Day {day.day_number}
                                  </div>
                                  <div className="text-xs text-slate-600 font-proxima">
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
                                  {day.day_type && (
                                    <Badge variant="secondary" className="text-xs font-proxima mt-1">
                                      {day.day_type}
                                    </Badge>
                                  )}
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CohortDaySelector;
