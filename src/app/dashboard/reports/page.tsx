/**
 * Reports List Page
 * Displays all generated reports with filtering
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/actions';
import { getReports, getReportStats } from '@/lib/api/reports';
import { getPatientById } from '@/lib/api/patients';
import { formatDateTime } from '@/lib/utils';
import { FileText, Brain, Stethoscope, FlaskConical, Calendar, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportActions } from '@/components/reports/ReportActions';

// Force dynamic rendering to avoid caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ReportsPageProps {
  searchParams: Promise<{ patient?: string }>;
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  // Check authentication
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Read patient filter from URL params
  const params = await searchParams;
  const patientFilterId = params.patient;

  // Fetch reports, stats, and patient info (if filtering) in parallel
  const [{ reports: allReports, error }, stats, patientResult] = await Promise.all([
    getReports(),
    getReportStats(),
    patientFilterId ? getPatientById(patientFilterId) : Promise.resolve({ patient: null }),
  ]);

  // Get patient name for display in filter indicator
  const patientFilterName = patientResult.patient?.full_name || null;

  // Filter reports by patient if filter is set
  const reports = patientFilterId
    ? allReports.filter((report: any) => report.analysis_results?.mri_scans?.patient_id === patientFilterId)
    : allReports;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and download generated analysis reports
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Total Reports</h3>
          </div>
          <p className="text-3xl font-bold">{stats.total}</p>
          <p className="text-sm text-muted-foreground mt-1">All time</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Stethoscope className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="font-semibold">Clinical Reports</h3>
          </div>
          <p className="text-3xl font-bold">{stats.clinical}</p>
          <p className="text-sm text-muted-foreground mt-1">For patient care</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FlaskConical className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Research Reports</h3>
          </div>
          <p className="text-3xl font-bold">{stats.research}</p>
          <p className="text-sm text-muted-foreground mt-1">For studies</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">This Month</h3>
          </div>
          <p className="text-3xl font-bold">{stats.thisMonth}</p>
          <p className="text-sm text-muted-foreground mt-1">Recent activity</p>
        </div>
      </div>

      {/* Patient Filter Indicator */}
      {patientFilterId && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Filtered by patient: <span className="font-semibold">{patientFilterName || patientFilterId}</span>
          </span>
          <Link href="/dashboard/reports" className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/40"
            >
              <X className="h-4 w-4 mr-1" />
              Clear filter
            </Button>
          </Link>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          Failed to load reports: {error}
        </div>
      )}

      {/* Reports Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Prediction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Generated By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Generated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No reports generated yet</p>
                    <p className="text-sm mt-2">
                      Reports are automatically created when you generate them from analysis results.
                    </p>
                  </td>
                </tr>
              ) : (
                reports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/reports/${report.id}`}
                        className="font-medium hover:underline hover:text-primary"
                      >
                        {report.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/patients/${report.analysis_results?.mri_scans?.patient_id}`}
                        className="hover:underline"
                      >
                        <div className="font-medium">
                          {report.analysis_results?.mri_scans?.patients?.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {report.analysis_results?.mri_scans?.patients?.patient_id}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full capitalize ${
                          report.report_type === 'clinical'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        }`}
                      >
                        {report.report_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          report.analysis_results?.prediction === 'Cognitively Normal'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}
                      >
                        {report.analysis_results?.prediction}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {report.user_profiles?.full_name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(report.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Only show View Analysis button for clinicians/admins */}
                        {user.profile?.role !== 'researcher' && (
                          <Link href={`/dashboard/results/${report.analysis_id}`}>
                            <Button variant="ghost" size="sm" title="View Original Analysis">
                              <Brain className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <ReportActions
                          reportId={report.id}
                          pdfPath={report.pdf_path}
                          userRole={user.profile?.role || 'researcher'}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      {reports.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {reports.length} of {allReports.length} report{allReports.length !== 1 ? 's' : ''}
          {patientFilterId && <span> for this patient</span>}
        </div>
      )}
    </div>
  );
}
