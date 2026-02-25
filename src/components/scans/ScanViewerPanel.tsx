'use client';

/**
 * Scan Viewer Panel Component
 * Loads and displays NIfTI files using the existing MRIViewer component
 */

import { useState, useEffect } from 'react';
import { MRIViewer } from '@/components/viewer/MRIViewer';
import { fetchAndParseNIfTI, NIfTIData } from '@/lib/nifti/parser';
import { getScanFileUrl } from '@/app/dashboard/scans/[id]/actions';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScanViewerPanelProps {
  scanId: string;
  filePath: string;
  fileType: string | null;
  downloadUrl?: string | null;
}

export function ScanViewerPanel({
  scanId,
  filePath,
  fileType,
  downloadUrl,
}: ScanViewerPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [niftiData, setNiftiData] = useState<NIfTIData | null>(null);

  // Check if file is a supported NIfTI format
  const isNiftiFile =
    fileType?.toLowerCase().includes('nifti') ||
    filePath.endsWith('.nii') ||
    filePath.endsWith('.nii.gz');

  useEffect(() => {
    async function loadScan() {
      // Only load if it's a NIfTI file
      if (!isNiftiFile) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get signed URL for the file
        const { url, error: urlError } = await getScanFileUrl(filePath);

        if (urlError || !url) {
          throw new Error(urlError || 'Failed to get file URL');
        }

        // Parse the NIfTI file
        const filename = filePath.split('/').pop() || 'scan.nii';
        const data = await fetchAndParseNIfTI(url, filename);

        setNiftiData(data);
      } catch (err: any) {
        console.error('[ScanViewerPanel] Error loading scan:', err);
        setError(err.message || 'Failed to load scan');
      } finally {
        setLoading(false);
      }
    }

    loadScan();
  }, [filePath, isNiftiFile]);

  // DICOM files - not supported yet
  if (!isNiftiFile) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground p-6">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium mb-2">
            DICOM preview not supported
          </p>
          <p className="text-xs mb-4">
            Download the file to view in external software
          </p>
          {downloadUrl && (
            <a href={downloadUrl} download>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </a>
          )}
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Loader2 className="h-10 w-10 mx-auto mb-3 animate-spin opacity-50" />
          <p className="text-sm">Loading scan...</p>
          <p className="text-xs mt-1 opacity-70">
            Parsing NIfTI data
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-destructive p-6">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-70" />
          <p className="text-sm font-medium mb-2">Failed to load scan</p>
          <p className="text-xs opacity-80 mb-4">{error}</p>
          {downloadUrl && (
            <a href={downloadUrl} download>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Instead
              </Button>
            </a>
          )}
        </div>
      </div>
    );
  }

  // No data
  if (!niftiData) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No scan data available</p>
        </div>
      </div>
    );
  }

  // Render the viewer
  return (
    <MRIViewer
      imageData={niftiData.data}
      dimensions={niftiData.dimensions}
      showControls={true}
      displayMode="grayscale"
      className="rounded-lg overflow-hidden"
    />
  );
}
