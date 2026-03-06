'use client';

import { useEffect, useRef } from 'react';

interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface DetectionSlot {
  bbox: BoundingBox;
  confidence: number;
  status?: string;
  class?: string;
  plate_number?: string;
  ocr_confidence?: number;
}

interface BoundingBoxCanvasProps {
  imageId: string;
  detections: DetectionSlot[] | null;
  type?: 'slots' | 'plates';
  className?: string;
}

export function BoundingBoxCanvas({
  imageId,
  detections,
  type = 'slots',
  className = '',
}: BoundingBoxCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawSlots = (
    ctx: CanvasRenderingContext2D,
    slots: DetectionSlot[],
    scaleX: number,
    scaleY: number,
    offsetX: number,
    offsetY: number
  ) => {
    slots.forEach((slot) => {
      const bbox = slot.bbox;
      const confidence = slot.confidence || 0;
      const status = slot.status || slot.class || 'empty';

      // Determine if slot is occupied or empty
      const isOccupied = status === 'occupied' || status === 'full';
      const color = isOccupied ? '#EF4444' : '#10B981'; // Red for occupied, green for empty

      const x1 = bbox.x1 * scaleX + offsetX;
      const y1 = bbox.y1 * scaleY + offsetY;
      const x2 = bbox.x2 * scaleX + offsetX;
      const y2 = bbox.y2 * scaleY + offsetY;

      // Draw rectangle with thin border
      ctx.shadowBlur = 3;
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.shadowBlur = 0;

      // Draw label
      const label = `${(confidence * 100).toFixed(0)}%`;
      ctx.font = 'bold 11px Arial';
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = isOccupied
        ? 'rgba(239, 68, 68, 0.9)'
        : 'rgba(16, 185, 129, 0.9)';
      ctx.fillRect(x1, y1 - 18, textWidth + 6, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, x1 + 3, y1 - 5);
    });
  };

  const drawPlates = (
    ctx: CanvasRenderingContext2D,
    plates: DetectionSlot[],
    scaleX: number,
    scaleY: number,
    offsetX: number,
    offsetY: number
  ) => {
    plates.forEach((plate) => {
      const bbox = plate.bbox;
      const plateNumber = plate.plate_number || 'UNKNOWN';
      const confidence = plate.ocr_confidence || plate.confidence || 0;

      const x1 = bbox.x1 * scaleX + offsetX;
      const y1 = bbox.y1 * scaleY + offsetY;
      const x2 = bbox.x2 * scaleX + offsetX;
      const y2 = bbox.y2 * scaleY + offsetY;

      // Draw rectangle with glow
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#3B82F6';
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 4;
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.shadowBlur = 0;

      // Draw label
      const label = `${plateNumber} (${(confidence * 100).toFixed(0)}%)`;
      ctx.font = 'bold 20px Arial';
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(x1, y1 - 35, textWidth + 10, 35);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, x1 + 5, y1 - 10);
    });
  };

  const redrawCanvas = () => {
    const element = document.getElementById(imageId) as HTMLImageElement | HTMLVideoElement;
    const canvas = canvasRef.current;

    if (!element || !canvas || !detections || detections.length === 0) {
      return;
    }

    const containerRect = element.getBoundingClientRect();

    // Get natural dimensions based on element type
    let naturalWidth: number, naturalHeight: number;
    if (element instanceof HTMLVideoElement) {
      naturalWidth = element.videoWidth;
      naturalHeight = element.videoHeight;
    } else {
      naturalWidth = element.naturalWidth;
      naturalHeight = element.naturalHeight;
    }

    if (!naturalWidth || !naturalHeight) {
      return; // Element not loaded yet
    }

    // Calculate actual displayed image dimensions (accounting for object-contain)
    const imgAspect = naturalWidth / naturalHeight;
    const containerAspect = containerRect.width / containerRect.height;

    let displayWidth: number, displayHeight: number, offsetX: number, offsetY: number;

    if (imgAspect > containerAspect) {
      // Image is wider - fit to width
      displayWidth = containerRect.width;
      displayHeight = containerRect.width / imgAspect;
      offsetX = 0;
      offsetY = (containerRect.height - displayHeight) / 2;
    } else {
      // Image is taller - fit to height
      displayHeight = containerRect.height;
      displayWidth = containerRect.height * imgAspect;
      offsetX = (containerRect.width - displayWidth) / 2;
      offsetY = 0;
    }

    // Set canvas to match container
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Scale based on actual displayed image size
      const scaleX = displayWidth / naturalWidth;
      const scaleY = displayHeight / naturalHeight;

      if (type === 'plates') {
        drawPlates(ctx, detections, scaleX, scaleY, offsetX, offsetY);
      } else {
        drawSlots(ctx, detections, scaleX, scaleY, offsetX, offsetY);
      }
    }
  };

  // Redraw on detections change
  useEffect(() => {
    if (detections && detections.length > 0) {
      // Small delay to ensure element is loaded
      const timer = setTimeout(redrawCanvas, 100);
      return () => clearTimeout(timer);
    }
  }, [detections, imageId, type]);

  // Continuous redraw for video elements
  useEffect(() => {
    let animationFrameId: number;

    const continuousRedraw = () => {
      const element = document.getElementById(imageId);
      if (element instanceof HTMLVideoElement && detections && detections.length > 0) {
        redrawCanvas();
        animationFrameId = requestAnimationFrame(continuousRedraw);
      }
    };

    const element = document.getElementById(imageId);
    if (element instanceof HTMLVideoElement && detections && detections.length > 0) {
      animationFrameId = requestAnimationFrame(continuousRedraw);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [detections, imageId, type]);

  // Redraw on window resize
  useEffect(() => {
    window.addEventListener('resize', redrawCanvas);
    return () => window.removeEventListener('resize', redrawCanvas);
  }, [detections, imageId, type]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}
