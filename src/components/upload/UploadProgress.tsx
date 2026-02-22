"use client";

import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import { UploadProgress as UploadProgressType } from "@/types/api";

interface UploadProgressProps {
  progress: UploadProgressType;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  const getIcon = () => {
    switch (progress.status) {
      case 'uploading':
        return <Upload className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'analyzing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'uploading':
        return 'Uploading file...';
      case 'analyzing':
        return 'Analyzing hippocampal mask...';
      case 'complete':
        return 'Analysis complete!';
      case 'error':
        return 'Upload failed';
      default:
        return '';
    }
  };

  const getProgressColor = () => {
    switch (progress.status) {
      case 'error':
        return 'bg-red-500';
      case 'complete':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (progress.status === 'idle') {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="font-medium">{getStatusText()}</p>
            {progress.message && (
              <p className="text-sm text-muted-foreground">{progress.message}</p>
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {progress.progress}%
          </span>
        </div>

        <div className="relative">
          <Progress
            value={progress.progress}
            className="h-2"
          />
          <div
            className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor()}`}
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
