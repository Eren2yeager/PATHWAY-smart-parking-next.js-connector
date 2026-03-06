'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/shadcnComponents/card';

interface HeatmapData {
  dayOfWeek: number;
  hour: number;
  avgOccupied: number;
  avgOccupancyRate: number;
  maxOccupied: number;
  minOccupied: number;
  dataPoints: number;
}

interface PeakHoursHeatmapProps {
  startDate: Date;
  endDate: Date;
  parkingLotId?: string;
}

export default function PeakHoursHeatmap({
  startDate,
  endDate,
  parkingLotId,
}: PeakHoursHeatmapProps) {
  const [data, setData] = useState<{
    heatmap: HeatmapData[];
    matrix: number[][];
    dayLabels: string[];
    hourLabels: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPeakHours = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });

        if (parkingLotId) {
          params.append('parkingLotId', parkingLotId);
        }

        const response = await fetch(`/api/analytics/peak-hours?${params}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch peak hours data');
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        console.error('Error fetching peak hours:', err);
        setError(err instanceof Error ? err.message : 'Failed to load peak hours data');
      } finally {
        setLoading(false);
      }
    };

    fetchPeakHours();
  }, [startDate, endDate, parkingLotId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb] mb-4">Peak Hours Analysis</h3>
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-gray-400 dark:text-[#71717a]">Loading heatmap...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb] mb-4">Peak Hours Analysis</h3>
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 dark:text-red-400 mb-2">{error}</p>
              <p className="text-sm text-gray-500 dark:text-[#71717a]">Please try adjusting your filters</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.heatmap.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb] mb-4">Peak Hours Analysis</h3>
          <div className="h-96 flex items-center justify-center">
            <p className="text-gray-500 dark:text-[#71717a]">No peak hours data available for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get color based on occupancy rate
  const getHeatmapColor = (rate: number) => {
    if (rate === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (rate < 20) return 'bg-green-100 dark:bg-green-900/40';
    if (rate < 40) return 'bg-green-300 dark:bg-green-700/50';
    if (rate < 60) return 'bg-yellow-300 dark:bg-yellow-700/50';
    if (rate < 80) return 'bg-orange-400 dark:bg-orange-700/60';
    if (rate < 90) return 'bg-red-400 dark:bg-red-700/60';
    return 'bg-red-600 dark:bg-red-800';
  };

  // Get text color based on occupancy rate
  const getTextColor = (rate: number) => {
    if (rate >= 80) return 'text-white';
    return 'text-gray-900 dark:text-[#e5e7eb]';
  };

  // Find peak hour
  const peakData = data.heatmap.reduce((max, item) =>
    item.avgOccupancyRate > max.avgOccupancyRate ? item : max
  );
  const peakDay = data.dayLabels[peakData.dayOfWeek - 1];
  const peakHour = data.hourLabels[peakData.hour];

  // Calculate average occupancy by day
  const avgByDay = data.dayLabels.map((day, dayIndex) => {
    const dayData = data.matrix[dayIndex].filter((rate) => rate > 0);
    const avg = dayData.length > 0 ? dayData.reduce((sum, rate) => sum + rate, 0) / dayData.length : 0;
    return { day, avg };
  });

  // Calculate average occupancy by hour
  const avgByHour = data.hourLabels.map((hour, hourIndex) => {
    const hourData = data.matrix.map((dayRow) => dayRow[hourIndex]).filter((rate) => rate > 0);
    const avg = hourData.length > 0 ? hourData.reduce((sum, rate) => sum + rate, 0) / hourData.length : 0;
    return { hour, avg };
  });

  const busiestDay = avgByDay.reduce((max, item) => (item.avg > max.avg ? item : max));
  const busiestHour = avgByHour.reduce((max, item) => (item.avg > max.avg ? item : max));

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb] mb-2">Peak Hours Analysis</h3>
          <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
            Occupancy heatmap by day of week and hour of day
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 border border-red-100 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Peak Time</p>
            <p className="text-lg font-bold text-red-900 dark:text-red-300">
              {peakDay} at {peakHour}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{peakData.avgOccupancyRate.toFixed(1)}% occupancy</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Busiest Day</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-300">{busiestDay.day}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{busiestDay.avg.toFixed(1)}% avg occupancy</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-100 dark:border-purple-800">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Busiest Hour</p>
            <p className="text-lg font-bold text-purple-900 dark:text-purple-300">{busiestHour.hour}</p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">{busiestHour.avg.toFixed(1)}% avg occupancy</p>
          </div>
        </div>

        {/* Heatmap */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 dark:border-[#2a2e37] bg-gray-50 dark:bg-[#0a0b0d] px-3 py-2 text-xs font-medium text-gray-700 dark:text-[#d1d5db] sticky left-0 z-10">
                    Day / Hour
                  </th>
                  {data.hourLabels.map((hour, index) => (
                    <th
                      key={index}
                      className="border border-gray-300 dark:border-[#2a2e37] bg-gray-50 dark:bg-[#0a0b0d] px-2 py-2 text-xs font-medium text-gray-700 dark:text-[#d1d5db] min-w-[60px]"
                    >
                      {hour}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.dayLabels.map((day, dayIndex) => (
                  <tr key={dayIndex}>
                    <td className="border border-gray-300 dark:border-[#2a2e37] bg-gray-50 dark:bg-[#0a0b0d] px-3 py-2 text-xs font-medium text-gray-700 dark:text-[#d1d5db] sticky left-0 z-10 whitespace-nowrap">
                      {day}
                    </td>
                    {data.matrix[dayIndex].map((rate, hourIndex) => (
                      <td
                        key={hourIndex}
                        className={`border border-gray-300 dark:border-[#2a2e37] px-2 py-3 text-center text-xs font-medium ${getHeatmapColor(
                          rate
                        )} ${getTextColor(rate)} transition-colors hover:opacity-80 cursor-pointer`}
                        title={`${day} at ${data.hourLabels[hourIndex]}: ${rate.toFixed(1)}% occupancy`}
                      >
                        {rate > 0 ? rate.toFixed(0) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="text-gray-600 dark:text-[#9ca3af] font-medium">Occupancy Rate:</span>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-[#2a2e37] rounded"></div>
            <span className="text-gray-600 dark:text-[#9ca3af]">No Data</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 bg-green-100 dark:bg-green-900/40 border border-gray-300 dark:border-[#2a2e37] rounded"></div>
            <span className="text-gray-600 dark:text-[#9ca3af]">0-20%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 bg-green-300 dark:bg-green-700/50 border border-gray-300 dark:border-[#2a2e37] rounded"></div>
            <span className="text-gray-600 dark:text-[#9ca3af]">20-40%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 bg-yellow-300 dark:bg-yellow-700/50 border border-gray-300 dark:border-[#2a2e37] rounded"></div>
            <span className="text-gray-600 dark:text-[#9ca3af]">40-60%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 bg-orange-400 dark:bg-orange-700/60 border border-gray-300 dark:border-[#2a2e37] rounded"></div>
            <span className="text-gray-600 dark:text-[#9ca3af]">60-80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 bg-red-400 dark:bg-red-700/60 border border-gray-300 dark:border-[#2a2e37] rounded"></div>
            <span className="text-gray-600 dark:text-[#9ca3af]">80-90%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-4 bg-red-600 dark:bg-red-800 border border-gray-300 dark:border-[#2a2e37] rounded"></div>
            <span className="text-gray-600 dark:text-[#9ca3af]">90-100%</span>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Insights</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>
              • Peak usage occurs on <strong>{peakDay}</strong> at <strong>{peakHour}</strong> with{' '}
              <strong>{peakData.avgOccupancyRate.toFixed(1)}%</strong> occupancy
            </li>
            <li>
              • <strong>{busiestDay.day}</strong> is the busiest day with an average occupancy of{' '}
              <strong>{busiestDay.avg.toFixed(1)}%</strong>
            </li>
            <li>
              • <strong>{busiestHour.hour}</strong> is the busiest hour with an average occupancy of{' '}
              <strong>{busiestHour.avg.toFixed(1)}%</strong>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
