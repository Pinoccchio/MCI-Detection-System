/**
 * Hippocampal Mask Review Page
 * Admin-only page for reviewing and correcting hippocampal segmentation masks
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getScans } from '@/lib/api/scans';
import { TracingInterface } from './TracingInterface';
import { CheckCircle, AlertCircle } from 'lucide-react';

export default async function TracePage() {
  // Check authentication and authorization
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only admins can access the tracing page
  if (user.profile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">
          Only administrators can access the manual tracing feature.
        </p>
      </div>
    );
  }

  // Fetch available scans for selection
  const { scans, error } = await getScans({ status: 'completed', limit: 100 });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <CheckCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Mask Review & Correction</h1>
          <p className="text-muted-foreground mt-1">
            Review and correct hippocampal segmentation masks from analyzed scans
          </p>
        </div>
      </div>

      {/* Tracing Interface */}
      <TracingInterface
        scans={scans || []}
        userId={user.id}
      />
    </div>
  );
}
