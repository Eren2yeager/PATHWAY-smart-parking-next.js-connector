'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Users,
  AlertTriangle,
  Calendar,
  Mail,
  Phone,
  User,
  Edit,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  MapPin,
} from 'lucide-react';
import PerformanceChart from '@/components/charts/PerformanceChart';
import { Button } from '@/components/shadcnComponents/button';
import { Badge } from '@/components/shadcnComponents/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcnComponents/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/shadcnComponents/sheet';
import ContractorForm from '@/components/forms/ContractorForm';

interface Contractor {
  _id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  contractDetails: {
    startDate: string;
    endDate: string;
    allocatedCapacity: number;
    penaltyPerViolation: number;
  };
  status: 'active' | 'suspended' | 'terminated';
  createdAt: string;
  updatedAt: string;
  assignedParkingLots?: Array<{
    _id: string;
    name: string;
    location: {
      address: string;
    };
    totalSlots: number;
    status: string;
    currentOccupancy?: {
      occupied: number;
      empty: number;
      occupancyRate: number;
      lastUpdated: string;
    } | null;
  }>;
  currentTotalOccupancy?: number;
}

interface Performance {
  contractorId: string;
  contractorName: string;
  dateRange: {
    start: string;
    end: string;
  };
  complianceRate: number;
  violations: {
    total: number;
    pending: number;
    acknowledged: number;
    resolved: number;
    recent: Array<{
      _id: string;
      violationType: string;
      timestamp: string;
      details: {
        allocatedCapacity: number;
        actualOccupancy: number;
        excessVehicles: number;
        duration: number;
      };
      penalty: number;
      status: string;
      parkingLotId: {
        _id: string;
        name: string;
        location: {
          address: string;
        };
      };
    }>;
  };
  totalPenalties: number;
  occupancyTrends: Array<{
    date: string;
    avgOccupancy: number;
    avgOccupancyRate: number;
    totalSlots: number;
  }>;
  totalCapacityChecks: number;
}

function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'secondary' {
  switch (status) {
    case 'active':
      return 'success';
    case 'suspended':
      return 'warning';
    case 'terminated':
      return 'error';
    default:
      return 'secondary';
  }
}

function getViolationStatusVariant(status: string): 'success' | 'warning' | 'error' | 'secondary' {
  switch (status) {
    case 'pending':
      return 'error';
    case 'acknowledged':
      return 'warning';
    case 'resolved':
      return 'success';
    default:
      return 'secondary';
  }
}

function getOccupancyColor(occupancy: number, allocated: number): string {
  const percentage = (occupancy / allocated) * 100;
  if (percentage > 100) {
    return 'text-red-600 dark:text-red-400 font-bold';
  } else if (percentage >= 90) {
    return 'text-yellow-600 dark:text-yellow-400 font-semibold';
  } else {
    return 'text-green-600 dark:text-green-400';
  }
}

