/**
 * Scan Detail Page
 * Displays MRI scan details and analysis results
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/actions';
import { getScanWithAnalyses } from '@/lib/api/scans';
import { getSignedUrl } from '@/lib/storage/upload';
import { formatDateTime, formatFileSize } from '@/lib/utils';
import {
  Scan as ScanIcon,
  User,
  Calendar,
  FileText,
  Download,
  Brain,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function ScanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params
  const { id } = await params;

  // Check authentication
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Fetch scan with analyses
  const { scan, analyses, error } = await getScanWithAnalyses(id);

  if (error || !scan) {
    notFound();
  }

  // Get signed URL for file download (if file exists)
  let downloadUrl = null;
  if (scan.file_path) {
    const urlResult = await getSignedUrl('mri-scans', scan.file_path, 3600);
    downloadUrl = urlResult.url || null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <ScanIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{scan.scan_type} Scan</h1>
            <p className="text-muted-foreground mt-1">
              Scan ID: {id.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {downloadUrl && (
            <a href={downloadUrl} download>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
            </a>
          )}
          {user.profile.role === 'admin' && (
            <Link href={`/dashboard/analyze?scan=${scan.id}`}>
              <Button>
                <Brain className="h-4 w-4 mr-2" />
                Analyze Scan
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scan Information Card */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Scan Information</h2>

              <div className="space-y-4">
                {/* Patient Info */}
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <Link
                      href={`/dashboard/patients/${scan.patient_id}`}
                      className="font-medium hover:underline"
                    >
                      {(scan as any).patients?.full_name}
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {(scan as any).patients?.patient_id}
                    </p>
                  </div>
                </div>

                {/* Scan Date */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Scan Date</p>
                    <p className="font-medium">{formatDateTime(scan.scan_date)}</p>
                  </div>
                </div>

                {/* File Info */}
                {scan.file_type && (
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">File Type</p>
                      <p className="font-medium">{scan.file_type}</p>
                      {scan.file_size && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatFileSize(scan.file_size)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-start gap-3">
                  <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                        scan.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : scan.status === 'processing'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : scan.status === 'failed'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}
                    >
                      {scan.status}
                    </span>
                  </div>
                </div>

                {/* Upload Info */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Uploaded: {formatDateTime(scan.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Viewer / Analysis Results */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            {/* Analysis Results */}
            {analyses.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
                {analyses.map((analysis) => (
                  <Link
                    key={analysis.id}
                    href={`/dashboard/results/${analysis.id}`}
                    className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Brain className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{analysis.prediction}</p>
                          <p className="text-sm text-muted-foreground">
                            Confidence: {(analysis.confidence * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Model: {analysis.model_version} •{' '}
                            {formatDateTime(analysis.created_at)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        View Details →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground mb-4">No analysis results yet</p>
                {user.profile.role === 'admin' && (
                  <Link href={`/dashboard/analyze?scan=${scan.id}`}>
                    <Button>
                      <Brain className="h-4 w-4 mr-2" />
                      Run Analysis
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Scan Viewer Placeholder */}
            {scan.file_path && (
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Scan Preview</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <ScanIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">
                      DICOM/NIfTI viewer coming soon
                    </p>
                    <p className="text-xs mt-1">
                      Use download button to view in external software
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div>
        <Link href="/dashboard/scans">
          <Button variant="ghost">← Back to Scans</Button>
        </Link>
      </div>
    </div>
  );
}
