/**
 * Report Detail Page
 * Displays a generated report with the same UI as the results page
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/actions';
import { getReportById } from '@/lib/api/reports';
import { formatDateTime } from '@/lib/utils';
import {
  Brain,
  User,
  Calendar,
  TrendingUp,
  Activity,
  BarChart3,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportPrintButton } from '@/components/reports/ReportPrintButton';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params
  const { id } = await params;

  // Check authentication
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Fetch report with related analysis data
  const { report, error } = await getReportById(id);

  if (error || !report) {
    notFound();
  }

  // Extract analysis data from the report
  const analysis = report.analysis_results;
  const scan = analysis?.mri_scans;
  const patient = scan?.patients;

  if (!analysis) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{report.title}</h1>
            <p className="text-muted-foreground mt-1">
              <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                report.report_type === 'clinical'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              }`}>
                {report.report_type} Report
              </span>
              <span className="ml-2">Generated {formatDateTime(report.created_at)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ReportPrintButton
            analysisData={analysis}
            patientData={patient}
            scanData={scan}
            reportType={report.report_type}
            generatedBy={report.user_profiles?.full_name || 'System'}
          />
          <Link href="/dashboard/reports">
            <Button variant="ghost">Back to Reports</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient & Scan Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Patient Information</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <Link
                    href={`/dashboard/patients/${scan?.patient_id}`}
                    className="font-medium hover:underline"
                  >
                    {patient?.full_name}
                  </Link>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    {patient?.patient_id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Scan Date</p>
                  <p className="font-medium">{formatDateTime(scan?.scan_date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Scan Type</p>
                  <p className="font-medium">{scan?.scan_type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Model Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Model Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Model:</span>
                <span className="font-medium">{analysis.model_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analyzed:</span>
                <span className="font-medium">
                  {formatDateTime(analysis.created_at)}
                </span>
              </div>
              {analysis.processing_time_ms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span className="font-medium">
                    {(analysis.processing_time_ms / 1000).toFixed(2)}s
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Report Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Report Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium capitalize">{report.report_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Generated:</span>
                <span className="font-medium">
                  {formatDateTime(report.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Generated By:</span>
                <span className="font-medium">
                  {report.user_profiles?.full_name || 'System'}
                </span>
              </div>
              {report.file_size && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span className="font-medium">
                    {(report.file_size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prediction Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Prediction</h2>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold mb-2">{analysis.prediction}</p>
                <p className="text-muted-foreground">
                  Confidence: {(analysis.confidence * 100).toFixed(2)}%
                </p>
                <div className="mt-3 w-full bg-muted rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      analysis.prediction === 'Cognitively Normal'
                        ? 'bg-green-500'
                        : 'bg-orange-500'
                    }`}
                    style={{ width: `${analysis.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Probabilities */}
          {analysis.probabilities && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Class Probabilities</h2>
              </div>

              <div className="space-y-4">
                {Object.entries(analysis.probabilities).map(([className, prob]) => (
                  <div key={className}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">{className}</span>
                      <span className="text-muted-foreground">
                        {((prob as number) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(prob as number) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volumetry Data */}
          {analysis.volumetry && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Hippocampal Volumetry</h2>
              </div>

              <div className="grid grid-cols-3 gap-6 text-center">
                {Object.entries(analysis.volumetry).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-sm text-muted-foreground mb-2 capitalize">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-2xl font-bold">{(value as number).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">mm³</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features Display */}
          {analysis.features && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Extracted Features</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analysis.features)
                  .slice(0, 12)
                  .map(([key, value]) => (
                    <div key={key} className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1 truncate">
                        {key}
                      </p>
                      <p className="font-medium">{(value as number).toFixed(4)}</p>
                    </div>
                  ))}
              </div>

              {Object.keys(analysis.features).length > 12 && (
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  Showing 12 of {Object.keys(analysis.features).length} features
                </p>
              )}
            </div>
          )}

          {/* Link to Original Analysis - Only for clinicians/admins */}
          {user.profile?.role !== 'researcher' && (
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Original Analysis</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    View the original analysis result or generate a new report
                  </p>
                </div>
                <Link href={`/dashboard/results/${analysis.id}`}>
                  <Button>
                    <Brain className="h-4 w-4 mr-2" />
                    View Analysis
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
