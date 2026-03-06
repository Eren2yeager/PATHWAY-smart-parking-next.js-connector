"use client";

import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Users,
  Calendar,
  Camera,
  Activity,
  AlertCircle,
  Video,
  AlertTriangle,
  Image as ImageIcon,
  Edit,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SkeletonRectangle } from "@/components/misc/SkeletonLoader";
import { formatDuration } from "@/lib/utils/format-duration";
import { Button } from "@/components/shadcnComponents/button";
import { Badge } from "@/components/shadcnComponents/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcnComponents/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/shadcnComponents/sheet";
import ParkingLotForm from "@/components/forms/ParkingLotForm";

// Code-split heavy components
const SlotGrid = lazy(() => import("@/components/misc/SlotGrid"));
const DateRangePicker = lazy(() => import("@/components/forms/DateRangePicker"));

interface ParkingLot {
  _id: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  totalSlots: number;
  status: "active" | "inactive";
  contractorId: {
    _id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    status: string;
    contractDetails: {
      startDate: string;
      endDate: string;
      allocatedCapacity: number;
      penaltyPerViolation: number;
    };
  };
  gateCamera: {
    id: string;
    status: "active" | "inactive";
    lastSeen: string;
  };
  lotCamera: {
    id: string;
    status: "active" | "inactive";
    lastSeen: string;
  };
  slots: Array<{
    slotId: number;
    bbox: { x1: number; y1: number; x2: number; y2: number };
    status: "occupied" | "empty";
    lastUpdated: string;
  }>;
  currentOccupancy?: {
    occupied: number;
    empty: number;
    occupancyRate: number;
    lastUpdated: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface VehicleRecord {
  _id: string;
  plateNumber: string;
  entry: {
    timestamp: string;
    gateId: string;
    confidence: number;
    image?: string;
  };
  exit?: {
    timestamp: string;
    gateId: string;
    confidence: number;
    image?: string;
  };
  status: "inside" | "exited";
  currentDuration?: number;
  duration?: number;
}

interface CapacityData {
  timestamp: string;
  avgOccupied: number;
  maxOccupied: number;
  minOccupied: number;
  avgOccupancyRate: number;
  totalSlots: number;
}

export default function ParkingLotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const id = params.id as string;
  const isAdmin = session?.user?.role === "admin";

  const [parkingLot, setParkingLot] = useState<ParkingLot | null>(null);
  const [currentVehicles, setCurrentVehicles] = useState<VehicleRecord[]>([]);
  const [recentActivity, setRecentActivity] = useState<VehicleRecord[]>([]);
  const [capacityHistory, setCapacityHistory] = useState<CapacityData[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);

  // Time range selector for capacity chart
  const [capacityTimeRange, setCapacityTimeRange] = useState<
    "24h" | "7d" | "30d"
  >("7d");

  // Date range filter for entry/exit log
  const [activityStartDate, setActivityStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date;
  });
  const [activityEndDate, setActivityEndDate] = useState(new Date());
  const [showActivityDatePicker, setShowActivityDatePicker] = useState(false);

