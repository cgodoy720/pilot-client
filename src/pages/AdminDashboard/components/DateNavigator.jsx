import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';

const DateNavigator = ({ selectedDate, onDateChange }) => {
  const dateObj = new Date(selectedDate + 'T12:00:00');
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const isToday = selectedDate === todayStr;

  const shift = (days) => {
    const d = new Date(dateObj);
    d.setDate(d.getDate() + days);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const formatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={() => shift(-1)}
          className="p-1.5 rounded-md border border-[#E3E3E3] bg-white hover:bg-[#EFEFEF] transition-colors"
        >
          <ChevronLeft size={16} className="text-slate-600" />
        </button>
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#E3E3E3] bg-white hover:border-[#4242EA] transition-colors">
              <CalendarDays size={14} className="text-[#4242EA]" />
              <span className="text-sm font-semibold text-[#1E1E1E]">{formatted}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white" align="start">
            <Calendar
              mode="single"
              selected={dateObj}
              onSelect={(day) => { if (day) onDateChange(day.toISOString().split('T')[0]); }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <button
          onClick={() => shift(1)}
          className="p-1.5 rounded-md border border-[#E3E3E3] bg-white hover:bg-[#EFEFEF] transition-colors"
        >
          <ChevronRight size={16} className="text-slate-600" />
        </button>
      </div>
      {!isToday && (
        <button
          onClick={() => onDateChange(todayStr)}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#4242EA] text-white hover:bg-[#3535c8] transition-colors"
        >
          Today
        </button>
      )}
      {isToday && (
        <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">Today</span>
      )}
    </div>
  );
};

export default DateNavigator;
