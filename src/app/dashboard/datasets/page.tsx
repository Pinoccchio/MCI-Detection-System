/**
 * Datasets Page
 * Researcher-specific view for managing research datasets
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getDatasetStats } from '@/lib/api/datasets';
import { getAnalyses } from '@/lib/api/analyses';
import { DatasetTable } from '@/components/datasets/DatasetTable';
import { Database, Brain, Activity, FileQuestion } from 'lucide-react';

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

  // Fetch data in parallel
  const [stats, analysesResult] = await Promise.all([
    getDatasetStats(),
    getAnalyses({ limit: 500 }),
  ]);

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
            View, filter, and export analysis results for research
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
            <h3 className="font-semibold">Total Scans</h3>
          </div>
          <p className="text-3xl font-bold">{stats.totalScans}</p>
          <p className="text-sm text-muted-foreground mt-1">In database</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Total Analyses</h3>
          </div>
          <p className="text-3xl font-bold">{analysesResult.total}</p>
          <p className="text-sm text-muted-foreground mt-1">Results generated</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold">MCI Detected</h3>
          </div>
          <p className="text-3xl font-bold">{stats.mciCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Positive cases</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Normal</h3>
          </div>
          <p className="text-3xl font-bold">{stats.normalCount}</p>
          <p className="text-sm text-muted-foreground mt-1">Negative cases</p>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Analysis Results</h3>
            <p className="text-sm text-muted-foreground">
              Filter, select, and export analysis data for your research
            </p>
          </div>
        </div>

        {analysesResult.error ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Error loading data: {analysesResult.error}</p>
          </div>
        ) : analysesResult.analyses.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No analysis data available yet</p>
            <p className="text-sm mt-2">
              Run analyses on MRI scans to populate the dataset
            </p>
          </div>
        ) : (
          <DatasetTable analyses={analysesResult.analyses} />
        )}
      </div>
    </div>
  );
}
