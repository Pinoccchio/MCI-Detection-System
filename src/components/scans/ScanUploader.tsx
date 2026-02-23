'use client';

/**
 * Scan Uploader Component
 * Handles MRI scan file uploads with drag-and-drop support
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, File, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createScan } from '@/lib/api/scans';
import { uploadMRIScan } from '@/lib/storage/upload';
import { formatFileSize } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ScanUploaderProps {
  patientId: string;
  patientName: string;
  onComplete?: () => void;
}

interface FileWithPreview extends File {
  preview?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

// ============================================================================
// COMPONENT
// ============================================================================

export function ScanUploader({ patientId, patientName, onComplete }: ScanUploaderProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Form fields
  const [scanType, setScanType] = useState('T1-weighted');
  // Get current datetime in local timezone for datetime-local input
  const [scanDateTime, setScanDateTime] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  // File validation
  const validateFile = (file: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB (safe for free tier Supabase)
    const allowedExtensions = ['.dcm', '.nii', '.nii.gz', '.nrrd', '.mha', '.mhd'];

    if (file.size > maxSize) {
      return `File size exceeds 500MB limit (${formatFileSize(file.size)})`;
    }

    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      return `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Upload scan
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setUploadStatus('uploading');
      setError(null);
      setUploadProgress(0);

      // Step 1: Create scan record in database
      // Convert datetime-local to ISO timestamp
      const scanDateISO = new Date(scanDateTime).toISOString();

      const scanData = {
        patient_id: patientId,
        scan_date: scanDateISO,
        scan_type: scanType,
        file_type: selectedFile.name.endsWith('.dcm') ? 'DICOM' :
                   selectedFile.name.endsWith('.nii') || selectedFile.name.endsWith('.nii.gz') ? 'NIfTI' :
                   'NRRD',
        file_size: selectedFile.size,
        status: 'pending' as const,
      };

      const createResult = await createScan(scanData);

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error || 'Failed to create scan record');
      }

      const scanId = createResult.data.id;
      setUploadProgress(20);

      // Step 2: Upload file to Supabase Storage
      setUploadStatus('processing');
      const uploadResult = await uploadMRIScan(patientId, scanId, selectedFile);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file');
      }

      setUploadProgress(80);

      // Step 3: Update scan record with file path
      const updateResult = await fetch('/api/scans/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: scanId,
          file_path: uploadResult.path,
          status: 'completed',
        }),
      });

      if (!updateResult.ok) {
        throw new Error('Failed to update scan record');
      }

      setUploadProgress(100);
      setUploadStatus('success');

      // Redirect after success
      timeoutRef.current = setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          router.push(`/dashboard/patients/${patientId}`);
        }
        router.refresh();
      }, 2000);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed');
      setUploadStatus('error');
    }
  };

  // Reset uploader
  const handleReset = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setError(null);
    setScanType('T1-weighted');
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setScanDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  return (
    <div className="space-y-6">
      {/* Patient Info */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">Uploading scan for:</p>
        <p className="font-semibold text-lg">{patientName}</p>
      </div>

      {/* Scan Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Scan Type</label>
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            disabled={uploadStatus !== 'idle'}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
          >
            <option value="T1-weighted">T1-weighted</option>
            <option value="T2-weighted">T2-weighted</option>
            <option value="FLAIR">FLAIR</option>
            <option value="DWI">DWI</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Scan Date & Time</label>
          <input
            type="datetime-local"
            value={scanDateTime}
            onChange={(e) => setScanDateTime(e.target.value)}
            disabled={uploadStatus !== 'idle'}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background"
          />
        </div>
      </div>

      {/* File Upload Area */}
      {!selectedFile && uploadStatus === 'idle' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">
            Drag and drop your MRI scan file here
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse files
          </p>
          <input
            type="file"
            onChange={handleFileInputChange}
            accept=".dcm,.nii,.nii.gz,.nrrd,.mha,.mhd"
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Choose File</span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: DICOM (.dcm), NIfTI (.nii, .nii.gz), NRRD (.nrrd)
            <br />
            Maximum file size: 500MB
          </p>
        </div>
      )}

      {/* Selected File Preview */}
      {selectedFile && uploadStatus === 'idle' && (
        <div className="border border-border rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <File className="h-10 w-10 text-primary" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
        <div className="border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="font-medium">
                {uploadStatus === 'uploading' ? 'Uploading file...' : 'Processing...'}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedFile?.name}
              </p>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {uploadProgress}% complete
          </p>
        </div>
      )}

      {/* Success State */}
      {uploadStatus === 'success' && (
        <div className="border border-green-500/20 bg-green-500/10 rounded-lg p-6">
          <div className="flex items-center gap-3 text-green-700 dark:text-green-400">
            <CheckCircle className="h-6 w-6" />
            <div>
              <p className="font-semibold">Upload successful!</p>
              <p className="text-sm">Redirecting to patient page...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && uploadStatus === 'error' && (
        <div className="border border-destructive/20 bg-destructive/10 rounded-lg p-6">
          <div className="flex items-start gap-3 text-destructive">
            <AlertCircle className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Upload failed</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && uploadStatus === 'idle' && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      {uploadStatus === 'idle' && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Scan
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/patients/${patientId}`)}
          >
            Cancel
          </Button>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex items-center gap-3">
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Try Again
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push(`/dashboard/patients/${patientId}`)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
