'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Filter, Calendar as CalendarIcon, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import ViolationCard from '@/components/cards/ViolationCard';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/shadcnComponents/button';
import { Card, CardContent } from '@/components/shadcnComponents/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcnComponents/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcnComponents/popover';
import { Calendar } from '@/components/shadcnComponents/calendar';

interface Violation {
  _id: string;
  contractorId: {
    _id: string;
    name: string;
    email: string;
  };
  parkingLotId: {
    _id: string;
    name: string;
    location?: {
      address: string;
    };
  };
  violationType: 'overparking' | 'unauthorized_vehicle' | 'capacity_breach';
  timestamp: string;
  details: {
    allocatedCapacity: number;
    actualOccupancy: number;
    excessVehicles: number;
    duration: number;
  };
  penalty: number;
  status: 'pending' | 'acknowledged' | 'resolved';
  resolvedAt?: string;
  resolvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  notes?: string;
  createdAt: string;
}

interface Contractor {
  _id: string;
  name: string;
}

interface TrendData {
  date: string;
  violations: number;
}

export default function ViolationsPage() {
  const { data: session } = useSession();
  const [violations, setViolations] = useState<Violation[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'acknowledged' | 'resolved'>('all');
  const [contractorFilter, setContractorFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Trend data
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  const fetchContractors = async () => {
    try {
      const response = await fetch('/api/contractors');
      if (!response.ok) {
        throw new Error('Failed to fetch contractors');
      }
      const result = await response.json();
      setContractors(result.data || []);
    } catch (err) {
      console.error('Error fetching contractors:', err);
    }
  };

  const fetchViolations = async () => {
    try {
      setError(null);
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      if (contractorFilter !== 'all') {
        params.append('contractorId', contractorFilter);
      }

      // Date range
      let startDate: Date;
      let endDate: Date = new Date();

      if (dateRange === 'custom' && customStartDate && customEndDate) {
        startDate = startOfDay(new Date(customStartDate));
        endDate = endOfDay(new Date(customEndDate));
      } else {
        const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
        startDate = subDays(endDate, days);
      }

      params.append('startDate', startDate.toISOString());
      params.append('endDate', endDate.toISOString());
      params.append('limit', '100');

      const response = await fetch(`/api/violations?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch violations');
      }

      const result = await response.json();
      setViolations(result.data || []);

      // Calculate trend data
      calculateTrendData(result.data || [], startDate, endDate);
    } catch (err) {
      console.error('Error fetching violations:', err);
      setError('Failed to load violations');
    } finally {
      setLoading(false);
    }
  };

  const calculateTrendData = (violationsData: Violation[], startDate: Date, endDate: Date) => {
    // Group violations by date
    const violationsByDate: { [key: string]: number } = {};
    
    violationsData.forEach((violation) => {
      const date = format(new Date(violation.timestamp), 'yyyy-MM-dd');
      violationsByDate[date] = (violationsByDate[date] || 0) + 1;
    });

    // Create trend data for all dates in range
    const trend: TrendData[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      trend.push({
        date: format(currentDate, 'MMM dd'),
        violations: violationsByDate[dateStr] || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setTrendData(trend);
  };

  useEffect(() => {
    fetchContractors();
  }, []);

  useEffect(() => {
    fetchViolations();
  }, [statusFilter, contractorFilter, dateRange, customStartDate, customEndDate]);

  const handleViolationUpdate = () => {
    fetchViolations();
  };

  // Calculate statistics
  const stats = {
    total: violations.length,
    pending: violations.filter((v) => v.status === 'pending').length,
    acknowledged: violations.filter((v) => v.status === 'acknowledged').length,
    resolved: violations.filter((v) => v.status === 'resolved').length,
    totalPenalty: violations.reduce((sum, v) => sum + v.penalty, 0),
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] mb-2">Violations</h1>
        <p className="text-gray-600 dark:text-[#9ca3af]">Monitor and manage contractor violations</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb]">{stats.total}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-gray-400 dark:text-[#71717a]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Pending</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.pending}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400 dark:text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Acknowledged</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.acknowledged}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400 dark:text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Resolved</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400 dark:text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Total Penalty</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb]">₹{stats.totalPenalty}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-400 dark:text-[#71717a]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Violation Trend Chart */}
      {trendData.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb] mb-4">Violation Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    color: '#e5e7eb'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="violations"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Violations"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-[#71717a]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2">Status</label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contractor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2">Contractor</label>
              <Select
                value={contractorFilter}
                onValueChange={(value) => setContractorFilter(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Contractors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Contractors</SelectItem>
                  {contractors.map((contractor) => (
                    <SelectItem key={contractor._id} value={contractor._id}>
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2">Date Range</label>
              <Select
                value={dateRange}
                onValueChange={(value) => setDateRange(value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Last 30 Days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Range */}
            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2">Start Date</label>
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
                          } else {
                            setCustomStartDate('');
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2">End Date</label>
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
                          } else {
                            setCustomEndDate('');
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
              </>
            )}
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mt-4 text-sm text-gray-600 dark:text-[#9ca3af]">
              Showing {violations.length} violation{violations.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 dark:bg-[#2a2e37] rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-[#2a2e37] rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 dark:bg-[#2a2e37] rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-[#2a2e37] rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <p className="text-red-800 dark:text-red-300 mb-4">{error}</p>
            <Button onClick={fetchViolations} variant="destructive">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : violations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 dark:text-[#71717a] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-[#9ca3af] mb-2">No violations found</p>
            <p className="text-sm text-gray-500 dark:text-[#71717a]">
              {statusFilter !== 'all' || contractorFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No violations have been recorded in this time period'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {violations.map((violation) => (
            <ViolationCard
              key={violation._id}
              violation={violation}
              onUpdate={handleViolationUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
