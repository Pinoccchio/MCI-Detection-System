/**
 * Analysis Results List Page
 * Displays all MCI analysis results with filtering
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getAnalyses, getAnalysisStats } from '@/lib/api/analyses';
import { getPatientById } from '@/lib/api/patients';
import { Brain, Activity, Percent } from 'lucide-react';
import { ResultsTable } from '@/components/results/ResultsTable';

interface ResultsPageProps {
  searchParams: Promise<{ patient?: string }>;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
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

  // Read patient filter from URL params
  const params = await searchParams;
  const patientFilterId = params.patient;

  // Fetch analyses, stats, and patient info (if filtering) in parallel
  const [{ analyses, error }, stats, patientResult] = await Promise.all([
    getAnalyses(),
    getAnalysisStats(),
    patientFilterId ? getPatientById(patientFilterId) : Promise.resolve({ patient: null }),
  ]);

  // Get patient name for display in filter indicator
  const patientFilterName = patientResult.patient?.full_name || null;

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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Total Analyses</h3>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">Results generated</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold">MCI Detected</h3>
          </div>
          <p className="text-3xl font-bold">{stats.mciDetected}</p>
          <p className="text-sm text-muted-foreground mt-1">Positive cases</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Cognitively Normal</h3>
          </div>
          <p className="text-3xl font-bold">{stats.normalCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Negative cases</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Percent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Avg Confidence</h3>
          </div>
          <p className="text-3xl font-bold">{(stats.avgConfidence * 100).toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground mt-1">Model certainty</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          Failed to load results: {error}
        </div>
      )}

      {/* Results Table */}
      <ResultsTable
        analyses={analyses}
        initialPatientFilter={patientFilterId}
        initialPatientName={patientFilterName}
      />
    </div>
  );
}
