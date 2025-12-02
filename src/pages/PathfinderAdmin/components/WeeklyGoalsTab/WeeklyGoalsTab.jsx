import React, { memo } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';

const WeeklyGoalsTab = ({
  weeklyGoals,
  weeklyGoalsForm,
  setWeeklyGoalsForm,
  editingGoalId,
  availableCohorts,
  handleWeeklyGoalsSubmit,
  handleEditGoal,
  handleDeleteGoal,
  handleCancelEdit
}) => {
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#1a1a1a] mb-2">Weekly Goals Management</h2>
        <p className="text-[#666]">Set goals for builders to accomplish each week</p>
      </div>

      {/* Add/Edit Form */}
      <Card className="bg-white border-[#e0e0e0]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1a1a1a]">
            {editingGoalId ? 'Edit Weekly Goals' : 'Create New Weekly Goals'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleWeeklyGoalsSubmit} className="space-y-4">
            {/* Date and Cohort Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Week Start Date *
                </label>
                <Input
                  type="date"
                  value={weeklyGoalsForm.weekStartDate}
                  onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, weekStartDate: e.target.value})}
                  required
                  className="border-[#d0d0d0] focus:ring-[#4242ea]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Week End Date *
                </label>
                <Input
                  type="date"
                  value={weeklyGoalsForm.weekEndDate}
                  onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, weekEndDate: e.target.value})}
                  required
                  className="border-[#d0d0d0] focus:ring-[#4242ea]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Cohort
                </label>
                <Select 
                  value={weeklyGoalsForm.cohort || "all"} 
                  onValueChange={(value) => setWeeklyGoalsForm({...weeklyGoalsForm, cohort: value === "all" ? "" : value})}
                >
                  <SelectTrigger className="border-[#d0d0d0]">
                    <SelectValue placeholder="All Cohorts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cohorts</SelectItem>
                    {availableCohorts.map(cohort => (
                      <SelectItem key={cohort} value={cohort}>{cohort}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Goals Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Hustle Goal
                </label>
                <Input
                  type="number"
                  min="0"
                  value={weeklyGoalsForm.networkingGoal}
                  onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, networkingGoal: parseInt(e.target.value) || 0})}
                  className="border-[#d0d0d0] focus:ring-[#4242ea]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Applications Goal
                </label>
                <Input
                  type="number"
                  min="0"
                  value={weeklyGoalsForm.applicationsGoal}
                  onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, applicationsGoal: parseInt(e.target.value) || 0})}
                  className="border-[#d0d0d0] focus:ring-[#4242ea]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                  Interviews Goal
                </label>
                <Input
                  type="number"
                  min="0"
                  value={weeklyGoalsForm.interviewsGoal}
                  onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, interviewsGoal: parseInt(e.target.value) || 0})}
                  className="border-[#d0d0d0] focus:ring-[#4242ea]"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">
                Motivational Message (Optional)
              </label>
              <textarea
                value={weeklyGoalsForm.message}
                onChange={(e) => setWeeklyGoalsForm({...weeklyGoalsForm, message: e.target.value})}
                placeholder="Add a motivational message or theme for the week..."
                rows="3"
                className="w-full px-3 py-2 border border-[#d0d0d0] rounded-md focus:outline-none focus:ring-2 focus:ring-[#4242ea] focus:border-transparent resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="bg-[#4242ea] text-white hover:bg-[#3333d1]"
              >
                {editingGoalId ? 'Update Goals' : 'Create Goals'}
              </Button>
              {editingGoalId && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div>
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-4">Previous Weekly Goals</h3>
        {weeklyGoals.length === 0 ? (
          <Card className="bg-white border-[#e0e0e0]">
            <CardContent className="text-center py-8">
              <p className="text-[#666]">No weekly goals created yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyGoals.map(goal => (
              <Card key={goal.goal_id} className="bg-white border-[#e0e0e0]">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base font-semibold text-[#1a1a1a] mb-2">
                        {formatDateRange(goal.week_start_date, goal.week_end_date)}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className={goal.cohort ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}
                      >
                        {goal.cohort || 'All Cohorts'}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditGoal(goal)}
                        className="h-8 w-8 p-0 hover:bg-[#f0f0f0]"
                        title="Edit"
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.goal_id)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Goal Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#1a1a1a]">{goal.networking_goal}</div>
                      <div className="text-xs text-[#666]">Hustle</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#1a1a1a]">{goal.applications_goal}</div>
                      <div className="text-xs text-[#666]">Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-[#1a1a1a]">{goal.interviews_goal}</div>
                      <div className="text-xs text-[#666]">Interviews</div>
                    </div>
                  </div>

                  {/* Message */}
                  {goal.message && (
                    <div className="p-3 bg-[#f8f9fa] rounded-lg mb-3">
                      <div className="text-sm font-medium text-[#1a1a1a] mb-1">Message:</div>
                      <div className="text-sm text-[#666]">{goal.message}</div>
                    </div>
                  )}

                  {/* Created By */}
                  {goal.created_by_first_name && (
                    <div className="text-xs text-[#999] text-center">
                      Created by {goal.created_by_first_name} {goal.created_by_last_name}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(WeeklyGoalsTab);
