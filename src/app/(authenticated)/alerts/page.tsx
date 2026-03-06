'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Bell,
  Camera,
  Users,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/shadcnComponents/button';
import { Card, CardContent } from '@/components/shadcnComponents/card';
import { Badge } from '@/components/shadcnComponents/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcnComponents/select';

interface Alert {
  _id: string;
  type: 'overparking' | 'capacity_full' | 'camera_offline' | 'system';
  severity: 'critical' | 'warning' | 'info';
  parkingLotId: {
    _id: string;
    name: string;
    location?: {
      address: string;
    };
  };
  contractorId?: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  message: string;
  metadata: any;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  acknowledgedAt?: string;
  createdAt: string;
}

export default function AlertsPage() {
  const { data: session } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'overparking' | 'capacity_full' | 'camera_offline' | 'system'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');

  const fetchAlerts = async () => {
    try {
      setError(null);
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();
      
      if (typeFilter !== 'all') {
        params.append('type', typeFilter);
      }
      
      if (severityFilter !== 'all') {
        params.append('severity', severityFilter);
      }
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      params.append('limit', '100');

      const response = await fetch(`/api/alerts?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const result = await response.json();
      setAlerts(result.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [typeFilter, severityFilter, statusFilter]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      setAcknowledgingId(alertId);

      const response = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to acknowledge alert');
      }

      // Refresh alerts list
      await fetchAlerts();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
      alert('Failed to acknowledge alert');
    } finally {
      setAcknowledgingId(null);
    }
  };

  // Calculate statistics
  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => a.status === 'active').length,
    acknowledged: alerts.filter((a) => a.status === 'acknowledged').length,
    resolved: alerts.filter((a) => a.status === 'resolved').length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
  };

  // Get severity color classes
  const getSeverityVariant = (severity: string): 'error' | 'warning' | 'secondary' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusVariant = (status: string): 'error' | 'warning' | 'success' | 'secondary' => {
    switch (status) {
      case 'active':
        return 'error';
      case 'acknowledged':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-red-500 dark:border-l-red-600';
      case 'warning':
        return 'border-l-yellow-500 dark:border-l-yellow-600';
      case 'info':
        return 'border-l-blue-500 dark:border-l-blue-600';
      default:
        return 'border-l-gray-500 dark:border-l-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'capacity_warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'capacity_breach':
        return <AlertCircle className="w-5 h-5" />;
      case 'camera_offline':
        return <Camera className="w-5 h-5" />;
      case 'violation_detected':
        return <Users className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'capacity_warning':
        return 'Capacity Warning';
      case 'capacity_breach':
        return 'Capacity Breach';
      case 'camera_offline':
        return 'Camera Offline';
      case 'violation_detected':
        return 'Violation Detected';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-[#e5e7eb] mb-2">Alerts</h1>
        <p className="text-gray-600 dark:text-[#9ca3af]">Monitor and manage system alerts</p>
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
              <Bell className="w-8 h-8 text-gray-400 dark:text-[#71717a]" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Active</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.active}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400 dark:text-red-500" />
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
                <p className="text-sm text-gray-600 dark:text-[#9ca3af]">Critical</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400 dark:text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500 dark:text-[#71717a]" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2">Type</label>
              <Select
                value={typeFilter}
                onValueChange={(value) => setTypeFilter(value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="overparking">Overparking</SelectItem>
                  <SelectItem value="capacity_full">Capacity Full</SelectItem>
                  <SelectItem value="camera_offline">Camera Offline</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2">Severity</label>
              <Select
                value={severityFilter}
                onValueChange={(value) => setSeverityFilter(value as any)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          {!loading && (
            <div className="mt-4 text-sm text-gray-600 dark:text-[#9ca3af]">
              Showing {alerts.length} alert{alerts.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts List */}
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
            <Button onClick={fetchAlerts} variant="destructive">
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 dark:text-[#71717a] mx-auto mb-4" />
            <p className="text-gray-600 dark:text-[#9ca3af] mb-2">No alerts found</p>
            <p className="text-sm text-gray-500 dark:text-[#71717a]">
              {typeFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No alerts have been recorded'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card
              key={alert._id}
              className={`border-l-4 ${getSeverityBorderColor(alert.severity)}`}
            >
              <CardContent className="p-6">
                {/* Alert Header */}
                <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                      alert.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {getTypeIcon(alert.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">{getTypeLabel(alert.type)}</h3>
                        <Badge variant={getSeverityVariant(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusVariant(alert.status)}>
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                        {format(new Date(alert.createdAt), 'PPpp')}
                      </p>
                    </div>
                  </div>

                  {/* Acknowledge Button */}
                  {alert.status === 'active' && (
                    <Button
                      onClick={() => handleAcknowledge(alert._id)}
                      disabled={acknowledgingId === alert._id}
                      variant="outline"
                    >
                      {acknowledgingId === alert._id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Acknowledging...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Acknowledge
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Alert Message */}
                <p className="text-base mb-4 font-medium text-gray-900 dark:text-[#e5e7eb]">{alert.message}</p>

                {/* Alert Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Parking Lot */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500 dark:text-[#71717a]" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">Parking Lot</p>
                      <p className="text-gray-600 dark:text-[#9ca3af]">{alert.parkingLotId.name}</p>
                      {alert.parkingLotId.location?.address && (
                        <p className="text-xs text-gray-500 dark:text-[#71717a]">{alert.parkingLotId.location.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Contractor (if applicable) */}
                  {alert.contractorId && (
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 mt-0.5 text-gray-500 dark:text-[#71717a]" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">Contractor</p>
                        <p className="text-gray-600 dark:text-[#9ca3af]">{alert.contractorId.name}</p>
                        <p className="text-xs text-gray-500 dark:text-[#71717a]">{alert.contractorId.email}</p>
                      </div>
                    </div>
                  )}

                  {/* Acknowledged Info */}
                  {alert.status === 'acknowledged' && alert.acknowledgedBy && (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 text-gray-500 dark:text-[#71717a]" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-[#e5e7eb]">Acknowledged By</p>
                        <p className="text-gray-600 dark:text-[#9ca3af]">{alert.acknowledgedBy.name}</p>
                        {alert.acknowledgedAt && (
                          <p className="text-xs text-gray-500 dark:text-[#71717a]">
                            {format(new Date(alert.acknowledgedAt), 'PPpp')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Data (if any) */}
                {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#2a2e37]">
                    <p className="text-xs font-medium mb-2 text-gray-600 dark:text-[#9ca3af]">Additional Details:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {Object.entries(alert.metadata).map(([key, value]) => (
                        <div key={key}>
                          <p className="font-medium text-gray-600 dark:text-[#9ca3af]">{key}:</p>
                          <p className="text-gray-500 dark:text-[#71717a]">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
