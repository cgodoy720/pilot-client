// @ts-nocheck
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

const MonthFilter = ({ selectedMonth, onMonthChange, cohortMonth }) => {
  // Generate months from cohort month to current month
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Parse cohort month (e.g., "March 2025" -> year: 2025, month: 2)
    let cohortYear = currentYear;
    let cohortMonthIndex = 0; // January default
    
    if (cohortMonth) {
      const parts = cohortMonth.split(' ');
      if (parts.length === 2) {
        const monthName = parts[0];
        cohortYear = parseInt(parts[1]);
        
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        cohortMonthIndex = monthNames.findIndex(m => m === monthName);
        if (cohortMonthIndex === -1) cohortMonthIndex = 0; // Fallback to January
      }
    }
    
    // Add "All Time" option
    options.push({ value: 'all', label: 'All Time' });
    
    // Calculate the number of months between cohort month and current month
    const monthDiff = 
      (currentYear - cohortYear) * 12 + (currentMonth - cohortMonthIndex) + 1;
    
    // Generate month options from cohort month to current month
    for (let i = 0; i < monthDiff; i++) {
      let monthIndex = currentMonth - i;
      let year = currentYear;
      
      while (monthIndex < 0) {
        monthIndex += 12;
        year -= 1;
      }
      
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const monthName = monthNames[monthIndex];
      const value = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
      
      options.push({
        value,
        label: `${monthName} ${year}`
      });
    }
    
    return options;
  };
  
  const monthOptions = getMonthOptions();

  return (
    <FormControl 
      size="small" 
      sx={{ 
        minWidth: '160px',
        '& .MuiInputBase-root': {
          height: '36px',
        },
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'var(--color-background-darker)',
        },
        '& .MuiSelect-icon': {
          color: 'var(--color-text-secondary)'
        }
      }}
    >
      <InputLabel id="month-filter-label" sx={{ fontSize: '0.85rem' }}>Filter by Month</InputLabel>
      <Select
        labelId="month-filter-label"
        id="month-filter"
        value={selectedMonth}
        label="Filter by Month"
        onChange={(e) => onMonthChange(e.target.value)}
        sx={{ fontSize: '0.85rem' }}
      >
        {monthOptions.map(option => (
          <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.85rem' }}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default MonthFilter; 