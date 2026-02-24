'use client';

/**
 * Tracing Interface Component
 * Mask Review & Correction Tool for hippocampal segmentation masks
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MRIViewer, ViewOrientation } from '@/components/viewer/MRIViewer';
import {
  TracingCanvas,
  TracingCanvasRef,
  TracingTool,
  HippocampusSide,
} from '@/components/viewer/TracingCanvas';
import { TracingToolbar } from '@/components/viewer/TracingToolbar';
import {
  Upload,
  Layers,
  Brain,
  ChevronDown,
  FileImage,
  AlertCircle,
  CheckCircle,
  Info,
  Activity,
  History,
  Trash2,
  Eye,
  X,
} from 'lucide-react';
import type { MRIScan, AnalysisResult, MaskCorrection } from '@/types/database';
import { getSignedUrl } from '@/lib/storage/upload';
import { fetchAndParseNIfTI, type NIfTIData } from '@/lib/nifti/parser';

interface TracingInterfaceProps {
  scans: MRIScan[];
  userId: string;
}

// Demo data for testing when no real NIfTI is loaded
function generateDemoData(): { data: number[][][]; dimensions: [number, number, number] } {
  const dimX = 64;
  const dimY = 64;
  const dimZ = 48;

  const data: number[][][] = [];

  // Generate synthetic hippocampus-like shape
  for (let x = 0; x < dimX; x++) {
    const plane: number[][] = [];
    for (let y = 0; y < dimY; y++) {
      const row: number[] = [];
      for (let z = 0; z < dimZ; z++) {
        // Create ellipsoid-like structure
        const cx = dimX / 2;
        const cy = dimY / 2;
        const cz = dimZ / 2;

        const dx = (x - cx) / (dimX / 4);
        const dy = (y - cy) / (dimY / 4);
        const dz = (z - cz) / (dimZ / 3);

        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Create a kidney-bean like shape
        const angle = Math.atan2(dy, dx);
        const shape = 1 + 0.3 * Math.cos(angle * 2);

        if (dist < shape) {
          row.push(1.0 - dist / shape);
        } else {
          row.push(0);
        }
      }
      plane.push(row);
    }
    data.push(plane);
  }

  return { data, dimensions: [dimX, dimY, dimZ] };
}

export function TracingInterface({ scans, userId }: TracingInterfaceProps) {
  const tracingCanvasRef = useRef<TracingCanvasRef>(null);

  // State
  const [selectedScan, setSelectedScan] = useState<MRIScan | null>(null);
  const [imageData, setImageData] = useState<number[][][] | null>(null);
  const [dimensions, setDimensions] = useState<[number, number, number]>([64, 64, 48]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [maskStats, setMaskStats] = useState<{
    nonZeroCount: number;
    totalVoxels: number;
    percentage: string;
    hasData: boolean;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Tracing state
  const [activeTool, setActiveTool] = useState<TracingTool>('pen');
  const [activeSide, setActiveSide] = useState<HippocampusSide>('left');
  const [brushSize, setBrushSize] = useState(8);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [orientation, setOrientation] = useState<ViewOrientation>('axial');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showScanSelector, setShowScanSelector] = useState(false);

  // Corrections history state
  const [corrections, setCorrections] = useState<MaskCorrection[]>([]);
  const [isLoadingCorrections, setIsLoadingCorrections] = useState(false);
  const [loadedCorrectionId, setLoadedCorrectionId] = useState<string | null>(null);

  // Load demo data on mount
  useEffect(() => {
    const demo = generateDemoData();
    setImageData(demo.data);
    setDimensions(demo.dimensions);
    setCurrentSlice(Math.floor(demo.dimensions[2] / 2));
  }, []);

  // Fetch corrections for a scan
  const fetchCorrections = async (scanId: string) => {
    setIsLoadingCorrections(true);
    try {
      const response = await fetch(`/api/tracings?scan_id=${scanId}`);
      const result = await response.json();
      if (response.ok && result.data?.corrections) {
        setCorrections(result.data.corrections);
      } else {
        setCorrections([]);
      }
    } catch (err) {
      console.error('Failed to fetch corrections:', err);
      setCorrections([]);
    } finally {
      setIsLoadingCorrections(false);
    }
  };

  // Delete a correction
  const handleDeleteCorrection = async (correctionId: string) => {
    if (!confirm('Are you sure you want to delete this correction?')) return;

    try {
      const response = await fetch(`/api/tracings?correction_id=${correctionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCorrections(prev => prev.filter(c => c.id !== correctionId));
        setSuccessMessage('Correction deleted');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const result = await response.json();
        setError(result.error || 'Failed to delete correction');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete correction');
    }
  };

  // Load a saved correction onto the canvas
  const handleLoadCorrection = async (correction: MaskCorrection) => {
    // Navigate to the slice and orientation
    setCurrentSlice(correction.slice_index);
    setOrientation(correction.orientation as ViewOrientation);
    setActiveSide(correction.side === 'both' ? 'left' : correction.side as HippocampusSide);

    // Load the mask image onto the canvas if available
    if (correction.actions?.mask_base64 && tracingCanvasRef.current) {
      try {
        await tracingCanvasRef.current.loadFromBase64(correction.actions.mask_base64);
        setLoadedCorrectionId(correction.id);
        setSuccessMessage(`Loaded correction for slice ${correction.slice_index + 1}`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error('Failed to load correction image:', err);
        setError('Failed to load correction image');
      }
    } else {
      setSuccessMessage(`Navigated to slice ${correction.slice_index + 1}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Clear the loaded correction from canvas
  const handleClearCanvas = () => {
    tracingCanvasRef.current?.clearTracing();
    setLoadedCorrectionId(null);
  };

  // Handle scan selection
  const handleScanSelect = async (scan: MRIScan) => {
    setSelectedScan(scan);
    setShowScanSelector(false);
    setError(null);
    setIsLoading(true);

    try {
      // Fetch the actual NIfTI file from Supabase storage
      if (!scan.file_path) {
        throw new Error('Scan has no file path');
      }

      // Start parallel fetches for analysis and corrections immediately
      // These don't depend on the NIfTI file being loaded
      const analysisPromise = fetch(`/api/analyses?scanId=${scan.id}&limit=1`)
        .then(res => res.ok ? res.json() : { analyses: [] })
        .catch((err) => {
          console.warn('[TracingInterface] Could not fetch analysis result:', err);
          return { analyses: [] };
        });

      const correctionsPromise = fetch(`/api/tracings?scan_id=${scan.id}`)
        .then(res => res.json())
        .then(result => result.data?.corrections || [])
        .catch(() => []);

      // Get signed URL for the scan file
      const urlResult = await getSignedUrl('mri-scans', scan.file_path, 3600);
      if (!urlResult.url) {
        throw new Error(urlResult.error || 'Failed to get scan URL');
      }

      // Fetch and parse the NIfTI file (this is the slowest operation)
      const niftiData = await fetchAndParseNIfTI(urlResult.url, scan.file_path);

      // Store mask statistics for display
      if (niftiData.stats) {
        const { nonZeroCount, totalVoxels } = niftiData.stats;
        const pct = ((nonZeroCount / totalVoxels) * 100).toFixed(3);
        setMaskStats({
          nonZeroCount,
          totalVoxels,
          percentage: pct,
          hasData: nonZeroCount > 0,
        });
        console.log(`[TracingInterface] Loaded mask: ${nonZeroCount}/${totalVoxels} (${pct}%) voxels contain hippocampus`);
      } else {
        setMaskStats(null);
      }

      // Wait for parallel fetches to complete
      const [analysisResult, correctionsData] = await Promise.all([
        analysisPromise,
        correctionsPromise,
      ]);

      // Set analysis result
      if (analysisResult.analyses && analysisResult.analyses.length > 0) {
        setAnalysisResult(analysisResult.analyses[0]);
        console.log(`[TracingInterface] Analysis result: ${analysisResult.analyses[0].prediction} (${(analysisResult.analyses[0].confidence * 100).toFixed(1)}%)`);
      } else {
        setAnalysisResult(null);
      }

      // Set corrections
      setCorrections(correctionsData);

      setImageData(niftiData.data);
      setDimensions(niftiData.dimensions);
      setCurrentSlice(Math.floor(niftiData.dimensions[2] / 2));

      // Clear existing tracings
      tracingCanvasRef.current?.clearTracing();
    } catch (err: any) {
      console.error('Failed to load scan:', err);
      setError(err.message || 'Failed to load scan');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tracing change (for undo/redo state)
  const handleTracingChange = useCallback(() => {
    setCanUndo(tracingCanvasRef.current?.canUndo() || false);
    setCanRedo(tracingCanvasRef.current?.canRedo() || false);
  }, []);

  // Handle save tracing
  const handleSave = async () => {
    if (!selectedScan) {
      setError('No scan selected. Please select a scan first.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const maskData = tracingCanvasRef.current?.getMaskData();

      if (!maskData?.left && !maskData?.right) {
        throw new Error('No tracing data to save. Please draw corrections first.');
      }

      // Get the tracing data as ImageData
      const tracingData = tracingCanvasRef.current?.getTracingData();
      let base64Data = '';

      if (tracingData) {
        // Convert ImageData to base64 PNG
        const canvas = document.createElement('canvas');
        canvas.width = tracingData.width;
        canvas.height = tracingData.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(tracingData, 0, 0);
          base64Data = canvas.toDataURL('image/png');
        }
      }

      // Call the API to save the correction
      const response = await fetch('/api/tracings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: selectedScan.id,
          mask_data: base64Data,
          slice_index: currentSlice,
          orientation: orientation,
          metadata: {
            side: activeSide,
            tool: activeTool,
            brushSize: brushSize,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save correction');
      }

      // Show detailed success message
      const { data } = result;
      setSuccessMessage(
        `Correction saved! Slice ${data.slice_index + 1} (${data.orientation}) for ${data.patient_name} - ID: ${data.id.slice(0, 8)}`
      );
      setTimeout(() => setSuccessMessage(null), 5000);

      // Refresh corrections list
      if (selectedScan) {
        fetchCorrections(selectedScan.id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save correction');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle export
  const handleExport = () => {
    const tracingData = tracingCanvasRef.current?.getTracingData();
    if (!tracingData) {
      setError('No tracing data to export');
      return;
    }

    // Create canvas and export as PNG
    const canvas = document.createElement('canvas');
    canvas.width = tracingData.width;
    canvas.height = tracingData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(tracingData, 0, 0);

    const link = document.createElement('a');
    link.download = `hippocampal_tracing_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Get canvas dimensions based on orientation
  const getCanvasDimensions = () => {
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
  };

  const canvasDims = getCanvasDimensions();

  return (
    <div className="space-y-6">
      {/* Scan Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">
                {selectedScan
                  ? `${(selectedScan as any).patients?.full_name || 'Unknown Patient'} - ${selectedScan.scan_type}`
                  : 'Demo Mode - Sample Mask'}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedScan
                  ? `Scan ID: ${selectedScan.id.slice(0, 8)}...`
                  : 'Select a scan to review its hippocampal mask'}
              </p>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowScanSelector(!showScanSelector)}
              disabled={scans.length === 0}
            >
              <FileImage className="h-4 w-4 mr-2" />
              Select Scan
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>

            {showScanSelector && (
              <Card className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-y-auto shadow-lg">
                <div className="p-2">
                  {scans.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center">
                      No completed scans available
                    </p>
                  ) : (
                    scans.map((scan) => (
                      <button
                        key={scan.id}
                        className="w-full text-left p-3 hover:bg-muted rounded-lg transition-colors"
                        onClick={() => handleScanSelect(scan)}
                      >
                        <p className="font-medium">
                          {(scan as any).patients?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {scan.scan_type} - {new Date(scan.scan_date).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })} - ID: {scan.id.slice(0, 8)}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </Card>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600">
          <CheckCircle className="h-5 w-5" />
          <p>{successMessage}</p>
        </div>
      )}

      {/* Tracing Toolbar */}
      <TracingToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        activeSide={activeSide}
        onSideChange={setActiveSide}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => tracingCanvasRef.current?.undo()}
        onRedo={() => tracingCanvasRef.current?.redo()}
        onClear={handleClearCanvas}
        onSave={handleSave}
        onExport={handleExport}
        isSaving={isSaving}
      />

      {/* Main Viewer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* MRI Viewer with Tracing Overlay */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center h-[500px] bg-muted">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading scan...</p>
                </div>
              </div>
            ) : imageData ? (
              <>
                {/* MRI Viewer with TracingCanvas overlay */}
                <MRIViewer
                  imageData={imageData}
                  dimensions={dimensions}
                  selectedSlice={currentSlice}
                  orientation={orientation}
                  onSliceChange={(slice, orient) => {
                    setCurrentSlice(slice);
                    setOrientation(orient);
                  }}
                >
                  {/* TracingCanvas overlaid on MRI Viewer */}
                  <TracingCanvas
                    ref={tracingCanvasRef}
                    width={canvasDims.width}
                    height={canvasDims.height}
                    tool={activeTool}
                    brushSize={brushSize}
                    side={activeSide}
                    zoom={1}
                    pan={{ x: 0, y: 0 }}
                    onTracingChange={handleTracingChange}
                    className="w-full h-full"
                  />
                </MRIViewer>
              </>
            ) : (
              <div className="flex items-center justify-center h-[500px] bg-muted">
                <div className="text-center text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Mask Review & Correction</p>
                  <p className="text-sm mt-1">Select an analyzed scan to review its hippocampal mask</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Side Panel - Instructions & Info */}
        <div className="space-y-4">
          {/* Current Slice Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Current View
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Orientation:</span>
                <span className="font-medium capitalize">{orientation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slice:</span>
                <span className="font-medium">
                  {currentSlice + 1} / {dimensions[2]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium font-mono text-xs">
                  {dimensions.join(' x ')}
                </span>
              </div>
            </div>
          </Card>

          {/* Color Legend */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Color Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: 'rgb(0, 200, 255)' }} />
                <span className="text-sm">Detected Hippocampus</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-blue-500/60 border-2 border-blue-500" />
                <span className="text-sm">Your Corrections (Left)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-orange-500/60 border-2 border-orange-500" />
                <span className="text-sm">Your Corrections (Right)</span>
              </div>
            </div>
          </Card>

          {/* Analysis Result */}
          {selectedScan && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Analysis Result
              </h3>
              <div className="space-y-3 text-sm">
                {analysisResult ? (
                  <>
                    {/* ML Prediction */}
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Prediction:</span>
                      <span className={`font-semibold ${
                        analysisResult.prediction === 'Cognitively Normal'
                          ? 'text-green-600'
                          : 'text-amber-600'
                      }`}>
                        {analysisResult.prediction === 'Cognitively Normal' ? 'Normal' : 'MCI'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confidence:</span>
                      <span className="font-medium">{(analysisResult.confidence * 100).toFixed(1)}%</span>
                    </div>

                    {/* Volumetry from ML model (if available) */}
                    {analysisResult.volumetry && (
                      <>
                        <div className="border-t my-2" />
                        <p className="text-xs text-muted-foreground font-medium mb-1">Hippocampal Volume</p>
                        {analysisResult.volumetry.left_hippocampus !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Left:</span>
                            <span className="font-mono text-xs">
                              {analysisResult.volumetry.left_hippocampus.toFixed(0)} mm³
                            </span>
                          </div>
                        )}
                        {analysisResult.volumetry.right_hippocampus !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Right:</span>
                            <span className="font-mono text-xs">
                              {analysisResult.volumetry.right_hippocampus.toFixed(0)} mm³
                            </span>
                          </div>
                        )}
                        {analysisResult.volumetry.total_volume !== undefined && (
                          <div className="flex justify-between font-medium">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-mono text-xs">
                              {analysisResult.volumetry.total_volume.toFixed(0)} mm³
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Mask info */}
                    {maskStats && maskStats.hasData && (
                      <>
                        <div className="border-t my-2" />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mask Voxels:</span>
                          <span className="font-mono text-xs">
                            {maskStats.nonZeroCount.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground italic text-center py-2">
                    No analysis result available for this scan
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Instructions */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              How to Review & Correct
            </h3>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li>Select an analyzed scan from the dropdown</li>
              <li>Review the detected hippocampal mask (cyan regions)</li>
              <li>Navigate slices to check all detected areas</li>
              <li>Use pen tool to add missed regions</li>
              <li>Use eraser to remove false positives</li>
              <li>Save corrections when finished</li>
            </ol>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scroll:</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Mouse Wheel</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Undo:</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Redo:</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl+Y</kbd>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cancel polygon:</span>
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Escape</kbd>
              </div>
            </div>
          </Card>

          {/* Corrections History */}
          {selectedScan && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <History className="h-4 w-4" />
                Saved Corrections
                {corrections.length > 0 && (
                  <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {corrections.length}
                  </span>
                )}
              </h3>

              {/* Clear canvas button when correction is loaded */}
              {loadedCorrectionId && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Correction loaded on canvas
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-blue-700 hover:text-blue-900 dark:text-blue-300"
                      onClick={handleClearCanvas}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {isLoadingCorrections ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Loading...
                  </p>
                ) : corrections.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No corrections saved yet
                  </p>
                ) : (
                  corrections.map((correction) => (
                    <div
                      key={correction.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                        loadedCorrectionId === correction.id
                          ? 'bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700'
                          : 'bg-muted/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          Slice {correction.slice_index + 1} ({correction.orientation})
                          {loadedCorrectionId === correction.id && (
                            <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(loaded)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {correction.side} · {new Date(correction.created_at).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-primary hover:text-primary"
                          onClick={() => handleLoadCorrection(correction)}
                          title="Load correction onto canvas"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCorrection(correction.id)}
                          title="Delete correction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
