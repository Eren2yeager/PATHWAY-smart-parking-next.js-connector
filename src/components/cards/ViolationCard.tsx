'use client';

import { useState } from 'react';
import { AlertTriangle, Building2, Users, Clock, CheckCircle, Calendar, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/shadcnComponents/button';
import { Card, CardContent } from '@/components/shadcnComponents/card';
import { Badge } from '@/components/shadcnComponents/badge';

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

interface ViolationCardProps {
  violation: Violation;
  onUpdate?: () => void;
}

function getStatusVariant(status: string): 'error' | 'warning' | 'success' | 'secondary' {
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

function getViolationTypeLabel(type: string): string {
  switch (type) {
    case 'overparking':
      return 'Overparking';
    case 'unauthorized_vehicle':
      return 'Unauthorized Vehicle';
    case 'capacity_breach':
      return 'Capacity Breach';
    default:
      return type;
  }
}

export default function ViolationCard({ violation, onUpdate }: ViolationCardProps) {
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');

  const statusVariant = getStatusVariant(violation.status);
  
  const getStatusIcon = () => {
    switch (violation.status) {
      case 'pending':
        return <AlertTriangle className="w-5 h-5" />;
      case 'acknowledged':
        return <Clock className="w-5 h-5" />;
      case 'resolved':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const handleAcknowledge = async () => {
    if (isAcknowledging) return;

    try {
      setIsAcknowledging(true);

      const response = await fetch(`/api/violations/${violation._id}/acknowledge`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to acknowledge violation');
      }

      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error acknowledging violation:', err);
      alert(err instanceof Error ? err.message : 'Failed to acknowledge violation. Please try again.');
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleResolve = async () => {
    if (isResolving) return;

    try {
      setIsResolving(true);

      const response = await fetch(`/api/violations/${violation._id}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes: resolveNotes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to resolve violation');
      }

      setShowResolveDialog(false);
      setResolveNotes('');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error resolving violation:', err);
      alert(err instanceof Error ? err.message : 'Failed to resolve violation. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <>
      <Card className={`border-l-4 ${
        violation.status === 'pending' ? 'border-l-red-500 dark:border-l-red-600' :
        violation.status === 'acknowledged' ? 'border-l-yellow-500 dark:border-l-yellow-600' :
        'border-l-green-500 dark:border-l-green-600'
      }`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-start gap-3">
              <div className={`${
                violation.status === 'pending' ? 'text-red-600 dark:text-red-400' :
                violation.status === 'acknowledged' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {getStatusIcon()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">
                    {getViolationTypeLabel(violation.violationType)}
                  </h3>
                  <Badge variant={statusVariant}>
                    {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                  {formatDistanceToNow(new Date(violation.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          {/* Violation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Contractor */}
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-gray-500 dark:text-[#71717a] mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-[#71717a]">Contractor</p>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb]">{violation.contractorId.name}</p>
                <p className="text-xs text-gray-500 dark:text-[#71717a]">{violation.contractorId.email}</p>
              </div>
            </div>

            {/* Parking Lot */}
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-gray-500 dark:text-[#71717a] mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-[#71717a]">Parking Lot</p>
                <p className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb]">{violation.parkingLotId.name}</p>
                {violation.parkingLotId.location && (
                  <p className="text-xs text-gray-500 dark:text-[#71717a]">{violation.parkingLotId.location.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Capacity Details */}
          <div className="bg-gray-50 dark:bg-[#0a0b0d] rounded-lg p-4 mb-4 border border-gray-100 dark:border-[#2a2e37]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Allocated</p>
                <p className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">{violation.details.allocatedCapacity}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Actual</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">{violation.details.actualOccupancy}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Excess Vehicles</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">+{violation.details.excessVehicles}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Penalty</p>
                <p className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">₹{violation.penalty}</p>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#71717a] mb-4">
            <Calendar className="w-3 h-3" />
            <span>Occurred on {format(new Date(violation.timestamp), 'PPpp')}</span>
          </div>

          {/* Resolution Details */}
          {violation.status !== 'pending' && violation.resolvedBy && (
            <div className="bg-gray-50 dark:bg-[#0a0b0d] rounded-lg p-4 mb-4 border border-gray-200 dark:border-[#2a2e37]">
              <p className="text-xs text-gray-500 dark:text-[#71717a] mb-2">
                {violation.status === 'acknowledged' ? 'Acknowledged' : 'Resolved'} by
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb]">{violation.resolvedBy.name}</p>
              {violation.resolvedAt && (
                <p className="text-xs text-gray-500 dark:text-[#71717a] mt-1">
                  {formatDistanceToNow(new Date(violation.resolvedAt), { addSuffix: true })}
                </p>
              )}
              {violation.notes && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#2a2e37]">
                  <p className="text-xs text-gray-500 dark:text-[#71717a] mb-1">Notes</p>
                  <p className="text-sm text-gray-900 dark:text-[#e5e7eb]">{violation.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {violation.status === 'pending' && (
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleAcknowledge}
                disabled={isAcknowledging}
                variant="outline"
                className="flex-1 min-w-[140px] bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400"
              >
                {isAcknowledging ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Acknowledging...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Acknowledge
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowResolveDialog(true)}
                disabled={isResolving}
                className="flex-1 min-w-[140px] bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
              >
                <CheckCircle className="w-4 h-4" />
                Resolve
              </Button>
            </div>
          )}

          {violation.status === 'acknowledged' && (
            <Button
              onClick={() => setShowResolveDialog(true)}
              disabled={isResolving}
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <CheckCircle className="w-4 h-4" />
              Resolve
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      {showResolveDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb] mb-4">Resolve Violation</h3>
              
              <div className="mb-4">
                <label htmlFor="resolveNotes" className="block text-sm font-medium text-gray-700 dark:text-[#d1d5db] mb-2">
                  Resolution Notes (Optional)
                </label>
                <textarea
                  id="resolveNotes"
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-[#2a2e37] rounded-lg bg-white dark:bg-[#111316] text-gray-900 dark:text-[#e5e7eb] focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 focus:border-transparent outline-none"
                  placeholder="Add any notes about how this violation was resolved..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowResolveDialog(false);
                    setResolveNotes('');
                  }}
                  disabled={isResolving}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResolve}
                  disabled={isResolving}
                  className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                >
                  {isResolving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    'Resolve'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
