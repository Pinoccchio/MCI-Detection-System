'use client';

/**
 * MRI Viewer Component
 * Canvas-based NIfTI/medical image viewer with slice navigation
 * Supports axial, sagittal, and coronal views
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Layers,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from 'lucide-react';

export type ViewOrientation = 'axial' | 'sagittal' | 'coronal';
export type DisplayMode = 'grayscale' | 'mask';

interface MRIViewerProps {
  imageData: Float32Array | number[][][] | null;
  dimensions: [number, number, number];
  onSliceChange?: (slice: number, orientation: ViewOrientation) => void;
  selectedSlice?: number;
  orientation?: ViewOrientation;
  className?: string;
  showControls?: boolean;
  /** Display mode: 'grayscale' for standard MRI, 'mask' for segmentation masks */
  displayMode?: DisplayMode;
  /** Color for mask regions (default: cyan for better visibility) */
  maskColor?: { r: number; g: number; b: number };
  /** Children to render as overlay (e.g., TracingCanvas) */
  children?: React.ReactNode;
}

export function MRIViewer({
  imageData,
  dimensions,
  onSliceChange,
  selectedSlice,
  orientation: initialOrientation = 'axial',
  className = '',
  showControls = true,
  displayMode = 'mask', // Default to mask mode for segmentation data
  maskColor = { r: 0, g: 200, b: 255 }, // Cyan color for hippocampus
  children,
}: MRIViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [orientation, setOrientation] = useState<ViewOrientation>(initialOrientation);
  const [currentSlice, setCurrentSlice] = useState(selectedSlice ?? 0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPosition, setLastPanPosition] = useState({ x: 0, y: 0 });
  const [windowLevel, setWindowLevel] = useState({ center: 0.5, width: 1 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get max slices based on orientation
  const getMaxSlices = useCallback(() => {
    if (!dimensions) return 0;
    switch (orientation) {
      case 'axial':
        return dimensions[2];
      case 'sagittal':
        return dimensions[0];
      case 'coronal':
        return dimensions[1];
      default:
        return dimensions[2];
    }
  }, [orientation, dimensions]);

  // Get slice dimensions
  const getSliceDimensions = useCallback(() => {
    if (!dimensions) return { width: 256, height: 256 };
    switch (orientation) {
      case 'axial':
        return { width: dimensions[0], height: dimensions[1] };
      case 'sagittal':
        return { width: dimensions[1], height: dimensions[2] };
      case 'coronal':
        return { width: dimensions[0], height: dimensions[2] };
      default:
        return { width: dimensions[0], height: dimensions[1] };
    }
  }, [orientation, dimensions]);

  // Extract slice data
  const extractSlice = useCallback(
    (sliceIndex: number): number[][] | null => {
      if (!imageData || !dimensions) return null;

      const [dimX, dimY, dimZ] = dimensions;
      const slice: number[][] = [];

      // Handle different data formats
      const getData = (x: number, y: number, z: number): number => {
        if (Array.isArray(imageData)) {
          return (imageData as number[][][])[x]?.[y]?.[z] ?? 0;
        }
        // Flat Float32Array
        const index = x + y * dimX + z * dimX * dimY;
        return (imageData as Float32Array)[index] ?? 0;
      };

      switch (orientation) {
        case 'axial':
          for (let y = 0; y < dimY; y++) {
            const row: number[] = [];
            for (let x = 0; x < dimX; x++) {
              row.push(getData(x, y, sliceIndex));
            }
            slice.push(row);
          }
          break;
        case 'sagittal':
          for (let z = 0; z < dimZ; z++) {
            const row: number[] = [];
            for (let y = 0; y < dimY; y++) {
              row.push(getData(sliceIndex, y, z));
            }
            slice.push(row);
          }
          break;
        case 'coronal':
          for (let z = 0; z < dimZ; z++) {
            const row: number[] = [];
            for (let x = 0; x < dimX; x++) {
              row.push(getData(x, sliceIndex, z));
            }
            slice.push(row);
          }
          break;
      }

      return slice;
    },
    [imageData, dimensions, orientation]
  );

  // Render the slice to canvas
  const renderSlice = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const sliceData = extractSlice(currentSlice);
    if (!sliceData) return;

    const height = sliceData.length;
    const width = sliceData[0]?.length || 0;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Create image data
    const imgData = ctx.createImageData(width, height);

    if (displayMode === 'mask') {
      // Mask mode: Show non-zero regions in color on dark background
      // Better for viewing sparse segmentation masks
      const bgColor = { r: 20, g: 25, b: 35 }; // Dark blue-gray background

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = sliceData[y][x];
          const idx = (y * width + x) * 4;

          if (val > 0.01) {
            // Non-zero: show in mask color with intensity
            const intensity = Math.min(1, val);
            imgData.data[idx] = Math.floor(maskColor.r * intensity); // R
            imgData.data[idx + 1] = Math.floor(maskColor.g * intensity); // G
            imgData.data[idx + 2] = Math.floor(maskColor.b * intensity); // B
            imgData.data[idx + 3] = 255; // A
          } else {
            // Zero: dark background
            imgData.data[idx] = bgColor.r;
            imgData.data[idx + 1] = bgColor.g;
            imgData.data[idx + 2] = bgColor.b;
            imgData.data[idx + 3] = 255;
          }
        }
      }
    } else {
      // Grayscale mode: Standard MRI visualization with window/level
      const windowMin = windowLevel.center - windowLevel.width / 2;
      const windowMax = windowLevel.center + windowLevel.width / 2;
      const windowRange = windowMax - windowMin;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const val = sliceData[y][x];

          // Apply window/level contrast adjustment
          let adjusted = windowRange > 0 ? (val - windowMin) / windowRange : val;
          adjusted = Math.max(0, Math.min(1, adjusted));

          const pixelVal = Math.floor(adjusted * 255);
          const idx = (y * width + x) * 4;

          imgData.data[idx] = pixelVal; // R
          imgData.data[idx + 1] = pixelVal; // G
          imgData.data[idx + 2] = pixelVal; // B
          imgData.data[idx + 3] = 255; // A
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }, [currentSlice, extractSlice, imageData, windowLevel, displayMode, maskColor]);

  // Render on data change
  useEffect(() => {
    renderSlice();
  }, [renderSlice]);

  // Reset slice when orientation changes
  useEffect(() => {
    const maxSlices = getMaxSlices();
    setCurrentSlice(Math.floor(maxSlices / 2));
  }, [orientation, getMaxSlices]);

  // Handle slice change
  const handleSliceChange = (newSlice: number) => {
    const maxSlices = getMaxSlices();
    const clampedSlice = Math.max(0, Math.min(maxSlices - 1, newSlice));
    setCurrentSlice(clampedSlice);
    onSliceChange?.(clampedSlice, orientation);
  };

  // Handle mouse wheel for slice navigation
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    handleSliceChange(currentSlice + delta);
  };

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPosition.x;
      const dy = e.clientY - lastPanPosition.y;
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastPanPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setWindowLevel({ center: 0.5, width: 1 });
  };

  const sliceDims = getSliceDimensions();
  const maxSlices = getMaxSlices();

  // Fullscreen modal
  const FullscreenModal = () => (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black/80">
        <span className="text-white">
          {orientation.charAt(0).toUpperCase() + orientation.slice(1)} View - Slice{' '}
          {currentSlice + 1}/{maxSlices}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => setIsFullscreen(false)}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain"
          style={{
            transform: `scale(${zoom * 2}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            imageRendering: 'pixelated',
          }}
        />
      </div>
    </div>
  );

  if (!imageData) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <Layers className="h-12 w-12 mb-4 opacity-50" />
          <p>No image data loaded</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      {isFullscreen && <FullscreenModal />}

      <Card className={`overflow-hidden ${className}`}>
        {/* Toolbar */}
        {showControls && (
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            {/* Orientation selector */}
            <div className="flex items-center gap-1">
              {(['axial', 'sagittal', 'coronal'] as ViewOrientation[]).map((view) => (
                <Button
                  key={view}
                  variant={orientation === view ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setOrientation(view)}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </Button>
              ))}
            </div>

            {/* View controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                title="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                title="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={resetView} title="Reset view">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(true)}
                title="Fullscreen"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Canvas container */}
        <div
          ref={containerRef}
          className="relative bg-black overflow-hidden"
          style={{ height: '400px' }}
          onWheel={handleWheel}
        >
          {/* Wrapper for both canvases - centered together */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ pointerEvents: 'none' }}
          >
            {/* Stack container - holds both canvases in same position */}
            <div
              className="relative"
              style={{
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
              }}
            >
              {/* MRI Canvas - base layer */}
              <canvas
                ref={canvasRef}
                style={{
                  imageRendering: 'pixelated',
                  display: 'block',
                }}
              />

              {/* TracingCanvas overlay - exact same size/position as MRI canvas */}
              {children && (() => {
                const sliceDims = getSliceDimensions();
                return (
                  <div
                    className="absolute top-0 left-0"
                    style={{
                      width: sliceDims.width,
                      height: sliceDims.height,
                      pointerEvents: 'auto',
                    }}
                  >
                    {children}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Slice navigator */}
        {showControls && (
          <div className="flex items-center gap-3 p-3 border-t bg-muted/30">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSliceChange(currentSlice - 1)}
              disabled={currentSlice <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <input
                type="range"
                min={0}
                max={maxSlices - 1}
                value={currentSlice}
                onChange={(e) => handleSliceChange(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSliceChange(currentSlice + 1)}
              disabled={currentSlice >= maxSlices - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground min-w-[80px] text-center">
              Slice {currentSlice + 1} / {maxSlices}
            </span>
          </div>
        )}
      </Card>
    </>
  );
}
