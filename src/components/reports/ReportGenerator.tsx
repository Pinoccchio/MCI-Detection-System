'use client';

/**
 * Report Generator Component
 * Generates and downloads PDF reports for analysis results
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createReport } from '@/lib/api/reports';
import { FileText, Loader2, CheckCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ReportGeneratorProps {
  analysisId: string;
  analysisData: any;
  patientData: any;
  scanData: any;
  generatedBy: string;
  institutionName?: string;
}

type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

// ============================================================================
// COMPONENT
// ============================================================================

export function ReportGenerator({
  analysisId,
  analysisData,
  patientData,
  scanData,
  generatedBy,
  institutionName,
}: ReportGeneratorProps) {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'clinical' | 'research'>('clinical');

  const handleGeneratePDF = async () => {
    try {
      setStatus('generating');
      setError(null);
      setReportId(null); // Clear previous report ID

      // Save report record to database first
      const reportData = {
        analysis_id: analysisId,
        report_type: reportType,
        title: reportType === 'clinical'
          ? `MCI Analysis Report - ${patientData.full_name}`
          : `MCI Research Report - ${patientData.patient_id}`,
      };

      console.log('[ReportGenerator] Creating report:', reportData);
      const result = await createReport(reportData);

      if (!result.success) {
        console.error('[ReportGenerator] Failed to create report:', result.error);
        const errorMsg = result.error || 'Failed to create report in database';
        setError(errorMsg);
        setStatus('error');
        toast.error(errorMsg);
        return;
      }

      if (result.data) {
        setReportId(result.data.id);
        console.log('[ReportGenerator] Report created successfully:', result.data.id);
      }

      setStatus('success');
      toast.success('Report generated successfully');

      // Don't auto-reset - let user see the success message with link
    } catch (err: any) {
      console.error('[ReportGenerator] Unexpected error:', err);
      const errorMsg = err.message || 'Failed to generate report';
      setError(errorMsg);
      setStatus('error');
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-4">
      {/* Report Type Selection */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-muted-foreground">Report Type:</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="clinical"
              checked={reportType === 'clinical'}
              onChange={(e) => setReportType(e.target.value as 'clinical' | 'research')}
              className="w-4 h-4 text-primary"
              disabled={status === 'generating'}
            />
            <span className="text-sm">Clinical Report</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="research"
              checked={reportType === 'research'}
              onChange={(e) => setReportType(e.target.value as 'clinical' | 'research')}
              className="w-4 h-4 text-primary"
              disabled={status === 'generating'}
            />
            <span className="text-sm">Research Report</span>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleGeneratePDF}
          disabled={status === 'generating'}
          className="flex-1"
        >
          {status === 'generating' ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Report Generated!
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>

      </div>

      {/* Error Message */}
      {error && status === 'error' && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && reportId && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          <p className="font-medium">Report generated successfully!</p>
          <p className="text-xs mt-1">
            Your report has been saved.{' '}
            <a href={`/dashboard/reports/${reportId}`} className="underline font-medium">
              View Report
            </a>
            {' '}or see all reports in the{' '}
            <a href="/dashboard/reports" className="underline font-medium">Reports section</a>.
          </p>
          <div className="mt-2">
            <a
              href={`/dashboard/reports/${reportId}`}
              className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
            >
              View Report Now
            </a>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        <p>
          {reportType === 'clinical'
            ? 'Clinical reports include detailed patient information and analysis results suitable for medical review.'
            : 'Research reports include aggregated data and statistical analysis suitable for research purposes.'}
        </p>
      </div>
    </div>
  );
}
