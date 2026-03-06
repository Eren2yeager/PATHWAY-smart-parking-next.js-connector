'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, Search, Filter, Building2, Users, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/shadcnComponents/button';
import { Badge } from '@/components/shadcnComponents/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcnComponents/card';
import { Input } from '@/components/shadcnComponents/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcnComponents/select';
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
    totalSlots: number;
    currentOccupancy?: {
      occupied: number;
      empty: number;
      occupancyRate: number;
    } | null;
  }>;
  currentTotalOccupancy?: number;
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

export default function ContractorsPage() {
  const { data: session } = useSession();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'terminated'>(
    'all'
  );
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

  const isAdmin = session?.user?.role === 'admin';

  const fetchContractors = async () => {
    try {
      setError(null);
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/contractors?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch contractors');
      }

      const result = await response.json();
      
      // Fetch additional details for each contractor
      const contractorsWithDetails = await Promise.all(
        (result.data || []).map(async (contractor: Contractor) => {
          try {
            const detailResponse = await fetch(`/api/contractors/${contractor._id}`);
            if (detailResponse.ok) {
              const detailResult = await detailResponse.json();
              return detailResult.data;
            }
          } catch (err) {
            console.error(`Error fetching details for contractor ${contractor._id}:`, err);
          }
          return contractor;
        })
      );

      setContractors(contractorsWithDetails);
    } catch (err) {
      console.error('Error fetching contractors:', err);
      setError('Failed to load contractors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
  }, [statusFilter]);

  // Filter contractors by search query
  const filteredContractors = contractors.filter((contractor) => {
    const matchesSearch =
      searchQuery === '' ||
      contractor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contractor.phone.includes(searchQuery);

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] mb-2">Contractors</h1>
          <p className="text-gray-600 dark:text-[#9ca3af]">Manage parking lot contractors and their allocations</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateSheetOpen(true)}>
            <Plus className="w-5 h-5" />
            Create New
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#71717a] w-5 h-5 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by name, contact person, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#71717a] w-5 h-5 pointer-events-none z-10" />
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as 'all' | 'active' | 'suspended' | 'terminated')
                }
              >
                <SelectTrigger className="w-full pl-10">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mt-4 text-sm text-gray-600 dark:text-[#9ca3af]">
              Showing {filteredContractors.length} of {contractors.length} contractor
              {contractors.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contractors List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
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
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
            <p className="text-red-800 dark:text-red-300 mb-4">{error}</p>
            <Button onClick={fetchContractors} variant="destructive">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredContractors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600 dark:text-[#9ca3af] mb-2">
              {searchQuery || statusFilter !== 'all'
                ? 'No contractors match your filters'
                : 'No contractors found'}
            </p>
            <p className="text-sm text-gray-500 dark:text-[#71717a]">
              {isAdmin && !searchQuery && statusFilter === 'all'
                ? 'Create a contractor to get started'
                : 'Try adjusting your search or filters'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredContractors.map((contractor) => {
            const totalOccupancy = contractor.currentTotalOccupancy || 0;
            const allocatedCapacity = contractor.contractDetails.allocatedCapacity;
            const isOverCapacity = totalOccupancy > allocatedCapacity;

            return (
              <Link key={contractor._id} href={`/contractors/${contractor._id}`}>
                <Card className="hover:shadow-lg transition-all border-2 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-[#e5e7eb]">{contractor.name}</h3>
                          <Badge variant={getStatusVariant(contractor.status)}>
                            {contractor.status.charAt(0).toUpperCase() + contractor.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-[#9ca3af] space-y-1">
                          <p>
                            <span className="font-medium text-gray-700 dark:text-[#d1d5db]">Contact:</span> {contractor.contactPerson}
                          </p>
                          <p>
                            <span className="font-medium text-gray-700 dark:text-[#d1d5db]">Email:</span> {contractor.email}
                          </p>
                          <p>
                            <span className="font-medium text-gray-700 dark:text-[#d1d5db]">Phone:</span> {contractor.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contract Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-[#0a0b0d] rounded-lg border border-gray-100 dark:border-[#2a2e37]">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Allocated Capacity</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">
                          {allocatedCapacity} slots
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Current Occupancy</p>
                        <p
                          className={`text-lg font-bold ${getOccupancyColor(
                            totalOccupancy,
                            allocatedCapacity
                          )}`}
                        >
                          {totalOccupancy} / {allocatedCapacity}
                          {isOverCapacity && (
                            <AlertTriangle className="inline-block w-4 h-4 ml-1" />
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Assigned Lots</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">
                          {contractor.assignedParkingLots?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Penalty Rate</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">
                          ₹{contractor.contractDetails.penaltyPerViolation}
                        </p>
                      </div>
                    </div>

                    {/* Assigned Parking Lots */}
                    {contractor.assignedParkingLots && contractor.assignedParkingLots.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-[#2a2e37] pt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Building2 className="w-4 h-4 text-gray-500 dark:text-[#71717a]" />
                          <p className="text-sm font-medium text-gray-700 dark:text-[#d1d5db]">Assigned Parking Lots</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {contractor.assignedParkingLots.map((lot) => (
                            <Link
                              key={lot._id}
                              href={`/parking-lots/${lot._id}`}
                              className="p-3 bg-gray-50 dark:bg-[#0a0b0d] rounded-lg border border-gray-200 dark:border-[#2a2e37] hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all cursor-pointer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="font-medium text-gray-900 dark:text-[#e5e7eb] text-sm mb-1">{lot.name}</p>
                              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-[#9ca3af]">
                                <span>
                                  <Users className="inline-block w-3 h-3 mr-1" />
                                  {lot.currentOccupancy?.occupied || 0} / {lot.totalSlots}
                                </span>
                                <span>
                                  {lot.currentOccupancy
                                    ? `${lot.currentOccupancy.occupancyRate.toFixed(1)}%`
                                    : '0%'}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contract Period */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2e37] text-xs text-gray-500 dark:text-[#71717a]">
                      Contract Period:{' '}
                      {new Date(contractor.contractDetails.startDate).toLocaleDateString()} -{' '}
                      {new Date(contractor.contractDetails.endDate).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Contractor Sheet */}
      {isAdmin && (
        <Sheet open={isCreateSheetOpen} onOpenChange={setIsCreateSheetOpen}>
          <SheetContent 
            side="right" 
            className="w-full sm:max-w-2xl overflow-y-auto bg-white dark:bg-[#111316] border-gray-200 dark:border-[#2a2e37]"
          >
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb]">
                Create New Contractor
              </SheetTitle>
              <SheetDescription className="text-gray-600 dark:text-[#9ca3af]">
                Add a new contractor to the system
              </SheetDescription>
            </SheetHeader>
            <div className="px-6 py-6">
              <ContractorForm
                mode="create"
                onSuccess={() => {
                  setIsCreateSheetOpen(false);
                  fetchContractors();
                }}
                onCancel={() => setIsCreateSheetOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
