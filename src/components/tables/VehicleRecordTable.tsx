"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/shadcnComponents/button";
import { Badge } from "@/components/shadcnComponents/badge";
import { Card, CardContent } from "@/components/shadcnComponents/card";

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
  status: "inside" | "exited";
}

interface VehicleRecordTableProps {
  records: VehicleRecord[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type SortField =
  | "plateNumber"
  | "parkingLot"
  | "entry"
  | "exit"
  | "duration"
  | "status";
type SortDirection = "asc" | "desc" | null;

export default function VehicleRecordTable({
  records,
  currentPage,
  totalPages,
  onPageChange,
}: VehicleRecordTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedRecords = () => {
    if (!sortField || !sortDirection) {
      return records;
    }

    return [...records].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "plateNumber":
          aValue = a.plateNumber;
          bValue = b.plateNumber;
          break;
        case "parkingLot":
          aValue = a.parkingLotId.name;
          bValue = b.parkingLotId.name;
          break;
        case "entry":
          aValue = new Date(a.entry.timestamp).getTime();
          bValue = new Date(b.entry.timestamp).getTime();
          break;
        case "exit":
          aValue = a.exit ? new Date(a.exit.timestamp).getTime() : 0;
          bValue = b.exit ? new Date(b.exit.timestamp).getTime() : 0;
          break;
        case "duration":
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <ChevronsUpDown className="w-4 h-4 text-gray-400 dark:text-[#71717a]" />
      );
    }
    if (sortDirection === "asc") {
      return <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
    return <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "-";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const sortedRecords = getSortedRecords();

  return (
    <Card>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-[#2a2e37]">
          <thead className="bg-gray-50 dark:bg-[#0a0b0d]">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#71717a] uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#111316]"
                onClick={() => handleSort("plateNumber")}
              >
                <div className="flex items-center space-x-1">
                  <span>Plate Number</span>
                  <SortIcon field="plateNumber" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#71717a] uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#111316]"
                onClick={() => handleSort("parkingLot")}
              >
                <div className="flex items-center space-x-1">
                  <span>Parking Lot</span>
                  <SortIcon field="parkingLot" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#71717a] uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#111316]"
                onClick={() => handleSort("entry")}
              >
                <div className="flex items-center space-x-1">
                  <span>Entry Time</span>
                  <SortIcon field="entry" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#71717a] uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#111316]"
                onClick={() => handleSort("exit")}
              >
                <div className="flex items-center space-x-1">
                  <span>Exit Time</span>
                  <SortIcon field="exit" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#71717a] uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#111316]"
                onClick={() => handleSort("duration")}
              >
                <div className="flex items-center space-x-1">
                  <span>Duration</span>
                  <SortIcon field="duration" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#71717a] uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-[#111316]"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#111316] divide-y divide-gray-200 dark:divide-[#2a2e37]">
            {sortedRecords.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-gray-500 dark:text-[#71717a]"
                >
                  <div className="text-gray-400 dark:text-[#71717a] mb-4">
                    <svg
                      className="mx-auto h-12 w-12"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-[#e5e7eb] mb-2">
                    No records found
                  </h3>
                  <p className="text-gray-500 dark:text-[#71717a]">
                    Try adjusting your filters to see more results
                  </p>
                </td>
              </tr>
            ) : (
              sortedRecords.map((record) => (
                <tr
                  key={record._id}
                  className="hover:bg-gray-50 dark:hover:bg-[#0a0b0d]"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb]">
                      {record.plateNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-[#e5e7eb]">
                      {record.parkingLotId.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-[#e5e7eb]">
                      {format(new Date(record.entry.timestamp), "MMM dd, yyyy")}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-[#71717a]">
                      {format(new Date(record.entry.timestamp), "hh:mm a")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.exit ? (
                      <>
                        <div className="text-sm text-gray-900 dark:text-[#e5e7eb]">
                          {format(
                            new Date(record.exit.timestamp),
                            "MMM dd, yyyy",
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-[#71717a]">
                          {format(new Date(record.exit.timestamp), "hh:mm a")}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500 dark:text-[#71717a]">
                        -
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-[#e5e7eb]">
                      {formatDuration(record.duration)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge
                      variant={
                        record.status === "inside" ? "success" : "secondary"
                      }
                    >
                      {record.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white dark:bg-[#111316] px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-[#2a2e37] sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-[#d1d5db]">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="rounded-r-none"
                >
                  Previous
                </Button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="rounded-none"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="rounded-l-none"
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
