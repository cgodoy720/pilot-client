import React from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const DayNavigator = ({ 
  allDays, 
  currentDayIndex, 
  onDayChange 
}) => {
  if (!allDays || allDays.length === 0) return null;
  
  const currentDay = allDays[currentDayIndex];
  const isMultiDay = allDays.length > 1;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="border-[#C8C8C8]">
      <CardContent className="p-4">
        {isMultiDay ? (
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDayChange(currentDayIndex - 1)}
              disabled={currentDayIndex === 0}
              className="border-[#C8C8C8]"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4 text-[#666]" />
                <span className="font-proxima-bold text-[#1E1E1E]">
                  Day {currentDay?.day_number || currentDayIndex + 1}
                </span>
                <Badge variant="outline" className="border-[#C8C8C8]">
                  {currentDayIndex + 1} of {allDays.length}
                </Badge>
              </div>
              <p className="text-sm text-[#666] font-proxima mt-1">
                {formatDate(currentDay?.date)}
              </p>
              {currentDay?.daily_goal && (
                <p className="text-sm text-[#1E1E1E] font-proxima mt-2">
                  {currentDay.daily_goal}
                </p>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDayChange(currentDayIndex + 1)}
              disabled={currentDayIndex === allDays.length - 1}
              className="border-[#C8C8C8]"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-[#666]" />
              <span className="font-proxima-bold text-[#1E1E1E]">
                Day {currentDay?.day_number || 1}
              </span>
            </div>
            <p className="text-sm text-[#666] font-proxima">
              {formatDate(currentDay?.date)}
            </p>
            {currentDay?.daily_goal && (
              <p className="text-sm text-[#1E1E1E] font-proxima mt-2">
                {currentDay.daily_goal}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DayNavigator;
