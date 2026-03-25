import React, { useState, useRef, useEffect } from 'react';
import { FormControl, Select, MenuItem, Popover, Box, Button, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';

export type DateRangePreset = 'currentFY' | 'next30' | 'next60' | 'next90' | 'thisQuarter' | 'all' | 'custom';

export type DateRangeValue =
  | { preset: Exclude<DateRangePreset, 'custom'> }
  | { preset: 'custom'; start: string; end: string };

const PRESET_LABELS: Record<Exclude<DateRangePreset, 'custom'>, string> = {
  currentFY: 'Current FY',
  next30: 'Next 30 days',
  next60: 'Next 60 days',
  next90: 'Next 90 days',
  thisQuarter: 'This Quarter',
  all: 'All Dates',
};

interface DateRangeSelectorProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ value, onChange }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [customStart, setCustomStart] = useState<Date | null>(null);
  const [customEnd, setCustomEnd] = useState<Date | null>(null);

  useEffect(() => {
    if (value.preset === 'custom') {
      setCustomStart(parseISO(value.start));
      setCustomEnd(parseISO(value.end));
    }
  }, [value]);

  const displayText = (() => {
    if (value.preset === 'custom') {
      try {
        return `${format(parseISO(value.start), 'MMM d')} – ${format(parseISO(value.end), 'MMM d, yyyy')}`;
      } catch {
        return 'Custom…';
      }
    }
    return PRESET_LABELS[value.preset] || 'Date Range';
  })();

  const handleSelectChange = (newValue: string) => {
    if (newValue === 'custom') {
      if (!customStart) setCustomStart(new Date());
      if (!customEnd) {
        const end = new Date();
        end.setMonth(end.getMonth() + 3);
        setCustomEnd(end);
      }
      setPopoverOpen(true);
    } else {
      onChange({ preset: newValue as Exclude<DateRangePreset, 'custom'> });
    }
  };

  const handleApply = () => {
    if (customStart && customEnd) {
      onChange({
        preset: 'custom',
        start: format(customStart, 'yyyy-MM-dd'),
        end: format(customEnd, 'yyyy-MM-dd'),
      });
    }
    setPopoverOpen(false);
  };

  return (
    <>
      <FormControl size="small" sx={{ minWidth: 130, '& .MuiInputBase-root': { height: 32, fontSize: '0.75rem' }, '& .MuiInputLabel-root': { fontSize: '0.75rem' } }} ref={anchorRef}>
        <Select
          value={value.preset}
          onChange={(e) => handleSelectChange(e.target.value)}
          renderValue={() => displayText}
          size="small"
        >
          {Object.entries(PRESET_LABELS).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
          <MenuItem value="custom" onClick={() => setPopoverOpen(true)}>Custom…</MenuItem>
        </Select>
      </FormControl>

      <Popover
        open={popoverOpen}
        anchorEl={anchorRef.current}
        onClose={() => setPopoverOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 280 }}>
          <Typography variant="subtitle2">Custom Date Range</Typography>
          <DatePicker
            label="From"
            value={customStart}
            onChange={setCustomStart}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
          <DatePicker
            label="To"
            value={customEnd}
            onChange={setCustomEnd}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              size="small"
              onClick={() => {
                setPopoverOpen(false);
                onChange({ preset: 'currentFY' });
              }}
            >
              Back to presets
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button size="small" onClick={() => setPopoverOpen(false)}>Cancel</Button>
              <Button
                size="small"
                variant="contained"
                onClick={handleApply}
                disabled={!customStart || !customEnd}
              >
                Apply
              </Button>
            </Box>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default DateRangeSelector;
