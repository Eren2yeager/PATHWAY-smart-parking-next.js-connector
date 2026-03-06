'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import L from 'leaflet';
import { theme } from '@/lib/utils/theme';

// Load Leaflet CSS from CDN so Next.js doesn't try to resolve its image paths (layers-2x.png etc.)
const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';

// Fix for default marker icons in Leaflet
// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ParkingLotLocation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  occupancy: number;
  totalSlots: number;
}

interface MapViewProps {
  parkingLots: ParkingLotLocation[];
  onMarkerClick?: (lotId: string) => void;
}

export default function MapView({ parkingLots, onMarkerClick }: MapViewProps) {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Inject Leaflet CSS from CDN (avoids Next.js resolving leaflet image paths)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const id = 'leaflet-css';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    // Initialize map only once
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on first parking lot or default location
    const defaultCenter: [number, number] = parkingLots.length > 0
      ? [parkingLots[0].location.lat, parkingLots[0].location.lng]
      : [28.6139, 77.2090]; // Delhi, India default

    const map = L.map(mapContainerRef.current).setView(defaultCenter, 12);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (parkingLots.length === 0) return;

    // Add markers for each parking lot
    const bounds = L.latLngBounds([]);

    parkingLots.forEach((lot) => {
      const { lat, lng } = lot.location;
      const occupancyRate = lot.totalSlots > 0 
        ? Math.round((lot.occupancy / lot.totalSlots) * 100) 
        : 0;

      // Create custom icon based on occupancy
      const iconColor = occupancyRate >= 90 
        ? theme.colors.error[500] 
        : occupancyRate >= 70 
        ? theme.colors.warning[500] 
        : theme.colors.success[500];

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${iconColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">${occupancyRate}%</span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current!);

      const occupancyColor = iconColor;
      const tooltipHtml = `
        <div style="
          font-family: ${theme.typography.fontFamily.sans};
          min-width: 220px;
          background: ${theme.colors.neutral[50]};
          border: 1px solid ${theme.colors.neutral[200]};
          border-radius: ${theme.borderRadius.lg};
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        ">
          <div style="
            background: ${occupancyColor};
            color: white;
            padding: ${theme.spacing[2]};
            font-weight: ${theme.typography.fontWeight.bold};
          ">
            ${lot.name}
          </div>
          <div style="
            padding: ${theme.spacing[2]};
            display: flex;
            align-items: center;
            gap: ${theme.spacing[2]};
          ">
            <div style="
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: conic-gradient(${occupancyColor} ${occupancyRate}%, ${theme.colors.neutral[300]} ${occupancyRate}% 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              color: ${theme.colors.text.primary};
              font-size: ${theme.typography.fontSize.sm};
              font-weight: ${theme.typography.fontWeight.bold};
              border: 2px solid ${theme.colors.neutral[200]};
            ">
              ${occupancyRate}%
            </div>
            <div style="
              font-size: ${theme.typography.fontSize.sm};
              color: ${theme.colors.text.secondary};
            ">
              <div style="margin-bottom: ${theme.spacing[1]};">
                <strong>Occupancy:</strong> ${lot.occupancy} / ${lot.totalSlots}
              </div>
              <div>
                <strong>Status:</strong> ${occupancyRate >= 90 ? 'High' : occupancyRate >= 70 ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </div>
      `;

      marker.bindTooltip(tooltipHtml, {
        direction: 'top',
        opacity: 0.95,
        offset: [0, -10],
        sticky: true,
      });

      // Add click handler
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(lot.id);
        router.push(`/parking-lots/${encodeURIComponent(lot.id)}`);
      });

      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    });

    // Fit map to show all markers
    if (parkingLots.length > 1) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    } else if (parkingLots.length === 1) {
      mapRef.current.setView(
        [parkingLots[0].location.lat, parkingLots[0].location.lng],
        14
      );
    }
  }, [parkingLots, onMarkerClick]);

  return (
    <div className="bg-white dark:bg-[#111316] rounded-lg shadow dark:shadow-none border border-gray-200 dark:border-[#2a2e37] overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-[#2a2e37]">
        <h3 className="text-lg font-bold text-gray-900 dark:text-[#e5e7eb]">Parking Lots Map</h3>
        <p className="text-sm text-gray-600 dark:text-[#9ca3af] mt-1">
          {parkingLots.length} location{parkingLots.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div 
        ref={mapContainerRef} 
        className="w-full h-[400px] md:h-[500px]"
        style={{ zIndex: 0 }}
      />
    </div>
  );
}
