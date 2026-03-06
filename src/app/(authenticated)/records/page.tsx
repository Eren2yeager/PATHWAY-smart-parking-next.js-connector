'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, AlertTriangle } from 'lucide-react';
import VehicleRecordTable from '@/components/tables/VehicleRecordTable';
import RecordFilters, { FilterValues } from '@/components/dashboard/RecordFilters';
import { exportFilteredRecords } from '@/lib/reporting/export-csv';
import { Button } from '@/components/shadcnComponents/button';
import { Card, CardContent } from '@/components/shadcnComponents/card';
import { Badge } from '@/components/shadcnComponents/badge';

interface VehicleRecord {
  _id: string;
  plateNumber: string;
  parkingLotId: {
    _id: string;
    name: string;
  };
  entry: {
    timestamp: string;
  };
  exit?: {
    timestamp: string;
  };
  duration?: number;
  status: 'inside' | 'exited';
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<VehicleRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<FilterValues>({
    parkingLotId: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchRecords = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());

      if (filters.parkingLotId) {
        params.append('parkingLotId', filters.parkingLotId);
      }
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      const response = await fetch(`/api/records?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch vehicle records');
      }

      const data = await response.json();
      setRecords(data.data || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to load vehicle records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1);
  }, [filters]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    fetchRecords(page);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportFilteredRecords({
        parkingLotId: filters.parkingLotId || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
    } catch (err) {
      console.error('Error exporting records:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchRecords(pagination.page);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb]">Vehicle Records</h1>
          <p className="text-gray-600 dark:text-[#9ca3af] mt-1">
            View and export vehicle entry and exit records
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || loading || records.length === 0}
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <RecordFilters onFilterChange={handleFilterChange} />

      {/* Stats */}
      {!loading && !error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-sm text-gray-600 dark:text-[#9ca3af]">
                Showing <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">{records.length}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-[#e5e7eb]">{pagination.total}</span> records
              </div>
              {(filters.parkingLotId || filters.status || filters.startDate || filters.endDate) && (
                <Badge variant="secondary">
                  Filters applied
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
            <Button onClick={handleRefresh} variant="destructive" className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="ml-3 text-gray-600 dark:text-[#9ca3af]">Loading records...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {!loading && !error && (
        <VehicleRecordTable
          records={records}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

     
    </div>
  );
}
