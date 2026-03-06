"use client";

import { Bell, PanelRight, AlertTriangle, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { AnimatedCarIcon } from "@/components/icons/animated-car";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcnComponents/popover";
import { Button } from "@/components/shadcnComponents/button";
import { Badge } from "@/components/shadcnComponents/badge";

interface Alert {
  _id: string;
  type: string;
  severity: 'critical' | 'warning' | 'info';
  parkingLotId: {
    _id: string;
    name: string;
  };
  message: string;
  status: string;
  createdAt: string;
}
export default function Navbar() {
  const router = useRouter();
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    // Fetch active alerts
    const fetchActiveAlerts = async () => {
      try {
        const response = await fetch("/api/alerts/active");
        if (response.ok) {
          const result = await response.json();
          setActiveAlerts(result.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch active alerts:", error);
      }
    };

    fetchActiveAlerts();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchActiveAlerts, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  const getSeverityBadgeVariant = (severity: string): 'error' | 'warning' | 'secondary' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <nav className="bg-transparent backdrop-blur-2xl  px-6 py-4">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            className="p-2 rounded-lg bg-gray-100 text-gray-900 md:hidden hover:bg-gray-200 transition dark:bg-[#2a2e37] dark:text-[#e5e7eb] dark:hover:bg-[#3a3f4b]"
            aria-label="Toggle sidebar"
            onClick={() => {
              window.dispatchEvent(new Event("sidebar:toggle"));
            }}
          >
            <PanelRight className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="flex items-center justify-center w-full gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 dark:bg-[#4f46e5]">
              <AnimatedCarIcon />
            </div>
            <div className="">
              <h2 className="text-md font-bold text-gray-900 dark:text-[#e5e7eb]">Smart Parking</h2>
              <p className="text-[10px] text-gray-500 dark:text-[#9ca3af] font-semibold">MCD System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Active Alerts Popover */}
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition dark:text-[#9ca3af] dark:hover:bg-[#2a2e37] dark:hover:text-[#e5e7eb]"
                title="Active Alerts"
                aria-label={`Active alerts: ${activeAlerts.length}`}
              >
                <Bell className="w-5 h-5" aria-hidden="true" />
                {activeAlerts.length > 0 && (
                  <span
                    className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
                    aria-label={`${activeAlerts.length} active alerts`}
                  >
                    {activeAlerts.length}
                  </span>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-0 border-gray-200 dark:border-[#2a2e37]">
              <div className="p-4 border-b border-gray-200 dark:border-[#2a2e37]">
                <h3 className="font-semibold text-gray-900 dark                 :text-[#e5e7eb]">
                  Active Alerts ({activeAlerts.length})
                </h3>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-400 dark:text-[#71717a] mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-[#9ca3af]">
                      No active alerts
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-[#2a2e37]">
                    {activeAlerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert._id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-[#1f2937] transition cursor-pointer border-l-4 ${
                          alert.severity === 'critical' ? 'border-l-red-500' :
                          alert.severity === 'warning' ? 'border-l-yellow-500' :
                          'border-l-blue-500'
                        }`}
                        onClick={() => {
                          setPopoverOpen(false);
                          router.push('/alerts');
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={getSeverityBadgeVariant(alert.severity)} className="text-xs">
                                {alert.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-900 dark:text-[#e5e7eb] mb-1 line-clamp-2">
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-[#9ca3af]">
                              {alert.parkingLotId.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-[#71717a] mt-1">
                              {format(new Date(alert.createdAt), 'PPp')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {activeAlerts.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-[#2a2e37]">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setPopoverOpen(false);
                      router.push('/alerts');
                    }}
                  >
                    View All Alerts
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
}
