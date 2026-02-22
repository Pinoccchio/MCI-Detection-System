"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PredictionResponse } from "@/types/api";
import { Brain, Activity, Download } from "lucide-react";
import { ConfidenceGauge } from "./ConfidenceGauge";
import { ProbabilityChart } from "./ProbabilityChart";

interface ResultsCardProps {
  result: PredictionResponse;
  onSave?: () => void;
  onDownload?: () => void;
  isSaving?: boolean;
}

export function ResultsCard({
  result,
  onSave,
  onDownload,
  isSaving = false
}: ResultsCardProps) {
  const isMCI = result.class_name === "Mild Cognitive Impairment";

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">Analysis Results</h3>
            <p className="text-sm text-muted-foreground">
              Model version: {result.model_version}
            </p>
          </div>
          <div className="flex gap-2">
            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Results"}
              </Button>
            )}
            {onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>

        {/* Prediction */}
        <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Prediction</p>
              <h4 className="text-xl font-bold">{result.class_name}</h4>
            </div>
          </div>
          <Badge
            variant={isMCI ? "destructive" : "default"}
            className="text-sm"
          >
            {isMCI ? "MCI Detected" : "Cognitively Normal"}
          </Badge>
        </div>

        {/* Confidence */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-semibold">Confidence</h4>
          </div>
          <ConfidenceGauge confidence={result.confidence} />
        </div>

        {/* Probabilities */}
        <div>
          <h4 className="font-semibold mb-4">Class Probabilities</h4>
          <ProbabilityChart probabilities={result.probabilities} />
        </div>

        {/* Volumetry (if available) */}
        {result.volumetry && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-4">Volumetric Analysis</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Left Hippocampus</p>
                <p className="text-lg font-bold">
                  {result.volumetry.left_hippocampus.toFixed(2)} mm³
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Right Hippocampus</p>
                <p className="text-lg font-bold">
                  {result.volumetry.right_hippocampus.toFixed(2)} mm³
                </p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Volume</p>
                <p className="text-lg font-bold">
                  {result.volumetry.total_volume.toFixed(2)} mm³
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
