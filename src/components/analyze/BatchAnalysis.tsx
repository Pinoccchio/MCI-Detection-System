'use client';

/**
 * Batch Analysis Component
 * Run analysis on multiple scans sequentially
 */

import { useState, useCallback } from 'react';
import { PredictionResponse } from '@/types/api';
import { createAnalysis } from '@/lib/api/analyses';
import { getSignedUrl } from '@/lib/storage/upload';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import {
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  ListChecks,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface BatchAnalysisProps {
  scans: any[];
  userId: string;
}

interface ScanProgress {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: PredictionResponse;
  error?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BatchAnalysis({ scans, userId }: BatchAnalysisProps) {
  const [selectedScans, setSelectedScans] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<ScanProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleScanSelection = (scanId: string) => {
    setSelectedScans((prev) =>
      prev.includes(scanId)
        ? prev.filter((id) => id !== scanId)
        : [...prev, scanId]
    );
  };

  const selectAll = () => {
    setSelectedScans(scans.map((s) => s.id));
  };

  const clearSelection = () => {
    setSelectedScans([]);
  };

  const runSingleAnalysis = async (scan: any): Promise<{ success: boolean; result?: PredictionResponse; error?: string }> => {
    try {
      // Get signed URL
      const urlResult = await getSignedUrl('mri-scans', scan.file_path, 3600);
      if (!urlResult.url) {
        throw new Error('Failed to get scan file URL');
      }

      // Download file
      const fileResponse = await fetch(urlResult.url);
      if (!fileResponse.ok) {
        throw new Error('Failed to download scan file');
      }

      const fileBlob = await fileResponse.blob();

      // Send to ML backend
      const formData = new FormData();
      const originalFilename = scan.file_path.split('/').pop() || 'scan.nii';
      formData.append('file', fileBlob, originalFilename);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const predictResponse = await fetch(`${apiUrl}/api/v1/predict`, {
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
          'Cognitively Normal': predictionResult.probabilities['Cognitively Normal'],
          'Mild Cognitive Impairment': predictionResult.probabilities['Mild Cognitive Impairment'],
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

  const runBatchAnalysis = async () => {
    if (selectedScans.length === 0) return;

    setIsRunning(true);
    setIsPaused(false);
    setCurrentIndex(0);

    // Initialize progress
    const initialProgress: ScanProgress[] = selectedScans.map((scanId) => {
      const scan = scans.find((s) => s.id === scanId);
      return {
        id: scanId,
        name: `${scan?.patients?.full_name || 'Unknown'} - ${scan?.scan_type || 'Scan'}`,
        status: 'pending',
      };
    });
    setProgress(initialProgress);

    // Process each scan
    for (let i = 0; i < selectedScans.length; i++) {
      // Check if paused
      if (isPaused) {
        setCurrentIndex(i);
        return;
      }

      const scanId = selectedScans[i];
      const scan = scans.find((s) => s.id === scanId);

      if (!scan) continue;

      // Update status to processing
      setProgress((prev) =>
        prev.map((p) =>
          p.id === scanId ? { ...p, status: 'processing' } : p
        )
      );
      setCurrentIndex(i);

      // Run analysis
      const result = await runSingleAnalysis(scan);

      // Update status with result
      setProgress((prev) =>
        prev.map((p) =>
          p.id === scanId
            ? {
                ...p,
                status: result.success ? 'completed' : 'error',
                result: result.result,
                error: result.error,
              }
            : p
        )
      );
    }

    setIsRunning(false);
  };

  const pauseAnalysis = () => {
    setIsPaused(true);
  };

  const resumeAnalysis = async () => {
    setIsPaused(false);
    // Continue from where we left off
    for (let i = currentIndex; i < selectedScans.length; i++) {
      if (isPaused) return;

      const scanId = selectedScans[i];
      const scan = scans.find((s) => s.id === scanId);
      const currentProgress = progress.find((p) => p.id === scanId);

      if (!scan || currentProgress?.status === 'completed') continue;

      setProgress((prev) =>
        prev.map((p) =>
          p.id === scanId ? { ...p, status: 'processing' } : p
        )
      );
      setCurrentIndex(i);

      const result = await runSingleAnalysis(scan);

      setProgress((prev) =>
        prev.map((p) =>
          p.id === scanId
            ? {
                ...p,
                status: result.success ? 'completed' : 'error',
                result: result.result,
                error: result.error,
              }
            : p
        )
      );
    }

    setIsRunning(false);
  };

  const resetBatch = () => {
    setIsRunning(false);
    setIsPaused(false);
    setProgress([]);
    setCurrentIndex(0);
  };

  const completedCount = progress.filter((p) => p.status === 'completed').length;
  const errorCount = progress.filter((p) => p.status === 'error').length;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ListChecks className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Batch Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Run analysis on multiple scans
          </p>
        </div>
      </div>

      {!isRunning && progress.length === 0 ? (
        <>
          {/* Scan Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                Select scans to analyze ({selectedScans.length} selected)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {scans.map((scan) => (
                <label
                  key={scan.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedScans.includes(scan.id)}
                    onChange={() => toggleScanSelection(scan.id)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {scan.patients?.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {scan.scan_type} - {formatDateTime(scan.scan_date)}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <Button
              onClick={runBatchAnalysis}
              disabled={selectedScans.length === 0}
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Batch Analysis ({selectedScans.length} scans)
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Progress View */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{progress.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{completedCount}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
              {isRunning && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm">Processing...</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedCount / progress.length) * 100}%` }}
              />
            </div>

            {/* Progress list */}
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {progress.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3"
                >
                  <span className="text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.status === 'pending' && (
                      <span className="text-xs text-muted-foreground">Pending</span>
                    )}
                    {item.status === 'processing' && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {item.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          item.result?.class_name === 'Mild Cognitive Impairment'
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}>
                          {item.result?.class_name === 'Mild Cognitive Impairment' ? 'MCI' : 'Normal'}
                        </span>
                        <CheckCircle className={`h-4 w-4 ${
                          item.result?.class_name === 'Mild Cognitive Impairment'
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`} />
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-600 max-w-32 truncate">
                          {item.error}
                        </span>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Control buttons */}
            <div className="flex gap-2">
              {isRunning && !isPaused && (
                <Button variant="outline" onClick={pauseAnalysis}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {isPaused && (
                <Button onClick={resumeAnalysis}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              {!isRunning && (
                <Button variant="outline" onClick={resetBatch}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Batch
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
