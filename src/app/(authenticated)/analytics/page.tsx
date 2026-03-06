'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { subDays } from 'date-fns';
import { BarChart3, TrendingUp, Clock, Filter, FileText } from 'lucide-react';
import DateRangePicker from '@/components/forms/DateRangePicker';
import { SkeletonRectangle } from '@/components/misc/SkeletonLoader';
import { Button } from '@/components/shadcnComponents/button';
import { Card, CardContent } from '@/components/shadcnComponents/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcnComponents/select';

// Code-split heavy chart components
const OccupancyTrendChart = lazy(() => import('@/components/charts/OccupancyTrendChart'));
const ContractorComparisonChart = lazy(() => import('@/components/charts/ContractorComparisonChart'));
const PeakHoursHeatmap = lazy(() => import('@/components/charts/PeakHoursHeatmap'));
const ReportModal = lazy(() => import('@/components/modals/ReportModal'));

interface ParkingLot {
  _id: string;
  name: string;
  status: string;
}

export default function AnalyticsPage() {
  // Date range state - default to last 30 days
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());

  // Filter state
  const [selectedParkingLot, setSelectedParkingLot] = useState<string>('all');
  const [interval, setInterval] = useState<'hour' | 'day'>('day');

  // Parking lots for filter
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loadingLots, setLoadingLots] = useState(true);

  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fetch parking lots for filter dropdown
  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        setLoadingLots(true);
        const response = await fetch('/api/parking-lots?status=active&limit=100');
        if (response.ok) {
          const result = await response.json();
          setParkingLots(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching parking lots:', err);
      } finally {
        setLoadingLots(false);
      }
    };

    fetchParkingLots();
  }, []);

  const handleDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  // Determine interval based on date range
  useEffect(() => {
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7) {
      setInterval('hour');
    } else {
      setInterval('day');
    }
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] mb-2">Analytics</h1>
          <p className="text-gray-600 dark:text-[#9ca3af]">
            Comprehensive insights into parking operations and contractor performance
          </p>
        </div>
        <Button
          onClick={() => setIsReportModalOpen(true)}
        >
          <FileText className="w-5 h-5" />
          Generate Report
        </Button>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Date Range Picker */}
        <div className="lg:col-span-1">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {/* Additional Filters */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600 dark:text-[#9ca3af]" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-[#d1d5db]">Filters</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Parking Lot Filter */}
              <div>
                <label htmlFor="parking-lot-filter" className="block text-xs font-medium text-gray-700 dark:text-[#d1d5db] mb-2">
                  Parking Lot
                </label>
                <Select
                  value={selectedParkingLot}
                  onValueChange={(value) => setSelectedParkingLot(value)}
                  disabled={loadingLots}
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

              {/* Interval Selector */}
              <div>
                <label htmlFor="interval-selector" className="block text-xs font-medium text-gray-700 dark:text-[#d1d5db] mb-2">
                  Data Interval
                </label>
                <Select
                  value={interval}
                  onValueChange={(value) => setInterval(value as 'hour' | 'day')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Hourly</SelectItem>
                    <SelectItem value="day">Daily</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-[#71717a] mt-1">
                  {interval === 'hour' ? 'Best for short periods (≤7 days)' : 'Best for longer periods (>7 days)'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Sections */}
      <div className="space-y-6">
        {/* Section 1: Occupancy Trends */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb]">Occupancy Trends</h2>
          </div>
          <Suspense fallback={<SkeletonRectangle width="100%" height="400px" />}>
            <OccupancyTrendChart
              startDate={startDate}
              endDate={endDate}
              parkingLotId={selectedParkingLot === 'all' ? undefined : selectedParkingLot}
              interval={interval}
            />
          </Suspense>
        </div>

        {/* Section 2: Contractor Performance */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb]">Contractor Performance</h2>
          </div>
          <Suspense fallback={<SkeletonRectangle width="100%" height="400px" />}>
            <ContractorComparisonChart startDate={startDate} endDate={endDate} />
          </Suspense>
        </div>

        {/* Section 3: Peak Hours Analysis */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb]">Peak Hours Analysis</h2>
          </div>
          <Suspense fallback={<SkeletonRectangle width="100%" height="400px" />}>
            <PeakHoursHeatmap
              startDate={startDate}
              endDate={endDate}
              parkingLotId={selectedParkingLot === 'all' ? undefined : selectedParkingLot}
            />
          </Suspense>
        </div>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">About Analytics</h3>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <p>
              <strong>Occupancy Trends:</strong> Track how parking lot occupancy changes over time. Use this to
              identify patterns and optimize capacity allocation.
            </p>
            <p>
              <strong>Contractor Performance:</strong> Compare compliance rates and violation counts across all
              contractors. Lower compliance rates indicate frequent capacity breaches.
            </p>
            <p>
              <strong>Peak Hours Analysis:</strong> Visualize parking usage patterns by day of week and hour of
              day. Use this to identify peak times and plan accordingly.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Report Modal */}
      {isReportModalOpen && (
        <Suspense fallback={null}>
          <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
