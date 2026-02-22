/**
 * Dashboard Overview Page
 * Displays role-specific dashboard with real statistics and quick actions
 */

import { getCurrentUser } from '@/lib/auth/actions';
import { getPatientStats } from '@/lib/api/patients';
import { getScanStats } from '@/lib/api/scans';
import { getAnalysisStats } from '@/lib/api/analyses';
import { getReportStats } from '@/lib/api/reports';
import { getAnalyses } from '@/lib/api/analyses';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDateTime } from '@/lib/utils';
import {
  Users,
  Scan,
  Brain,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  Plus,
  Upload,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, change, icon: Icon, trend = 'neutral' }: StatCardProps) {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          {change && (
            <p className={`text-sm mt-2 ${trendColors[trend]}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================

async function AdminDashboard() {
  // Fetch statistics
  const patientStats = await getPatientStats();
  const scanStats = await getScanStats();
  const analysisStats = await getAnalysisStats();
  const reportStats = await getReportStats();

  // Fetch recent analyses for activity
  const { analyses } = await getAnalyses({ limit: 5 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage system operations and monitor overall performance
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={patientStats.total}
          change={`+${patientStats.thisMonth} this month`}
          icon={Users}
          trend={patientStats.thisMonth > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          title="MRI Scans"
          value={scanStats.total}
          change={`+${scanStats.thisWeek} this week`}
          icon={Scan}
          trend={scanStats.thisWeek > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Analyses Complete"
          value={analysisStats.total}
          change={`${scanStats.completed} completed scans`}
          icon={Brain}
          trend="neutral"
        />
        <StatCard
          title="Reports Generated"
          value={reportStats.total}
          change={`${reportStats.thisMonth} this month`}
          icon={FileText}
          trend={reportStats.thisMonth > 0 ? 'up' : 'neutral'}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/patients/new"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Users className="h-6 w-6 mb-2 text-primary" />
            <h3 className="font-medium">Add Patient</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Register a new patient
            </p>
          </Link>
          <Link
            href="/dashboard/upload"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Scan className="h-6 w-6 mb-2 text-primary" />
            <h3 className="font-medium">Upload Scan</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload new MRI scan
            </p>
          </Link>
          <Link
            href="/dashboard/analyze"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Brain className="h-6 w-6 mb-2 text-primary" />
            <h3 className="font-medium">Run Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze MRI scan
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
        {analyses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">
              Start by adding patients and uploading scans
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis: any) => (
              <Link
                key={analysis.id}
                href={`/dashboard/results/${analysis.id}`}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {analysis.mri_scans?.patients?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.prediction} • {(analysis.confidence * 100).toFixed(1)}% confidence
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(analysis.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CLINICIAN DASHBOARD
// ============================================================================

async function ClinicianDashboard() {
  // Fetch statistics
  const patientStats = await getPatientStats();
  const analysisStats = await getAnalysisStats();

  // Fetch recent analyses
  const { analyses } = await getAnalyses({ limit: 5 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clinician Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Review patient cases and analysis results
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Patients"
          value={patientStats.total}
          change={`+${patientStats.thisMonth} new`}
          icon={Users}
          trend={patientStats.thisMonth > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Total Analyses"
          value={analysisStats.total}
          change={`${analysisStats.thisWeek} this week`}
          icon={Activity}
          trend={analysisStats.thisWeek > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          title="MCI Detected"
          value={analysisStats.mciDetected}
          change={`${analysisStats.total > 0 ? ((analysisStats.mciDetected / analysisStats.total) * 100).toFixed(1) : 0}% of cases`}
          icon={Brain}
          trend="neutral"
        />
        <StatCard
          title="Avg Confidence"
          value={`${(analysisStats.avgConfidence * 100).toFixed(1)}%`}
          change="Model accuracy"
          icon={TrendingUp}
          trend="neutral"
        />
      </div>

      {/* Quick Access */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/patients"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Users className="h-6 w-6 mb-2 text-primary" />
            <h3 className="font-medium">View Patients</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Access patient records
            </p>
          </Link>
          <Link
            href="/dashboard/results"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Brain className="h-6 w-6 mb-2 text-primary" />
            <h3 className="font-medium">Analysis Results</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Review MCI predictions
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Reviews */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
        {analyses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No analyses yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis: any) => (
              <Link
                key={analysis.id}
                href={`/dashboard/results/${analysis.id}`}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      analysis.prediction === 'Cognitively Normal'
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-orange-100 dark:bg-orange-900/30'
                    }`}
                  >
                    <Brain
                      className={`h-5 w-5 ${
                        analysis.prediction === 'Cognitively Normal'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium">
                      {analysis.mri_scans?.patients?.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {analysis.prediction}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {(analysis.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(analysis.created_at)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// RESEARCHER DASHBOARD
// ============================================================================

async function ResearcherDashboard() {
  // Fetch statistics
  const scanStats = await getScanStats();
  const analysisStats = await getAnalysisStats();

  // Fetch recent analyses
  const { analyses } = await getAnalyses({ limit: 5 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Research Platform</h1>
        <p className="text-muted-foreground mt-1">
          Manage datasets and analyze model performance
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Scans"
          value={scanStats.total}
          change={`+${scanStats.thisWeek} this week`}
          icon={Scan}
          trend={scanStats.thisWeek > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Model Accuracy"
          value="87%"
          change="Random Forest"
          icon={TrendingUp}
          trend="up"
        />
        <StatCard
          title="Analyses Run"
          value={analysisStats.total}
          change={`${analysisStats.thisWeek} this week`}
          icon={Brain}
          trend={analysisStats.thisWeek > 0 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Avg Confidence"
          value={`${(analysisStats.avgConfidence * 100).toFixed(1)}%`}
          change="Model performance"
          icon={Activity}
          trend="neutral"
        />
      </div>

      {/* Quick Access */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Research Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/datasets"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Activity className="h-6 w-6 mb-2 text-primary" />
            <h3 className="font-medium">Datasets</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage research data
            </p>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <TrendingUp className="h-6 w-6 mb-2 text-primary" />
            <h3 className="font-medium">Analytics</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Model performance
            </p>
          </Link>
          <Link
            href="/dashboard/analyze"
            className="p-4 border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <Brain className="h-6 w-6 mb-2 text-primary" />
            <h3 className="font-medium">Run Analysis</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze MRI scans
            </p>
          </Link>
        </div>
      </div>

      {/* Model Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Model</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model Type:</span>
              <span className="font-medium">Random Forest Classifier</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="font-medium">1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Features:</span>
              <span className="font-medium">26 hippocampal features</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accuracy:</span>
              <span className="font-medium text-green-600">87-91%</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Predictions:</span>
              <span className="font-medium">{analysisStats.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">MCI Detected:</span>
              <span className="font-medium">{analysisStats.mciDetected}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Normal:</span>
              <span className="font-medium">{analysisStats.total - analysisStats.mciDetected}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Confidence:</span>
              <span className="font-medium">{(analysisStats.avgConfidence * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Analyses */}
      {analyses.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Analyses</h2>
            <Link href="/dashboard/results">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-2">
            {analyses.map((analysis: any) => (
              <div
                key={analysis.id}
                className="flex items-center justify-between p-3 border border-border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm">
                    <p className="font-medium">{analysis.prediction}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(analysis.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {(analysis.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Render role-specific dashboard
  switch (user.profile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'clinician':
      return <ClinicianDashboard />;
    case 'researcher':
      return <ResearcherDashboard />;
    default:
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Invalid user role. Please contact support.
          </p>
        </div>
      );
  }
}
