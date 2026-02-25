/**
 * Batch Processing Page
 * Researcher-specific view for running batch analyses
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getScans } from '@/lib/api/scans';
import { BatchProcessor } from '@/components/batch/BatchProcessor';
import { Upload, Play, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default async function BatchProcessingPage() {
  // Check authentication and role
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only researchers can access this page
  if (user.profile.role !== 'researcher') {
    redirect('/dashboard');
  }

  // Fetch available scans (all scans with files)
  // Note: All uploaded scans are available for batch processing (no status filter)
  const { scans, total, error } = await getScans({
    limit: 200,
  });

  // Calculate stats
  const availableScans = scans.filter((s) => s.file_path);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Batch Processing</h1>
          <p className="text-muted-foreground mt-1">
            Process multiple MRI scans simultaneously for research
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Upload className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Available Scans</h3>
          </div>
          <p className="text-3xl font-bold">{availableScans.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Ready to analyze</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Play className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Total Scans</h3>
          </div>
          <p className="text-3xl font-bold">{total}</p>
          <p className="text-sm text-muted-foreground mt-1">In system</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Status</h3>
          </div>
          <p className="text-3xl font-bold">Ready</p>
          <p className="text-sm text-muted-foreground mt-1">No active batch</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <XCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold">Session Results</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">This session</p>
        </div>
      </div>

      {/* Batch Processor */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Play className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Batch Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Select scans and run batch analysis with progress tracking
            </p>
          </div>
        </div>

        {error ? (
          <div className="p-8 text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Error loading scans: {error}</p>
          </div>
        ) : availableScans.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No scans available for batch processing</p>
            <p className="text-sm mt-2">
              Upload MRI scans to enable batch analysis
            </p>
          </div>
        ) : (
          <BatchProcessor scans={availableScans} userId={user.id} />
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
          How Batch Processing Works
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
          <div>
            <p className="font-medium mb-1">1. Select Scans</p>
            <p>Choose the MRI scans you want to analyze from the list above.</p>
          </div>
          <div>
            <p className="font-medium mb-1">2. Start Processing</p>
            <p>Click &quot;Start Batch Analysis&quot; to begin. Scans are processed sequentially.</p>
          </div>
          <div>
            <p className="font-medium mb-1">3. Monitor Progress</p>
            <p>Track the status of each scan. You can pause and resume at any time.</p>
          </div>
          <div>
            <p className="font-medium mb-1">4. Export Results</p>
            <p>When complete, export all results to CSV or JSON for your research.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
