"use client";

import { useState } from "react";
import { PredictionResponse, UploadProgress } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  });
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file extension
    const validExtensions = ['.nii', '.nii.gz'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      return 'Invalid file type. Only .nii and .nii.gz files are supported.';
    }

    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return 'File size exceeds 100MB limit.';
    }

    return null;
  };

  const uploadAndPredict = async (file: File): Promise<PredictionResponse> => {
    setIsUploading(true);
    setError(null);
    setProgress({ progress: 0, status: 'uploading', message: 'Validating file...' });

    try {
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      setProgress({ progress: 10, status: 'uploading', message: 'Uploading file...' });

      // Upload with XMLHttpRequest for progress tracking
      const result = await new Promise<PredictionResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 50); // 0-50%
            setProgress({
              progress: percentComplete,
              status: 'uploading',
              message: `Uploading ${Math.round((e.loaded / 1024 / 1024) * 10) / 10}MB...`
            });
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            setProgress({ progress: 50, status: 'analyzing', message: 'Analyzing...' });

            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error('Failed to parse server response'));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.detail || `Server error: ${xhr.status}`));
            } catch (e) {
              reject(new Error(`Server error: ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error - please check your connection'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload cancelled'));
        });

        // Send request
        xhr.open('POST', `${API_BASE_URL}/api/v1/predict`);
        xhr.send(formData);
      });

      setProgress({ progress: 100, status: 'complete', message: 'Analysis complete!' });
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      setProgress({ progress: 0, status: 'error', message: errorMessage });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setProgress({ progress: 0, status: 'idle' });
    setError(null);
    setIsUploading(false);
  };

  return {
    uploadAndPredict,
    isUploading,
    progress,
    error,
    reset
  };
}