export default function ContractorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  const isAdmin = session?.user?.role === 'admin';
  const contractorId = params.id as string;

  const fetchContractor = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(`/api/contractors/${contractorId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Contractor not found');
        }
        throw new Error('Failed to fetch contractor details');
      }

      const result = await response.json();
      setContractor(result.data);
    } catch (err: any) {
      console.error('Error fetching contractor:', err);
      setError(err.message || 'Failed to load contractor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async () => {
    try {
      setPerformanceLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
      }

      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(`/api/contractors/${contractorId}/performance?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }

      const result = await response.json();
      setPerformance(result.data);
    } catch (err) {
      console.error('Error fetching performance:', err);
    } finally {
      setPerformanceLoading(false);
    }
  };

  useEffect(() => {
    fetchContractor();
  }, [contractorId]);

  useEffect(() => {
    if (contractor) {
      fetchPerformance();
    }
  }, [contractor, dateRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-[#2a2e37] rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-[#2a2e37] rounded mb-6"></div>
          <div className="h-96 bg-gray-200 dark:bg-[#2a2e37] rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="space-y-6">
        <Link
          href="/contractors"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-[#818cf8] hover:text-blue-700 dark:hover:text-[#a5b4fc]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contractors
        </Link>
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <p className="text-red-800 dark:text-red-300 mb-4">{error || 'Contractor not found'}</p>
            <Button
              onClick={() => router.push('/contractors')}
              variant="destructive"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalOccupancy = contractor.currentTotalOccupancy || 0;
  const allocatedCapacity = contractor.contractDetails.allocatedCapacity;
  const isOverCapacity = totalOccupancy > allocatedCapacity;
  const occupancyPercentage = (totalOccupancy / allocatedCapacity) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/contractors"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-[#818cf8] hover:text-blue-700 dark:hover:text-[#a5b4fc] mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb]">{contractor.name}</h1>
              <Badge variant={getStatusVariant(contractor.status)}>
                {contractor.status.charAt(0).toUpperCase() + contractor.status.slice(1)}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-[#9ca3af]">Contractor Details and Performance Metrics</p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsEditSheetOpen(true)}>
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        )}
      </div>

      {/* Contractor Information Card */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb] mb-4">Contractor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 dark:text-[#71717a] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-[#71717a]">Contact Person</p>
                  <p className="text-base font-medium text-gray-900 dark:text-[#e5e7eb]">{contractor.contactPerson}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 dark:text-[#71717a] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-[#71717a]">Email</p>
                  <p className="text-base font-medium text-gray-900 dark:text-[#e5e7eb]">{contractor.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 dark:text-[#71717a] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-[#71717a]">Phone</p>
                  <p className="text-base font-medium text-gray-900 dark:text-[#e5e7eb]">{contractor.phone}</p>
                </div>
              </div>
            </div>

            {/* Contract Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 dark:text-[#71717a] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-[#71717a]">Contract Period</p>
                  <p className="text-base font-medium text-gray-900 dark:text-[#e5e7eb]">
                    {new Date(contractor.contractDetails.startDate).toLocaleDateString()} -{' '}
                    {new Date(contractor.contractDetails.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 dark:text-[#71717a] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-[#71717a]">Allocated Capacity</p>
                  <p className="text-base font-medium text-gray-900 dark:text-[#e5e7eb]">
                    {allocatedCapacity} slots
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 dark:text-[#71717a] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-[#71717a]">Penalty Per Violation</p>
                  <p className="text-base font-medium text-gray-900 dark:text-[#e5e7eb]">
                    ₹{contractor.contractDetails.penaltyPerViolation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Occupancy Overview */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb] mb-4">Current Total Occupancy</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-[#0a0b0d] rounded-lg border border-gray-100 dark:border-[#2a2e37]">
              <p className="text-sm text-gray-500 dark:text-[#71717a] mb-2">Allocated Capacity</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb]">{allocatedCapacity}</p>
              <p className="text-xs text-gray-500 dark:text-[#71717a] mt-1">slots</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-[#0a0b0d] rounded-lg border border-gray-100 dark:border-[#2a2e37]">
              <p className="text-sm text-gray-500 dark:text-[#71717a] mb-2">Current Occupancy</p>
              <p className={`text-3xl font-bold ${getOccupancyColor(totalOccupancy, allocatedCapacity)}`}>
                {totalOccupancy}
              </p>
              <p className="text-xs text-gray-500 dark:text-[#71717a] mt-1">vehicles</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-[#0a0b0d] rounded-lg border border-gray-100 dark:border-[#2a2e37]">
              <p className="text-sm text-gray-500 dark:text-[#71717a] mb-2">Utilization</p>
              <p className={`text-3xl font-bold ${getOccupancyColor(totalOccupancy, allocatedCapacity)}`}>
                {occupancyPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-[#71717a] mt-1">of capacity</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-[#0a0b0d] rounded-lg border border-gray-100 dark:border-[#2a2e37]">
              <p className="text-sm text-gray-500 dark:text-[#71717a] mb-2">Status</p>
              <div className="flex items-center justify-center gap-2">
                {isOverCapacity ? (
                  <>
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">Over Capacity</p>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">Within Limit</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Parking Lots */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-gray-500 dark:text-[#71717a]" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb]">
              Assigned Parking Lots ({contractor.assignedParkingLots?.length || 0})
            </h2>
          </div>
          {contractor.assignedParkingLots && contractor.assignedParkingLots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contractor.assignedParkingLots.map((lot) => (
                <Link key={lot._id} href={`/parking-lots/${lot._id}`}>
                  <div className="p-4 border-2 border-gray-200 dark:border-[#2a2e37] rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition cursor-pointer bg-white dark:bg-[#111316]">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-[#e5e7eb]">{lot.name}</h3>
                      <Badge variant={lot.status === 'active' ? 'success' : 'secondary'}>
                        {lot.status}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-gray-400 dark:text-[#71717a] mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-[#9ca3af]">{lot.location.address}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-[#2a2e37]">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400 dark:text-[#71717a]" />
                        <span className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb]">
                          {lot.currentOccupancy?.occupied || 0} / {lot.totalSlots}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-[#9ca3af]">
                        {lot.currentOccupancy
                          ? `${lot.currentOccupancy.occupancyRate.toFixed(1)}%`
                          : '0%'}
                      </span>
                    </div>
                    {lot.currentOccupancy?.lastUpdated && (
                      <p className="text-xs text-gray-400 dark:text-[#71717a] mt-2">
                        Updated: {new Date(lot.currentOccupancy.lastUpdated).toLocaleString()}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-[#71717a]">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-[#3a3f4b]" />
              <p>No parking lots assigned to this contractor</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-500 dark:text-[#71717a]" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb]">Performance Metrics</h2>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={dateRange === '7d' ? 'default' : 'outline'}
                onClick={() => setDateRange('7d')}
              >
                7 Days
              </Button>
              <Button
                size="sm"
                variant={dateRange === '30d' ? 'default' : 'outline'}
                onClick={() => setDateRange('30d')}
              >
                30 Days
              </Button>
              <Button
                size="sm"
                variant={dateRange === '90d' ? 'default' : 'outline'}
                onClick={() => setDateRange('90d')}
              >
                90 Days
              </Button>
            </div>
          </div>

          {performanceLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 dark:bg-[#2a2e37] rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 dark:bg-[#2a2e37] rounded"></div>
            </div>
          ) : performance ? (
            <>
              {/* Performance Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">Compliance Rate</p>
                  <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {performance.complianceRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                    {performance.totalCapacityChecks} checks
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">Total Violations</p>
                  <p className="text-3xl font-bold text-red-700 dark:text-red-300">{performance.violations.total}</p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                    {performance.violations.pending} pending
                  </p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">Total Penalties</p>
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                    ₹{performance.totalPenalties.toLocaleString()}
                  </p>
                  <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-1">accumulated</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-2">Resolved</p>
                  <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {performance.violations.resolved}
                  </p>
                  <p className="text-xs text-green-500 dark:text-green-400 mt-1">violations</p>
                </div>
              </div>

              {/* Performance Chart */}
              <PerformanceChart
                occupancyTrends={performance.occupancyTrends}
                allocatedCapacity={allocatedCapacity}
              />
            </>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-[#71717a]">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-[#3a3f4b]" />
              <p>No performance data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Violation History */}
      {performance && performance.violations.recent.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-gray-500 dark:text-[#71717a]" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb]">Recent Violations</h2>
            </div>
            <div className="space-y-3">
              {performance.violations.recent.map((violation) => (
                <div
                  key={violation._id}
                  className="p-4 border border-gray-200 dark:border-[#2a2e37] rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition bg-white dark:bg-[#111316]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-gray-900 dark:text-[#e5e7eb]">
                          {violation.parkingLotId.name}
                        </h3>
                        <Badge variant={getViolationStatusVariant(violation.status)}>
                          {violation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-[#9ca3af] mb-2">
                        {violation.parkingLotId.location.address}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-[#9ca3af]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(violation.timestamp).toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {violation.details.excessVehicles} excess vehicles
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm text-gray-500 dark:text-[#71717a] mb-1">Penalty</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        ₹{violation.penalty.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200 dark:border-[#2a2e37] text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-[#71717a]">Allocated</p>
                      <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                        {violation.details.allocatedCapacity}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-[#71717a]">Actual</p>
                      <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                        {violation.details.actualOccupancy}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-[#71717a]">Duration</p>
                      <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                        {violation.details.duration} min
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {performance.violations.total > performance.violations.recent.length && (
              <div className="mt-4 text-center">
                <Link
                  href={`/violations?contractorId=${contractorId}`}
                  className="text-blue-600 dark:text-[#818cf8] hover:text-blue-700 dark:hover:text-[#a5b4fc] text-sm font-medium"
                >
                  View All Violations ({performance.violations.total})
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Contractor Sheet */}
      {isAdmin && (
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent 
            side="right" 
            className="w-full sm:max-w-2xl overflow-y-auto bg-white dark:bg-[#111316] border-gray-200 dark:border-[#2a2e37]"
          >
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb]">
                Edit Contractor
              </SheetTitle>
              <SheetDescription className="text-gray-600 dark:text-[#9ca3af]">
                Update contractor information
              </SheetDescription>
            </SheetHeader>
            <div className="px-6 py-6">
              <ContractorForm
                mode="edit"
                initialData={{
                  _id: contractor._id,
                  name: contractor.name,
                  contactPerson: contractor.contactPerson,
                  phone: contractor.phone,
                  email: contractor.email,
                  contractDetails: contractor.contractDetails,
                  status: contractor.status,
                }}
                onSuccess={() => {
                  setIsEditSheetOpen(false);
                  fetchContractor();
                }}
                onCancel={() => setIsEditSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
