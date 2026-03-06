'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { debounce } from '@/lib/utils/debounce';
import { Button } from '@/components/shadcnComponents/button';
import { Card, CardContent } from '@/components/shadcnComponents/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcnComponents/select';
import { Badge } from '@/components/shadcnComponents/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcnComponents/popover';
import { Calendar } from '@/components/shadcnComponents/calendar';
import { format } from 'date-fns';

interface ParkingLot {
  _id: string;
  name: string;
}

interface RecordFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  parkingLotId: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function RecordFilters({ onFilterChange }: RecordFiltersProps) {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({
    parkingLotId: '',
    status: '',
    startDate: '',
    endDate: '',
  });

  // Create debounced filter change handler
  const debouncedFilterChange = useRef(
    debounce((newFilters: FilterValues) => {
      onFilterChange(newFilters);
    }, 300)
  ).current;

  useEffect(() => {
    // Fetch parking lots for filter dropdown
    const fetchParkingLots = async () => {
      try {
        const response = await fetch('/api/parking-lots');
        if (response.ok) {
          const data = await response.json();
          setParkingLots(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching parking lots:', error);
      }
    };

    fetchParkingLots();
  }, []);

  const handleFilterChange = (field: keyof FilterValues, value: string) => {
    // Convert "all" back to empty string for the API
    const actualValue = value === 'all' ? '' : value;
    const newFilters = { ...filters, [field]: actualValue };
    setFilters(newFilters);
    debouncedFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: FilterValues = {
      parkingLotId: '',
      status: '',
      startDate: '',
      endDate: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== '');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <Badge variant="secondary">
                Active
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>Clear all</span>
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-[#2a2e37]">
            {/* Parking Lot Filter */}
            <div>
              <label
                htmlFor="parkingLot"
                className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2"
              >
                Parking Lot
              </label>
              <Select
                value={filters.parkingLotId || 'all'}
                onValueChange={(value) => handleFilterChange('parkingLotId', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Parking Lots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parking Lots</SelectItem>
                  {parkingLots.map((lot) => (
                    <SelectItem key={lot._id} value={lot._id}>
                      {lot.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2"
              >
                Status
              </label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="inside">Inside</SelectItem>
                  <SelectItem value="exited">Exited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2"
              >
                Start Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between text-left font-normal ${
                      !filters.startDate ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {filters.startDate ? (
                      format(new Date(filters.startDate), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate ? new Date(filters.startDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleFilterChange('startDate', format(date, 'yyyy-MM-dd'));
                      } else {
                        handleFilterChange('startDate', '');
                      }
                    }}
                    defaultMonth={filters.startDate ? new Date(filters.startDate) : undefined}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date Filter */}
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2"
              >
                End Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-between text-left font-normal ${
                      !filters.endDate ? 'text-muted-foreground' : ''
                    }`}
                  >
                    {filters.endDate ? (
                      format(new Date(filters.endDate), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="w-4 h-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate ? new Date(filters.endDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleFilterChange('endDate', format(date, 'yyyy-MM-dd'));
                      } else {
                        handleFilterChange('endDate', '');
                      }
                    }}
                    defaultMonth={filters.endDate ? new Date(filters.endDate) : undefined}
                    disabled={(date: Date) => {
                      // Disable dates before start date
                      if (filters.startDate) {
                        return date < new Date(filters.startDate);
                      }
                      return false;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
