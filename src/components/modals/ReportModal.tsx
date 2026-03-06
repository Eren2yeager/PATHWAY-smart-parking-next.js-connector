'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, AlertCircle, Loader2 } from 'lucide-react';
import { subDays } from 'date-fns';
import DateRangePicker from '@/components/forms/DateRangePicker';
import { Button } from '@/components/shadcnComponents/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/shadcnComponents/sheet';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReportType = 'violations' | 'occupancy' | 'contractor_performance';
type ReportFormat = 'csv' | 'excel' | 'pdf';

interface ReportConfig {
  type: ReportType;
  dateRange: {
    start: Date;
    end: Date;
  };
  format: ReportFormat;
  filters?: {
    parkingLotId?: string;
    contractorId?: string;
  };
}

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [reportType, setReportType] = useState<ReportType>('violations');
  const [reportFormat, setReportFormat] = useState<ReportFormat>('csv');
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsGenerating(false);
    }
  }, [isOpen]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleGenerate = async () => {
    setError(null);
    setIsGenerating(true);

    try {
      const config: ReportConfig = {
        type: reportType,
        dateRange: {
          start: startDate,
          end: endDate,
        },
        format: reportFormat,
      };

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const data = await response.json();

      // Trigger file download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close modal on success
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const reportTypeOptions = [
    { value: 'violations', label: 'Violations Report', description: 'Contractor violations and penalties' },
    { value: 'occupancy', label: 'Occupancy Report', description: 'Parking lot occupancy trends' },
    {
      value: 'contractor_performance',
      label: 'Contractor Performance',
      description: 'Compliance rates and performance metrics',
    },
  ];

  const formatOptions = [
    { value: 'csv', label: 'CSV', description: 'Comma-separated values (Excel compatible)' },
    { value: 'excel', label: 'Excel', description: 'Formatted spreadsheet with charts' },
    { value: 'pdf', label: 'PDF', description: 'Printable document with tables' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto px-0">
        <SheetHeader className="px-6">
          <SheetTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Generate Report
          </SheetTitle>
          <SheetDescription>
            Configure and generate reports for violations, occupancy, or contractor performance
          </SheetDescription>
        </SheetHeader>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1">Error</h4>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Report Type</label>
            <div className="space-y-2">
              {reportTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                    reportType === option.value
                      ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-[#2a2e37] hover:border-gray-300 dark:hover:border-gray-600'
                  } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={option.value}
                    checked={reportType === option.value}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    disabled={isGenerating}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Date Range</label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {formatOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-col items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    reportFormat === option.value
                      ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/30'
                      : 'border-gray-200 dark:border-[#2a2e37] hover:border-gray-300 dark:hover:border-gray-600'
                  } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="radio"
                    name="reportFormat"
                    value={option.value}
                    checked={reportFormat === option.value}
                    onChange={(e) => setReportFormat(e.target.value as ReportFormat)}
                    disabled={isGenerating}
                    className="sr-only"
                  />
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{option.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">{option.description}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-300">
                <p className="font-medium mb-1">Report will include:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-400">
                  {reportType === 'violations' && (
                    <>
                      <li>Contractor name and parking lot</li>
                      <li>Violation timestamp and type</li>
                      <li>Excess vehicles and penalties</li>
                    </>
                  )}
                  {reportType === 'occupancy' && (
                    <>
                      <li>Parking lot name and date</li>
                      <li>Average and peak occupancy</li>
                      <li>Occupancy rate percentage</li>
                    </>
                  )}
                  {reportType === 'contractor_performance' && (
                    <>
                      <li>Contractor name and compliance rate</li>
                      <li>Total violations and penalties</li>
                      <li>Average occupancy metrics</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="flex-row justify-end gap-3 px-6">
          <Button
            onClick={onClose}
            disabled={isGenerating}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
