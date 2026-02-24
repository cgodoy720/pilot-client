import React from 'react';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';

const FiltersSection = ({
  filters,
  availableCohorts,
  availablePeriods,
  onFilterChange,
  onApplyFilters,
  onClearFilters
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Cohort Filter */}
        <div className="space-y-2">
          <Label htmlFor="cohort" className="text-sm font-medium">
            Cohort:
          </Label>
          <Select
            value={filters.cohort || "__ALL_COHORTS__"}
            onValueChange={(value) => onFilterChange('cohort', value === "__ALL_COHORTS__" ? '' : value)}
          >
            <SelectTrigger id="cohort">
              <SelectValue placeholder="All Cohorts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL_COHORTS__">All Cohorts</SelectItem>
              {availableCohorts.map(cohort => (
                <SelectItem key={cohort.name} value={cohort.name}>
                  {cohort.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assessment Period Filter */}
        <div className="space-y-2">
          <Label htmlFor="assessmentPeriod" className="text-sm font-medium">
            Assessment Period:
          </Label>
          <Select
            value={filters.assessmentPeriod || "__ALL_PERIODS__"}
            onValueChange={(value) => onFilterChange('assessmentPeriod', value === "__ALL_PERIODS__" ? '' : value)}
          >
            <SelectTrigger id="assessmentPeriod">
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL_PERIODS__">All Periods</SelectItem>
              {availablePeriods.map(period => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex gap-4 justify-end">
        <Button onClick={onApplyFilters}>
          Apply Filters
        </Button>
        <Button variant="secondary" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default FiltersSection;
