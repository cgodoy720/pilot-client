import React from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Calendar } from '../../../components/ui/calendar';

const toETDate = (d) => d.toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const DateNavigator = ({ selectedDate, onDateChange }) => {
  // Anchor at noon UTC so the instant is unambiguous across user locales and
  // DST shifts. Noon UTC falls squarely within the selectedDate in ET,
  // so toLocaleDateString({ timeZone: 'America/New_York' }) renders the
  // correct calendar day regardless of where the browser is running.
  const dateObj = new Date(selectedDate + 'T12:00:00Z');
  const todayStr = toETDate(new Date());
  const isToday = selectedDate === todayStr;

  const shift = (days) => {
    const d = new Date(dateObj);
    d.setUTCDate(d.getUTCDate() + days);
    onDateChange(toETDate(d));
  };

  const formatted = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'America/New_York',
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
              onSelect={(day) => { if (day) onDateChange(toETDate(day)); }}
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
