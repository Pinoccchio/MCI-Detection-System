/**
 * Patient Cases Page
 * Clinician-specific view for managing patient cases
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { Folder, FileText, Clock, Activity } from 'lucide-react';

export default async function CasesPage() {
  // Check authentication and role
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only clinicians can access this page
  if (user.profile.role !== 'clinician') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Folder className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Patient Cases</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review your assigned patient cases
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Active Cases</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Currently assigned</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold">Pending Review</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting your review</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Completed</h3>
          </div>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-muted-foreground mt-1">This month</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
            <Activity className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Patient Cases Management</h2>
          <p className="text-muted-foreground mb-6">
            This feature is currently under development. You'll be able to view and manage your assigned patient cases here.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">In the meantime, you can:</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left max-w-xs mx-auto">
              <li>• View all patients in the Patients section</li>
              <li>• Review analysis results in Analysis Results</li>
              <li>• Generate and view reports in Reports</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
