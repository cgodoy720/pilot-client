import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';

const CalendarHeader = ({ currentMonth, currentYear, onPrevMonth, onNextMonth, onMonthChange, cohortFilter, onCohortChange, userRole }) => {
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];

  return (
    <div className="flex flex-col">
      {/* Top Bar */}
      <div className="h-[52px] bg-bg-light border-b border-divider flex items-center justify-between px-[25px]">
        {/* Left: Month/Year Title */}
        <h1 className="text-[28px] leading-[30px] font-proxima font-normal bg-gradient-to-r from-carbon-black to-pursuit-purple bg-clip-text text-transparent">
          {monthNames[currentMonth]} {currentYear}
        </h1>
        
        {/* Right: Navigation Controls */}
        <div className="flex items-center gap-[5px]">
          {/* Left Chevron */}
          <Button
            onClick={onPrevMonth}
            variant="outline"
            className="w-[32px] h-[32px] p-[7px] border border-pursuit-purple rounded-[8px] flex items-center justify-center bg-transparent hover:bg-pursuit-purple/10"
          >
            <ChevronLeft className="w-[18px] h-[18px] text-white" style={{background: '#4242EA', borderRadius: '2px'}} />
          </Button>
          
          {/* Level Dropdown (L1) - Hidden for now as requested */}
          {/* <Select value="L1" disabled>
            <SelectTrigger className="w-[73px] h-[32px] bg-white rounded-[5px] px-[10px] border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L1">L1</SelectItem>
            </SelectContent>
          </Select> */}
          
          {/* Month Dropdown */}
          <Select value={String(currentMonth)} onValueChange={(val) => onMonthChange(parseInt(val))}>
            <SelectTrigger className="w-[117px] h-[32px] bg-white rounded-[5px] px-[10px] border-0 text-[16px] leading-[18px] font-proxima font-normal text-carbon-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthNames.map((month, idx) => (
                <SelectItem key={idx} value={String(idx)}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Right Chevron */}
          <Button
            onClick={onNextMonth}
            variant="outline"
            className="w-[32px] h-[32px] p-[7px] border border-pursuit-purple rounded-[8px] flex items-center justify-center bg-transparent hover:bg-pursuit-purple/10"
          >
            <ChevronRight className="w-[18px] h-[18px] text-white" style={{background: '#4242EA', borderRadius: '2px'}} />
          </Button>
        </div>
      </div>
      
      {/* Day Labels Row */}
      <div className="grid grid-cols-7 gap-[2px] px-[85px] py-[20px]">
        {dayLabels.map((label, idx) => (
          <div
            key={idx}
            className="h-[32px] bg-white rounded-[20px] flex items-center justify-center"
          >
            <span className="text-[12px] leading-[14px] font-proxima font-normal text-black">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarHeader;

