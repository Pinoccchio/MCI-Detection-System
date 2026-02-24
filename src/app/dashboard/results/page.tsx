/**
 * Analysis Results List Page
 * Displays all MCI analysis results with filtering
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getAnalyses } from '@/lib/api/analyses';
import { Brain } from 'lucide-react';
import { ResultsTable } from '@/components/results/ResultsTable';

export default async function ResultsPage() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Researchers should not access individual analysis results
  // They work with aggregated data via Reports and Analytics
  if (user.profile.role === 'researcher') {
    redirect('/dashboard/reports');
  }

  // Fetch analyses
  const { analyses, error } = await getAnalyses();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Analysis Results</h1>
          <p className="text-muted-foreground mt-1">
            Review MCI detection results and predictions
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          Failed to load results: {error}
        </div>
      )}

      {/* Results Table */}
      <ResultsTable analyses={analyses} />
    </div>
  );
}
