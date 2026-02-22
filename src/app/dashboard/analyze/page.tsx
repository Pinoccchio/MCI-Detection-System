"use client";

import { useState } from "react";
import { FileUploadArea } from "@/components/upload/FileUploadArea";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { ResultsCard } from "@/components/results/ResultsCard";
import { useUpload } from "@/hooks/useUpload";
import { useAnalysis } from "@/hooks/useAnalysis";
import { PredictionResponse } from "@/types/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AnalyzePage() {
  const router = useRouter();
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);

  const { uploadAndPredict, isUploading, progress, error, reset } = useUpload();
  const { saveAnalysis, isSaving } = useAnalysis();

  const handleFileSelect = async (file: File) => {
    try {
      setResult(null);
      const prediction = await uploadAndPredict(file);
      setResult(prediction);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  const handleSaveResults = async () => {
    if (!result) return;

    // TODO: Get actual scan ID from database after implementing scan upload
    // For now, generate a temporary ID
    const tempScanId = `scan_${Date.now()}`;

    try {
      // TODO: Get actual user ID from auth context
      const userId = "temp_user_id";

      await saveAnalysis(tempScanId, result, userId);

      // Show success message (you might want to use a toast notification)
      alert("Results saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save results. Please try again.");
    }
  };

  const handleDownloadResults = () => {
    if (!result) return;

    const data = {
      prediction: result.class_name,
      confidence: result.confidence,
      probabilities: result.probabilities,
      volumetry: result.volumetry,
      model_version: result.model_version,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mci-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setResult(null);
    reset();
  };

  return (
    <div className="container max-w-5xl py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-2">MCI Analysis</h1>
        <p className="text-muted-foreground">
          Upload a hippocampal mask file for automated MCI detection
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Area */}
      {!result && (
        <div className="space-y-6">
          <FileUploadArea
            onFileSelect={handleFileSelect}
            disabled={isUploading}
          />

          {/* Progress */}
          <UploadProgress progress={progress} />

          {/* Instructions */}
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Prepare your hippocampal mask file in NIfTI format (.nii or .nii.gz)</li>
              <li>Upload the file using the area above or drag and drop</li>
              <li>Wait for the analysis to complete (typically 5-10 seconds)</li>
              <li>Review the prediction results and confidence scores</li>
              <li>Optionally save the results to your patient records</li>
            </ol>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <ResultsCard
            result={result}
            onSave={handleSaveResults}
            onDownload={handleDownloadResults}
            isSaving={isSaving}
          />

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleReset}>
              Analyze Another File
            </Button>
            <Button onClick={() => router.push("/dashboard/history")}>
              View Analysis History
            </Button>
          </div>

          {/* Disclaimer */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Medical Disclaimer:</strong> This AI-powered analysis is
              intended for research and educational purposes only. It should not
              be used as the sole basis for clinical diagnosis. Always consult
              with qualified healthcare professionals for medical decisions.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
