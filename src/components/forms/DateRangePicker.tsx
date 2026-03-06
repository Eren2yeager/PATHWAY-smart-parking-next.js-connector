'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/shadcnComponents/button';
import { Card, CardContent } from '@/components/shadcnComponents/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcnComponents/popover';
import { Calendar } from '@/components/shadcnComponents/calendar';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
}

type PresetOption = {
  label: string;
  days: number;
};

const PRESET_OPTIONS: PresetOption[] = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
];

export default function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(format(startDate, 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(endDate, 'yyyy-MM-dd'));

  const handlePresetClick = (days: number) => {
    const end = new Date();
    const start = subDays(end, days);
    onDateRangeChange(start, end);
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert('Invalid date format');
      return;
    }

    if (start >= end) {
      alert('Start date must be before end date');
      return;
    }

    // Check if date range is not too large (max 1 year)
    const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      alert('Date range cannot exceed 365 days');
      return;
    }

    onDateRangeChange(start, end);
    setShowCustom(false);
  };

  const handleCustomCancel = () => {
    setCustomStartDate(format(startDate, 'yyyy-MM-dd'));
    setCustomEndDate(format(endDate, 'yyyy-MM-dd'));
    setShowCustom(false);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-[#d1d5db]">Date Range</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCustom(!showCustom)}
          >
            {showCustom ? 'Hide Custom' : 'Custom Range'}
          </Button>
        </div>

        {/* Current Date Range Display */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-[#0a0b0d] rounded-lg border border-gray-100 dark:border-[#2a2e37]">
          <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Selected Range</p>
          <p className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb]">
            {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
          </p>
          <p className="text-xs text-gray-500 dark:text-[#71717a] mt-1">
            {Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>

        {/* Preset Options */}
        {!showCustom && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 dark:text-[#71717a] uppercase tracking-wider mb-2">
              Quick Select
            </p>
            {PRESET_OPTIONS.map((preset) => (
              <Button
                key={preset.days}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handlePresetClick(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}

        {/* Custom Date Range Inputs */}
        {showCustom && (
          <div className="space-y-4">
            <div>
              <label htmlFor="start-date" className="block text-xs font-medium text-gray-700 dark:text-[#d1d5db] mb-1">
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between text-left font-normal ${
                      !customStartDate ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {customStartDate ? (
                      format(new Date(customStartDate), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customStartDate ? new Date(customStartDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setCustomStartDate(format(date, 'yyyy-MM-dd'));
                      }
                    }}
                    defaultMonth={customStartDate ? new Date(customStartDate) : undefined}
                    disabled={(date: Date) => {
                      // Disable dates after end date if set
                      if (customEndDate) {
                        return date > new Date(customEndDate);
                      }
                      return false;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label htmlFor="end-date" className="block text-xs font-medium text-gray-700 dark:text-[#d1d5db] mb-1">
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between text-left font-normal ${
                      !customEndDate ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {customEndDate ? (
                      format(new Date(customEndDate), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={customEndDate ? new Date(customEndDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setCustomEndDate(format(date, 'yyyy-MM-dd'));
                      }
                    }}
                    defaultMonth={customEndDate ? new Date(customEndDate) : undefined}
                    disabled={(date: Date) => {
                      // Disable dates before start date or after today
                      const today = new Date();
                      if (customStartDate) {
                        return date < new Date(customStartDate) || date > today;
                      }
                      return date > today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleCustomApply}
                className="flex-1"
              >
                Apply
              </Button>
              <Button
                onClick={handleCustomCancel}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            <div className="text-xs text-gray-500 dark:text-[#71717a] pt-2 border-t border-gray-200 dark:border-[#2a2e37] space-y-1">
              <p>• Maximum range: 365 days</p>
              <p>• End date cannot be in the future</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
