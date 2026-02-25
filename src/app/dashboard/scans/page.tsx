/**
 * Scans List Page
 * Displays all MRI scans with filtering
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getScans, getScanStats, deleteScan } from '@/lib/api/scans';
import { ScansTable } from '@/components/scans/ScansTable';
import { Scan, Database, Calendar, HardDrive } from 'lucide-react';

export default async function ScansPage() {
  // Check authentication and role
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only admins can access scan management
  if (user.profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch scans and stats in parallel
  const [{ scans, error }, stats] = await Promise.all([
    getScans(),
    getScanStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Scan className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">MRI Scans</h1>
          <p className="text-muted-foreground mt-1">
            Manage uploaded MRI scans and files
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Total Scans</h3>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">In database</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">This Week</h3>
          </div>
          <p className="text-3xl font-bold">{stats.thisWeek}</p>
          <p className="text-sm text-muted-foreground mt-1">Recently uploaded</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <HardDrive className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Ready for Analysis</h3>
          </div>
          <p className="text-3xl font-bold">{stats.completed}</p>
          <p className="text-sm text-muted-foreground mt-1">Available scans</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          Failed to load scans: {error}
        </div>
      )}

      {/* Scans Table */}
      <ScansTable
        scans={scans}
        onDelete={user.profile.role === 'admin' ? deleteScan : undefined}
      />
    </div>
  );
}
