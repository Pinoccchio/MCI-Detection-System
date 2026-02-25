'use client';

/**
 * Batch Processor Component
 * Enhanced batch processing interface for researchers
 */

import { useState, useCallback, useRef } from 'react';
import { PredictionResponse } from '@/types/api';
import { createAnalysis } from '@/lib/api/analyses';
import { getSignedUrl } from '@/lib/storage/upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import {
  exportToCSV,
  exportToJSON,
  formatAnalysisForExport,
  ANALYSIS_EXPORT_COLUMNS,
} from '@/lib/utils/export';
import {
  Play,
  Pause,
  RotateCcw,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Clock,
  Download,
  FileSpreadsheet,
  FileJson,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface BatchProcessorProps {
  scans: any[];
  userId: string;
}

interface ProcessingItem {
  id: string;
  scanId: string;
  patientName: string;
  scanDate: string;
  scanType: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'skipped';
  result?: PredictionResponse;
  error?: string;
  startTime?: number;
  endTime?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BatchProcessor({ scans, userId }: BatchProcessorProps) {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [processingItems, setProcessingItems] = useState<ProcessingItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refs for pause control
  const pauseRef = useRef(false);
  const abortRef = useRef(false);

  // Filter scans that haven't been analyzed yet or have files
  const availableScans = scans.filter(
    (scan) => scan.file_path && scan.status === 'completed'
  );

  // Apply search filter
  const filteredScans = availableScans.filter((scan) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const name = scan.patients?.full_name?.toLowerCase() || '';
    const patientId = scan.patients?.patient_id?.toLowerCase() || '';
    return name.includes(search) || patientId.includes(search);
  });

  // Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredScans.map((s) => s.id)));
  }, [filteredScans]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Run analysis for a single scan
  const runSingleAnalysis = async (
    scan: any
  ): Promise<{
    success: boolean;
    result?: PredictionResponse;
    error?: string;
  }> => {
    try {
      // Get signed URL for the file
      const urlResult = await getSignedUrl('mri-scans', scan.file_path, 3600);
      if (!urlResult.url) {
        throw new Error('Failed to get scan file URL');
      }

      // Send signed URL to ML backend (backend downloads directly - much faster!)
      const formData = new FormData();
      const originalFilename = scan.file_path.split('/').pop() || 'scan.nii';
      formData.append('file_url', urlResult.url);
      formData.append('filename', originalFilename);
      formData.append('generate_gradcam', 'true');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const predictResponse = await fetch(`${apiUrl}/api/v1/predict-from-url`, {
        method: 'POST',
        body: formData,
      });

      if (!predictResponse.ok) {
        const errorData = await predictResponse.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const predictionResult: PredictionResponse = await predictResponse.json();

      // Save to database
      const saveResult = await createAnalysis({
        scan_id: scan.id,
        model_version: predictionResult.model_version,
        prediction: predictionResult.class_name,
        confidence: predictionResult.confidence,
        probabilities: {
          'Cognitively Normal':
            predictionResult.probabilities['Cognitively Normal'],
          'Mild Cognitive Impairment':
            predictionResult.probabilities['Mild Cognitive Impairment'],
        },
        volumetry: predictionResult.volumetry
          ? {
              left_hippocampus: predictionResult.volumetry.left_hippocampus,
              right_hippocampus: predictionResult.volumetry.right_hippocampus,
              total_volume: predictionResult.volumetry.total_volume,
            }
          : undefined,
        features: predictionResult.features || undefined,
        gradcam_image: predictionResult.gradcam_image || undefined,
      });

      if (!saveResult.success) {
        throw new Error(saveResult.error || 'Failed to save results');
      }

      return { success: true, result: predictionResult };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Start batch processing
  const startBatch = async () => {
    if (selectedIds.size === 0) return;

    setIsRunning(true);
    setIsPaused(false);
    pauseRef.current = false;
    abortRef.current = false;
    setCurrentIndex(0);

    // Initialize processing items
    const items: ProcessingItem[] = Array.from(selectedIds).map((scanId) => {
      const scan = scans.find((s) => s.id === scanId);
      return {
        id: `${scanId}-${Date.now()}`,
        scanId,
        patientName: scan?.patients?.full_name || 'Unknown',
        scanDate: scan?.scan_date || '',
        scanType: scan?.scan_type || 'MRI',
        status: 'pending',
      };
    });
    setProcessingItems(items);

    // Process each scan
    for (let i = 0; i < items.length; i++) {
      // Check for abort
      if (abortRef.current) {
        break;
      }

      // Check for pause
      while (pauseRef.current && !abortRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (abortRef.current) break;

      const item = items[i];
      const scan = scans.find((s) => s.id === item.scanId);

      if (!scan) {
        setProcessingItems((prev) =>
          prev.map((p) =>
            p.id === item.id
              ? { ...p, status: 'skipped', error: 'Scan not found' }
              : p
          )
        );
        continue;
      }

      // Update status to processing
      setProcessingItems((prev) =>
        prev.map((p) =>
          p.id === item.id ? { ...p, status: 'processing', startTime: Date.now() } : p
        )
      );
      setCurrentIndex(i);

      // Run analysis
      const result = await runSingleAnalysis(scan);

      // Update status with result
      setProcessingItems((prev) =>
        prev.map((p) =>
          p.id === item.id
            ? {
                ...p,
                status: result.success ? 'completed' : 'error',
                result: result.result,
                error: result.error,
                endTime: Date.now(),
              }
            : p
        )
      );
    }

    setIsRunning(false);
  };

  // Pause/Resume handlers
  const pauseBatch = () => {
    pauseRef.current = true;
    setIsPaused(true);
  };

  const resumeBatch = () => {
    pauseRef.current = false;
    setIsPaused(false);
  };

  // Reset/New batch
  const resetBatch = () => {
    abortRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
    setProcessingItems([]);
    setCurrentIndex(0);
    setSelectedIds(new Set());
  };

  // Export results
  const handleExportCSV = () => {
    const completedItems = processingItems.filter(
      (item) => item.status === 'completed' && item.result
    );
    if (completedItems.length === 0) {
      alert('No completed results to export');
      return;
    }

    const exportData = completedItems.map((item) => {
      const scan = scans.find((s) => s.id === item.scanId);
      return formatAnalysisForExport({
        id: item.id,
        scan_id: item.scanId,
        prediction: item.result!.class_name,
        confidence: item.result!.confidence,
        probabilities: item.result!.probabilities,
        model_version: item.result!.model_version,
        volumetry: item.result!.volumetry,
        created_at: new Date().toISOString(),
        mri_scans: {
          scan_date: scan?.scan_date,
          scan_type: scan?.scan_type,
          patients: scan?.patients,
        },
      });
    });

    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `batch-results-${timestamp}`, ANALYSIS_EXPORT_COLUMNS);
  };

  const handleExportJSON = () => {
    const completedItems = processingItems.filter(
      (item) => item.status === 'completed' && item.result
    );
    if (completedItems.length === 0) {
      alert('No completed results to export');
      return;
    }

    const exportData = completedItems.map((item) => {
      const scan = scans.find((s) => s.id === item.scanId);
      return {
        scan_id: item.scanId,
        patient: scan?.patients?.full_name,
        scan_date: scan?.scan_date,
        prediction: item.result!.class_name,
        confidence: item.result!.confidence,
        probabilities: item.result!.probabilities,
        volumetry: item.result!.volumetry,
        model_version: item.result!.model_version,
        processed_at: new Date().toISOString(),
      };
    });

    const timestamp = new Date().toISOString().split('T')[0];
    exportToJSON(exportData, `batch-results-${timestamp}`);
  };

  // Calculate stats
  const completedCount = processingItems.filter(
    (i) => i.status === 'completed'
  ).length;
  const errorCount = processingItems.filter((i) => i.status === 'error').length;
  const progressPercent =
    processingItems.length > 0
      ? ((completedCount + errorCount) / processingItems.length) * 100
      : 0;

  const showSelection = !isRunning && processingItems.length === 0;
  const showProgress = isRunning || processingItems.length > 0;

  return (
    <div className="space-y-6">
      {showSelection && (
        <>
          {/* Search and Selection */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Selection Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  <Square className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  {selectedIds.size} of {filteredScans.length} selected
                </span>
              </div>
            </div>

            {/* Scans List */}
            <div className="max-h-80 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {filteredScans.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No scans available for batch processing</p>
                  <p className="text-sm mt-1">
                    Scans must be uploaded and have completed status
                  </p>
                </div>
              ) : (
                filteredScans.map((scan) => (
                  <label
                    key={scan.id}
                    className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 ${
                      selectedIds.has(scan.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(scan.id)}
                      onChange={() => toggleSelection(scan.id)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {scan.patients?.full_name || 'Unknown Patient'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {scan.scan_type} - {formatDate(scan.scan_date)}
                      </p>
                    </div>
                    <Badge variant="outline">{scan.status}</Badge>
                  </label>
                ))
              )}
            </div>

            {/* Start Button */}
            <Button
              onClick={startBatch}
              disabled={selectedIds.size === 0}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Batch Analysis ({selectedIds.size} scans)
            </Button>
          </div>
        </>
      )}

      {showProgress && (
        <>
          {/* Progress Summary */}
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{processingItems.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {completedCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-600">{errorCount}</p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>

              {isRunning && (
                <div className="flex items-center gap-2">
                  {isPaused ? (
                    <Badge variant="secondary">Paused</Badge>
                  ) : (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm">Processing...</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <Progress value={progressPercent} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedCount + errorCount} of {processingItems.length} processed (
              {progressPercent.toFixed(0)}%)
            </p>
          </div>

          {/* Processing Items List */}
          <div className="max-h-64 overflow-y-auto border border-border rounded-lg divide-y divide-border">
            {processingItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 ${
                  item.status === 'processing' ? 'bg-primary/5' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm text-muted-foreground w-6">
                    {index + 1}.
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{item.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.scanType} - {formatDate(item.scanDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {item.status === 'pending' && (
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                  {item.status === 'processing' && (
                    <Badge variant="secondary">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Processing
                    </Badge>
                  )}
                  {item.status === 'completed' && (
                    <Badge
                      variant={
                        item.result?.class_name === 'Mild Cognitive Impairment'
                          ? 'destructive'
                          : 'default'
                      }
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {item.result?.class_name === 'Mild Cognitive Impairment'
                        ? 'MCI'
                        : 'Normal'}
                      {' '}
                      ({((item.result?.confidence || 0) * 100).toFixed(0)}%)
                    </Badge>
                  )}
                  {item.status === 'error' && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                  {item.status === 'skipped' && (
                    <Badge variant="outline">Skipped</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-2">
            {isRunning && !isPaused && (
              <Button variant="outline" onClick={pauseBatch}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {isRunning && isPaused && (
              <Button onClick={resumeBatch}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            <Button variant="outline" onClick={resetBatch}>
              <RotateCcw className="h-4 w-4 mr-2" />
              New Batch
            </Button>

            {!isRunning && completedCount > 0 && (
              <>
                <div className="flex-1" />
                <Button variant="outline" onClick={handleExportCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={handleExportJSON}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
