/**
 * Datasets Page
 * Researcher-specific view for managing research datasets
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { Database, Download, Upload, Trash2 } from 'lucide-react';

export default async function DatasetsPage() {
  // Check authentication and role
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only researchers can access this page
  if (user.profile.role !== 'researcher') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Research Datasets</h1>
          <p className="text-muted-foreground mt-1">
            Manage anonymized datasets for research and analysis
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Database className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Datasets</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Available</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Total Samples</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">MRI scans</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">MCI Cases</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Positive samples</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold">Normal Cases</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Negative samples</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
            <Database className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Dataset Management</h2>
          <p className="text-muted-foreground mb-6">
            This feature is currently under development. You'll be able to create, manage, and export anonymized research datasets here.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Planned Features:</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left max-w-xs mx-auto">
              <li>• Create custom datasets with filters</li>
              <li>• Export data in CSV, JSON, or DICOM formats</li>
              <li>• Automatic anonymization and de-identification</li>
              <li>• Dataset versioning and metadata</li>
              <li>• Share datasets with collaborators</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
