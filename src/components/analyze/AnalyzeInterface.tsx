'use client';

/**
 * Analyze Interface Component
 * Main interface for running ML analysis on MRI scans
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MRIScan } from '@/types/database';
import { PredictionResponse } from '@/types/api';
import { createAnalysis } from '@/lib/api/analyses';
import { getSignedUrl } from '@/lib/storage/upload';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
  TrendingUp,
  Activity,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface AnalyzeInterfaceProps {
  scans: any[];
  preSelectedScan: any | null;
  userId: string;
  userRole: string;
}

type AnalysisStatus = 'idle' | 'fetching-file' | 'analyzing' | 'saving' | 'complete' | 'error';

// ============================================================================
// COMPONENT
// ============================================================================

export function AnalyzeInterface({ scans, preSelectedScan, userId, userRole }: AnalyzeInterfaceProps) {
  const router = useRouter();
  const [selectedScan, setSelectedScan] = useState<any>(preSelectedScan);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);

  const runAnalysis = async () => {
    if (!selectedScan) {
      setError('Please select a scan first');
      return;
    }

    try {
      setStatus('fetching-file');
      setError(null);
      setProgress(10);

      // Step 1: Get signed URL for the scan file
      const urlResult = await getSignedUrl('mri-scans', selectedScan.file_path, 3600);

      if (!urlResult.url) {
        throw new Error('Failed to get scan file URL');
      }

      setProgress(20);

      // Step 2: Download the file
      setStatus('fetching-file');
      const fileResponse = await fetch(urlResult.url);
      if (!fileResponse.ok) {
        throw new Error('Failed to download scan file');
      }

      const fileBlob = await fileResponse.blob();
      setProgress(40);

      // Step 3: Send to FastAPI backend
      setStatus('analyzing');
      const formData = new FormData();

      // Use the original filename from the scan's file_path
      const originalFilename = selectedScan.file_path.split('/').pop() || 'scan.nii';
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
      setResult(predictionResult);
      setProgress(80);

      // Step 4: Save results to database
      setStatus('saving');
      const saveResult = await createAnalysis({
        scan_id: selectedScan.id,
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

      setAnalysisId(saveResult.data?.id);
      setProgress(100);
      setStatus('complete');
      toast.success('Analysis complete');
    } catch (err: any) {
      console.error('Analysis error:', err);
      const errorMessage = err.message || 'Analysis failed';
      setError(errorMessage);
      setStatus('error');
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    setResult(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
    setAnalysisId(null);
  };

  const handleViewResults = () => {
    if (analysisId) {
      router.push(`/dashboard/results/${analysisId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Selection */}
      {status === 'idle' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Select Scan</h2>

          {scans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No completed scans available for analysis.</p>
              <p className="text-sm mt-2">
                Please upload and complete a scan first.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <select
                value={selectedScan?.id || ''}
                onChange={(e) => {
                  const scan = scans.find((s) => s.id === e.target.value);
                  setSelectedScan(scan);
                }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background"
              >
                <option value="">Choose a scan...</option>
                {scans.map((scan) => (
                  <option key={scan.id} value={scan.id}>
                    {scan.patients?.full_name} - {scan.scan_type} - {formatDateTime(scan.scan_date)}
                  </option>
                ))}
              </select>

              {selectedScan && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Patient</p>
                      <p className="font-medium">{selectedScan.patients?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Scan Type</p>
                      <p className="font-medium">{selectedScan.scan_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Scan Date</p>
                      <p className="font-medium">{formatDateTime(selectedScan.scan_date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">File Type</p>
                      <p className="font-medium">{selectedScan.file_type}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={runAnalysis}
                disabled={!selectedScan}
                className="w-full"
                size="lg"
              >
                <Brain className="h-5 w-5 mr-2" />
                Run MCI Analysis
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Processing Status */}
      {(status === 'fetching-file' || status === 'analyzing' || status === 'saving') && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <h3 className="font-semibold text-lg">
                {status === 'fetching-file' && 'Fetching scan file...'}
                {status === 'analyzing' && 'Analyzing hippocampal features...'}
                {status === 'saving' && 'Saving results...'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we process your scan
              </p>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {progress}% complete
          </p>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="bg-card border border-destructive rounded-lg p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-destructive mb-2">
                Analysis Failed
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleReset} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success State with Results */}
      {status === 'complete' && result && (
        <div className="space-y-6">
          {/* Success Banner */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3 text-green-800 dark:text-green-400">
              <CheckCircle className="h-6 w-6" />
              <div>
                <p className="font-semibold">Analysis Complete!</p>
                <p className="text-sm">Results have been saved to the database.</p>
              </div>
            </div>
          </div>

          {/* Results Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prediction Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg">Prediction</h3>
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold mb-2">{result.class_name}</p>
              <p className="text-sm text-muted-foreground">
                Confidence: {(result.confidence * 100).toFixed(1)}%
              </p>
              <div className="mt-4 w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    result.class_name === 'Cognitively Normal'
                      ? 'bg-green-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Model Info Card */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-lg">Model Information</h3>
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{result.model_version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Features:</span>
                  <span className="font-medium">26 hippocampal features</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="font-medium text-green-600">87-91%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Probabilities */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="font-semibold text-lg">Class Probabilities</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-4">
              {Object.entries(result.probabilities).map(([className, prob]) => (
                <div key={className}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">{className}</span>
                    <span className="text-sm text-muted-foreground">
                      {(prob * 100).toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${prob * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Volumetry Data */}
          {result.volumetry && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Hippocampal Volumetry</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Left</p>
                  <p className="text-xl font-bold">
                    {result.volumetry.left_hippocampus.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">mm³</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Right</p>
                  <p className="text-xl font-bold">
                    {result.volumetry.right_hippocampus.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">mm³</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total</p>
                  <p className="text-xl font-bold">
                    {result.volumetry.total_volume.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">mm³</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4">
            {userRole !== 'researcher' && (
              <Button onClick={handleViewResults} className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                View Detailed Results
              </Button>
            )}
            <Button variant="outline" onClick={handleReset} className={userRole === 'researcher' ? 'flex-1' : ''}>
              Analyze Another Scan
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {status === 'idle' && (
        <div className="bg-muted/50 border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-3">How it works</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Select a completed MRI scan from the dropdown</li>
            <li>Click "Run MCI Analysis" to start the process</li>
            <li>The system will fetch the scan file from storage</li>
            <li>AI model analyzes 26 hippocampal features</li>
            <li>Results are automatically saved to the database</li>
            <li>View detailed results and generate reports</li>
          </ol>
        </div>
      )}
    </div>
  );
}
