/**
 * Analyze Page - Integrated with Database
 * Analyzes MRI scans using FastAPI backend and saves results
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getScans } from '@/lib/api/scans';
import { AnalyzeInterface } from '@/components/analyze/AnalyzeInterface';
import { BatchAnalysis } from '@/components/analyze/BatchAnalysis';
import { Brain } from 'lucide-react';

interface AnalyzePageProps {
  searchParams: Promise<{
    scan?: string;
  }>;
}

export default async function AnalyzePage({ searchParams }: AnalyzePageProps) {
  // Await searchParams
  const params = await searchParams;

  // Check authentication and role
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only admins and researchers can run analyses
  if (!['admin', 'researcher'].includes(user.profile.role)) {
    redirect('/dashboard');
  }

  // Get available scans
  const { scans } = await getScans({ status: 'completed' });

  // Find pre-selected scan if ID provided
  const preSelectedScan = params.scan
    ? scans.find((s: any) => s.id === params.scan)
    : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">MCI Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Run AI-powered analysis on MRI scans using trained Random Forest model
          </p>
        </div>
      </div>

      {/* Analysis Interfaces */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Analysis */}
        <AnalyzeInterface
          scans={scans}
          preSelectedScan={preSelectedScan}
          userId={user.id}
        />

        {/* Batch Analysis */}
        <BatchAnalysis scans={scans} userId={user.id} />
      </div>
    </div>
  );
}
