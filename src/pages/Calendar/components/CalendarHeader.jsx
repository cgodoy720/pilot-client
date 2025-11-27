import React from 'react';
import ArrowButton from '../../../components/ArrowButton/ArrowButton';
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
      <div className="h-[45px] bg-bg-light border-b border-divider flex items-center justify-between px-[25px]">
        {/* Left: Month/Year Title */}
        <h1 className="text-[28px] leading-[30px] font-proxima font-normal bg-gradient-to-r from-carbon-black to-pursuit-purple bg-clip-text text-transparent">
          {monthNames[currentMonth]} {currentYear}
        </h1>
        
        {/* Right: Navigation Controls */}
        <div className="flex items-center gap-[5px]">
          {/* Left Arrow - Previous Month */}
          <ArrowButton
            onClick={onPrevMonth}
            borderColor="#4242EA"
            backgroundColor="#EFEFEF"
            arrowColor="#4242EA"
            hoverBackgroundColor="#4242EA"
            hoverArrowColor="#FFFFFF"
            size="md"
            rotation={180}
            useChevron={true}
            className="!w-[32px] !h-[32px] !rounded-[8px]"
            strokeWidth={0.8}
          />
          
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
          
          {/* Right Arrow - Next Month */}
          <ArrowButton
            onClick={onNextMonth}
            borderColor="#4242EA"
            backgroundColor="#EFEFEF"
            arrowColor="#4242EA"
            hoverBackgroundColor="#4242EA"
            hoverArrowColor="#FFFFFF"
            size="md"
            useChevron={true}
            className="!w-[32px] !h-[32px] !rounded-[8px]"
            strokeWidth={0.8}
          />
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

