'use client';

/**
 * Grad-CAM Visualization Viewer Component
 * Displays feature importance heatmap visualization for MRI analysis results
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  X,
  Info,
} from 'lucide-react';

interface GradCAMViewerProps {
  gradcamImage: string | null;
  prediction: string;
  confidence: number;
  className?: string;
}

export function GradCAMViewer({
  gradcamImage,
  prediction,
  confidence,
  className = '',
}: GradCAMViewerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!gradcamImage) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Feature Importance Visualization</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Info className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">Visualization not available for this analysis.</p>
          <p className="text-xs mt-2">
            Re-run the analysis to generate feature importance heatmap.
          </p>
        </div>
      </Card>
    );
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = gradcamImage;
    link.download = `gradcam_${prediction.replace(/\s+/g, '_')}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      setZoom(1);
    }
  };

  const FullscreenModal = () => (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={toggleFullscreen}
    >
      <div
        className="relative max-w-[95vw] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 text-white hover:bg-white/20"
          onClick={toggleFullscreen}
        >
          <X className="h-6 w-6" />
        </Button>
        <img
          src={gradcamImage}
          alt="Feature Importance Heatmap - Fullscreen"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          style={{ transform: `scale(${zoom})` }}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white text-sm min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isFullscreen && <FullscreenModal />}

      <Card className={`p-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Feature Importance Visualization</h3>
              <p className="text-xs text-muted-foreground">
                Highlighting regions that influenced the prediction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVisible(!isVisible)}
              title={isVisible ? 'Hide visualization' : 'Show visualization'}
            >
              {isVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Image Container */}
        {isVisible && (
          <div className="relative overflow-hidden rounded-lg bg-muted/50 border">
            <div
              className="overflow-auto max-h-[500px]"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '300px',
              }}
            >
              <img
                src={gradcamImage}
                alt="Feature Importance Heatmap"
                className="transition-transform duration-200 cursor-pointer"
                style={{ transform: `scale(${zoom})` }}
                onClick={toggleFullscreen}
              />
            </div>
          </div>
        )}

        {/* Legend */}
        {isVisible && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Color Legend</h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-20 h-4 rounded bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500" />
                <div className="flex justify-between w-32 text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Warmer colors indicate regions with higher importance to the prediction.
              </p>
            </div>

            {/* Prediction Summary */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Prediction:</span>
                <span
                  className={`font-medium ${
                    prediction === 'Cognitively Normal'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}
                >
                  {prediction}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-muted-foreground">Confidence:</span>
                <span className="font-medium">{(confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