  const fetchParkingLotDetails = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/parking-lots/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Parking lot not found");
        }
        throw new Error("Failed to fetch parking lot details");
      }

      const result = await response.json();
      setParkingLot(result.data);
    } catch (err: any) {
      console.error("Error fetching parking lot:", err);
      setError(err.message || "Failed to load parking lot details");
    }
  };

  const fetchCurrentVehicles = async () => {
    try {
      const response = await fetch(`/api/records/current?parkingLotId=${id}`);
      if (response.ok) {
        const result = await response.json();
        setCurrentVehicles(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching current vehicles:", err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(
        `/api/records?parkingLotId=${id}&startDate=${activityStartDate.toISOString()}&endDate=${activityEndDate.toISOString()}&limit=50`,
      );
      if (response.ok) {
        const result = await response.json();
        setRecentActivity(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    }
  };

  const fetchCapacityHistory = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();

      // Set date range based on selected time range
      switch (capacityTimeRange) {
        case "24h":
          startDate.setHours(startDate.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(startDate.getDate() - 30);
          break;
      }

      const response = await fetch(
        `/api/capacity/history?parkingLotId=${id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&interval=hourly`,
      );

      if (response.ok) {
        const result = await response.json();
        setCapacityHistory(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching capacity history:", err);
    }
  };

  const fetchActiveAlerts = async () => {
    try {
      const response = await fetch(
        `/api/alerts?parkingLotId=${id}&status=active&limit=10`,
      );
      if (response.ok) {
        const result = await response.json();
        setActiveAlerts(result.data || []);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    }
  };

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchParkingLotDetails(),
        fetchCurrentVehicles(),
        fetchRecentActivity(),
        fetchCapacityHistory(),
        fetchActiveAlerts(),
      ]);
      setLoading(false);
    };

    loadData();

    // Real-time: SSE for capacity, entry/exit, alerts
    const es = new EventSource("/api/sse/dashboard");
    eventSourceRef.current = es;

    es.addEventListener("connected", () => {});

    es.addEventListener("capacity_update", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.parkingLotId === id) {
          setParkingLot((prev) => {
            if (!prev) return null;

            // Update individual slot statuses if provided
            let updatedSlots = prev.slots;
            if (
              data.slots &&
              Array.isArray(data.slots) &&
              data.slots.length > 0
            ) {
              updatedSlots = prev.slots.map((slot) => {
                const updated = data.slots.find(
                  (s: any) => (s.slotId || s.slot_id) === slot.slotId,
                );
                if (updated) {
                  return {
                    ...slot,
                    status: updated.status,
                    lastUpdated: new Date().toISOString(),
                  };
                }
                return slot;
              });
            }

            return {
              ...prev,
              slots: updatedSlots,
              currentOccupancy: {
                occupied: data.occupied,
                empty: data.empty,
                occupancyRate: data.occupancyRate,
                lastUpdated: data.timestamp,
              },
            };
          });
          fetchCapacityHistory(); // refresh trend after capacity change
        }
      } catch (_) {}
    });

    es.addEventListener("record_entry", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.parkingLotId === id) {
          fetchCurrentVehicles();
          fetchRecentActivity();
        }
      } catch (_) {}
    });

    es.addEventListener("record_exit", (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.parkingLotId === id) {
          fetchCurrentVehicles();
          fetchRecentActivity();
        }
      } catch (_) {}
    });

    es.addEventListener("alert", () => {
      fetchActiveAlerts();
    });

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;
    };

    return () => {
      es.close();
      eventSourceRef.current = null;
    };
  }, [id, activityStartDate, activityEndDate]);

  // Refetch capacity history when time range changes
  useEffect(() => {
    if (parkingLot) {
      fetchCapacityHistory();
    }
  }, [capacityTimeRange]);

  // Fallback poll when SSE is not connected (e.g. after reconnect)
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        !eventSourceRef.current ||
        eventSourceRef.current.readyState !== EventSource.OPEN
      ) {
        fetchParkingLotDetails();
        fetchCurrentVehicles();
        fetchRecentActivity();
        fetchActiveAlerts();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const getCameraStatusColor = (status: string, lastSeen: string) => {
    if (status === "inactive") return "bg-gray-400";

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / 60000;

    if (diffMinutes > 5) return "bg-red-500";
    return "bg-green-500";
  };

  const isCameraOffline = (status: string, lastSeen: string) => {
    if (status === "inactive") return true;

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / 60000;

    return diffMinutes > 5;
  };

  const formatLastSeen = (lastSeen: string) => {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - lastSeenDate.getTime()) / 60000,
    );

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleActivityDateRangeChange = (start: Date, end: Date) => {
    setActivityStartDate(start);
    setActivityEndDate(end);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-4  bg-gray-200 dark:bg-[#222428] rounded w-1/8 mb-8"></div>

          <div className="h-8 bg-gray-200 dark:bg-[#222326] rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-[#2a2e37] rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#111316] rounded-lg shadow dark:shadow-none p-6 h-64"></div>
              <div className="bg-white dark:bg-[#111316] rounded-lg shadow dark:shadow-none p-6 h-96"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-white dark:bg-[#111316] rounded-lg shadow dark:shadow-none p-6 h-48"></div>
              <div className="bg-white dark:bg-[#111316] rounded-lg shadow dark:shadow-none p-6 h-64"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !parkingLot) {
    return (
      <div className="space-y-6">
        <Link
          href="/parking-lots"
          className="inline-flex items-center text-blue-600 dark:text-[#818cf8] hover:text-blue-700 dark:hover:text-[#a5b4fc]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Parking Lots
        </Link>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-12 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-800 dark:text-red-300 text-lg mb-2">
            {error || "Parking lot not found"}
          </p>
          <Button
            onClick={() => router.push("/parking-lots")}
            variant="destructive"
          >
            Go to Parking Lots
          </Button>
        </div>
      </div>
    );
  }

  const occupancyRate = parkingLot.currentOccupancy?.occupancyRate || 0;
  const occupied = parkingLot.currentOccupancy?.occupied || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/parking-lots"
          className="inline-flex items-center text-blue-600 dark:text-[#818cf8] hover:text-blue-700 dark:hover:text-[#a5b4fc] mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Parking Lots
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] mb-2">
              {parkingLot.name}
            </h1>
            <div className="flex items-center text-gray-600 dark:text-[#9ca3af]">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{parkingLot.location.address}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <Link target="_blank" href={`/parking-lots/${id}/live`}>
                <Video className="w-4 h-4 mr-2" />
                View Live Feed
              </Link>
            </Button>
            {isAdmin && (
              <Button
                variant="secondary"
                onClick={() => setIsEditSheetOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Badge variant={parkingLot.status === "active" ? "success" : "secondary"}>
              {parkingLot.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className={`rounded-lg shadow dark:shadow-none p-4 border-l-4 ${
                    alert.severity === "critical"
                      ? "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600"
                      : alert.severity === "warning"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 dark:border-yellow-600"
                        : "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {alert.severity === "critical" ? (
                        <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                      ) : alert.severity === "warning" ? (
                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3
                            className={`font-bold text-lg ${
                              alert.severity === "critical"
                                ? "text-red-900 dark:text-red-300"
                                : alert.severity === "warning"
                                  ? "text-yellow-900 dark:text-yellow-300"
                                  : "text-blue-900 dark:text-blue-300"
                            }`}
                          >
                            {alert.title}
                          </h3>
                          <p
                            className={`text-sm mt-1 ${
                              alert.severity === "critical"
                                ? "text-red-800 dark:text-red-400"
                                : alert.severity === "warning"
                                  ? "text-yellow-800 dark:text-yellow-400"
                                  : "text-blue-800 dark:text-blue-400"
                            }`}
                          >
                            {alert.message}
                          </p>
                          {alert.type === "overparking" && alert.metadata && (
                            <div className="mt-2 text-sm font-semibold text-red-900 dark:text-red-300">
                              <p>
                                Contractor:{" "}
                                {alert.contractorId?.name || "Unknown"}
                              </p>
                              <p>
                                Extra Vehicles: {alert.metadata.extraVehicles}
                              </p>
                              <p>
                                Current: {alert.metadata.occupied}/
                                {alert.metadata.totalSlots}
                              </p>
                            </div>
                          )}
                        </div>
                        <span
                          className={`shrink-0 px-2 py-1 text-xs font-bold rounded uppercase ${
                            alert.severity === "critical"
                              ? "bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-200"
                              : alert.severity === "warning"
                                ? "bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200"
                                : "bg-blue-200 dark:bg-blue-900/50 text-blue-900 dark:text-blue-200"
                          }`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-[#9ca3af] mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Slot Grid */}
          <Card>

            <CardContent className="pt-6">
              <Suspense
                fallback={<SkeletonRectangle width="100%" height="300px" />}
              >
                <SlotGrid
                  slots={parkingLot.slots}
                  totalSlots={parkingLot.totalSlots}
                />
              </Suspense>
            </CardContent>
          </Card>

          {/* Capacity Trend Chart */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-[#2a2e37]">
              <div className="flex items-center justify-between">
                <CardTitle>Capacity Trend</CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={capacityTimeRange === "24h" ? "default" : "outline"}
                    onClick={() => setCapacityTimeRange("24h")}
                  >
                    24h
                  </Button>
                  <Button
                    size="sm"
                    variant={capacityTimeRange === "7d" ? "default" : "outline"}
                    onClick={() => setCapacityTimeRange("7d")}
                  >
                    7d
                  </Button>
                  <Button
                    size="sm"
                    variant={capacityTimeRange === "30d" ? "default" : "outline"}
                    onClick={() => setCapacityTimeRange("30d")}
                  >
                    30d
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {capacityHistory.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={capacityHistory.map((d) => ({
                        time: new Date(d.timestamp).getTime(),
                        label: new Date(d.timestamp).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour:
                            capacityTimeRange === "24h" ? "2-digit" : undefined,
                        }),
                        occupied: d.avgOccupied,
                        maxOccupied: d.maxOccupied,
                        totalSlots: d.totalSlots,
                        rate: (d.avgOccupancyRate * 100).toFixed(1),
                      }))}
                      margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-gray-200 dark:stroke-gray-700"
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11 }}
                        stroke="#6b7280"
                      />
                      <YAxis
                        domain={[
                          0,
                          (dataMax: number) =>
                            Math.max(dataMax, parkingLot?.totalSlots ?? 1),
                        ]}
                        tick={{ fontSize: 11 }}
                        stroke="#6b7280"
                      />
                      <Tooltip
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.label
                        }
                        formatter={(value, name) => {
                          const val = value ?? 0;
                          return [
                            name === "occupied" ? `${val} occupied` : val,
                            name === "occupied" ? "Avg occupied" : name,
                          ];
                        }}
                        contentStyle={{ fontSize: 12 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="occupied"
                        name="occupied"
                        stroke="#2563eb"
                        fill="#3b82f6"
                        fillOpacity={0.4}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-[#71717a] text-center py-8">
                  No capacity data available for this period. Data appears when
                  the lot camera sends occupancy updates.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Entry/Exit Activity Log */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-[#2a2e37]">
              <div className="flex items-center justify-between">
                <CardTitle>Entry/Exit Log</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setShowActivityDatePicker(!showActivityDatePicker)
                  }
                >
                  {showActivityDatePicker ? "Hide Filter" : "Filter by Date"}
                </Button>
              </div>
              {showActivityDatePicker && (
                <div className="mt-4">
                  <Suspense
                    fallback={<SkeletonRectangle width="100%" height="80px" />}
                  >
                    <DateRangePicker
                      startDate={activityStartDate}
                      endDate={activityEndDate}
                      onDateRangeChange={handleActivityDateRangeChange}
                    />
                  </Suspense>
                </div>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((record) => (
                    <div
                      key={record._id}
                      className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-[#181a1f] rounded-lg border border-gray-200 dark:border-[#2a2e37]"
                    >
                      {/* Vehicle Image if available */}
                      {(record.entry.image || record.exit?.image) && (
                        <div className="shrink-0">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-[#2a2e37] rounded-lg overflow-hidden">
                            {record.status === "inside" &&
                            record.entry.image ? (
                              <img
                                src={record.entry.image}
                                loading="lazy"
                                alt={`Vehicle ${record.plateNumber}`}
                                className="w-full h-full object-cover"
                              />
                            ) : record.exit?.image ? (
                              <img
                                src={record.exit.image}
                                loading="lazy"
                                alt={`Vehicle ${record.plateNumber}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400 dark:text-[#71717a]" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                          {record.plateNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                          {record.status === "inside" ? "Entered" : "Exited"} at{" "}
                          {new Date(
                            record.status === "inside"
                              ? record.entry.timestamp
                              : record.exit?.timestamp ||
                                  record.entry.timestamp,
                          ).toLocaleString()}
                        </p>
                        {record.status === "exited" && record.duration && (
                          <p className="text-xs text-gray-500 dark:text-[#71717a] mt-1">
                            Duration: {formatDuration(record.duration)}
                          </p>
                        )}
                      </div>

                      <Badge variant={record.status === "inside" ? "default" : "secondary"}>
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-[#71717a] text-center py-8">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Contractor Info */}
          <Card>
            <CardHeader className="border-b border-gray-200 dark:border-[#2a2e37]">
              <div className="flex items-center justify-between">
                <CardTitle>Contractor</CardTitle>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                >
                  <Link href={`/contractors/${parkingLot.contractorId._id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Name</p>
                  <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                    {parkingLot.contractorId.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Contact Person</p>
                  <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                    {parkingLot.contractorId.contactPerson}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                    {parkingLot.contractorId.phone}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Allocated Capacity</p>
                  <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                    {parkingLot.contractorId.contractDetails.allocatedCapacity}{" "}
                    vehicles
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Contract Period</p>
                  <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                    {new Date(
                      parkingLot.contractorId.contractDetails.startDate,
                    ).toLocaleDateString()}{" "}
                    -{" "}
                    {new Date(
                      parkingLot.contractorId.contractDetails.endDate,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Camera Status */}
          <Card>
            <CardHeader>
              <CardTitle>Camera Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Gate Camera */}
                <div className="p-3 bg-gray-50 dark:bg-[#181a1f] rounded-lg border border-gray-200 dark:border-[#2a2e37]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-gray-600 dark:text-[#9ca3af]" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">Gate Camera</p>
                        <p className="text-xs text-gray-500 dark:text-[#71717a]">
                          {parkingLot.gateCamera.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCameraOffline(
                        parkingLot.gateCamera.status,
                        parkingLot.gateCamera.lastSeen,
                      ) && <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />}
                      <div
                        className={`w-3 h-3 rounded-full ${getCameraStatusColor(
                          parkingLot.gateCamera.status,
                          parkingLot.gateCamera.lastSeen,
                        )}`}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-[#9ca3af]">
                    <p>
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          isCameraOffline(
                            parkingLot.gateCamera.status,
                            parkingLot.gateCamera.lastSeen,
                          )
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {isCameraOffline(
                          parkingLot.gateCamera.status,
                          parkingLot.gateCamera.lastSeen,
                        )
                          ? "Offline"
                          : "Online"}
                      </span>
                    </p>
                    <p>
                      Last seen: {formatLastSeen(parkingLot.gateCamera.lastSeen)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-[#71717a] mt-1">
                      {new Date(parkingLot.gateCamera.lastSeen).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Lot Camera */}
                <div className="p-3 bg-gray-50 dark:bg-[#181a1f] rounded-lg border border-gray-200 dark:border-[#2a2e37]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-gray-600 dark:text-[#9ca3af]" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">Lot Camera</p>
                        <p className="text-xs text-gray-500 dark:text-[#71717a]">
                          {parkingLot.lotCamera.id}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isCameraOffline(
                        parkingLot.lotCamera.status,
                        parkingLot.lotCamera.lastSeen,
                      ) && <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />}
                      <div
                        className={`w-3 h-3 rounded-full ${getCameraStatusColor(
                          parkingLot.lotCamera.status,
                          parkingLot.lotCamera.lastSeen,
                        )}`}
                      />
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-[#9ca3af]">
                    <p>
                      Status:{" "}
                      <span
                        className={`font-medium ${
                          isCameraOffline(
                            parkingLot.lotCamera.status,
                            parkingLot.lotCamera.lastSeen,
                          )
                            ? "text-red-600 dark:text-red-400"
                            : "text-green-600 dark:text-green-400"
                        }`}
                      >
                        {isCameraOffline(
                          parkingLot.lotCamera.status,
                          parkingLot.lotCamera.lastSeen,
                        )
                          ? "Offline"
                          : "Online"}
                      </span>
                    </p>
                    <p>
                      Last seen: {formatLastSeen(parkingLot.lotCamera.lastSeen)}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-[#71717a] mt-1">
                      {new Date(parkingLot.lotCamera.lastSeen).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vehicles Currently Inside */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicles Inside ({currentVehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentVehicles.length > 0 ? (
                  currentVehicles.map((vehicle) => (
                    <div key={vehicle._id} className="p-3 bg-gray-50 dark:bg-[#181a1f] rounded-lg border border-gray-200 dark:border-[#2a2e37]">
                      <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">
                        {vehicle.plateNumber}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                        Duration: {formatDuration(vehicle.currentDuration || 0)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#71717a]">
                        Entered:{" "}
                        {new Date(vehicle.entry.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-[#71717a] text-center py-4">
                    No vehicles inside
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Parking Lot Sheet */}
      {isAdmin && (
        <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
          <SheetContent 
            side="right" 
            className="w-full sm:max-w-2xl overflow-y-auto bg-white dark:bg-[#111316] border-gray-200 dark:border-[#2a2e37]"
          >
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-[#e5e7eb]">
                Edit Parking Lot
              </SheetTitle>
              <SheetDescription className="text-gray-600 dark:text-[#9ca3af]">
                Update parking lot information
              </SheetDescription>
            </SheetHeader>
            <div className="px-6 py-6">
              <ParkingLotForm
                mode="edit"
                initialData={{
                  _id: parkingLot._id,
                  name: parkingLot.name,
                  location: parkingLot.location,
                  totalSlots: parkingLot.totalSlots,
                  contractorId: parkingLot.contractorId._id,
                }}
                onSuccess={() => {
                  setIsEditSheetOpen(false);
                  fetchParkingLotDetails();
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
