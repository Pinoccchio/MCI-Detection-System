/**
 * Scans List Page
 * Displays all MRI scans with filtering
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getScans, deleteScan } from '@/lib/api/scans';
import { ScansTable } from '@/components/scans/ScansTable';
import { Scan } from 'lucide-react';

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

  // Fetch scans
  const { scans, error } = await getScans();

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
