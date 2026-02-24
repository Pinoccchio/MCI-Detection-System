/**
 * Patient Cases Page
 * Clinician-specific view for reviewing patient cases
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getCasesWithSummary, getCaseStats } from '@/lib/api/cases';
import { Folder, FileText, Clock, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { CasesList } from './CasesList';

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

  // Fetch cases and stats
  const [casesResult, stats] = await Promise.all([
    getCasesWithSummary(),
    getCaseStats(),
  ]);

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
            Review and manage patient cases and analysis results
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">Active Cases</h3>
          </div>
          <p className="text-3xl font-bold">{stats.active}</p>
          <p className="text-sm text-muted-foreground mt-1">Patients with scans</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">Pending Review</h3>
          </div>
          <p className="text-3xl font-bold">{stats.pendingReview}</p>
          <p className="text-sm text-muted-foreground mt-1">Awaiting analysis</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">Completed</h3>
          </div>
          <p className="text-3xl font-bold">{stats.completed}</p>
          <p className="text-sm text-muted-foreground mt-1">With analysis results</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-sm text-muted-foreground">MCI Detected</h3>
          </div>
          <p className="text-3xl font-bold">{stats.mciDetected}</p>
          <p className="text-sm text-muted-foreground mt-1">Require attention</p>
        </div>
      </div>

      {/* Error Display */}
      {casesResult.error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          Failed to load cases: {casesResult.error}
        </div>
      )}

      {/* Cases List with Search and Filters */}
      <CasesList initialCases={casesResult.cases} totalCases={casesResult.total} />
    </div>
  );
}
