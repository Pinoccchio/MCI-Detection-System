'use client';

/**
 * Report Generator Component
 * Generates and downloads PDF reports for analysis results
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateReportHTML, downloadReportAsPDF, downloadReportAsHTML } from '@/lib/pdf/generator';
import { createReport } from '@/lib/api/reports';
import { FileText, Download, Loader2, CheckCircle } from 'lucide-react';

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

      // Generate HTML report
      const html = generateReportHTML({
        analysis: analysisData,
        patient: patientData,
        scan: scanData,
        generatedBy,
        institutionName,
        reportType,
      });

      // Generate filename
      const filename = `MCI_Report_${patientData.patient_id}_${new Date().toISOString().split('T')[0]}`;

      // Save report record to database
      const reportData = {
        analysis_id: analysisId,
        report_type: reportType,
        title: reportType === 'clinical'
          ? `MCI Analysis Report - ${patientData.full_name}`
          : `MCI Research Report - ${patientData.patient_id}`,
      };

      const result = await createReport(reportData);

      if (result.success && result.data) {
        setReportId(result.data.id);
      }

      // Download as PDF (opens print dialog)
      downloadReportAsPDF(html, filename);

      setStatus('success');

      // Reset after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err: any) {
      console.error('Report generation error:', err);
      setError(err.message || 'Failed to generate report');
      setStatus('error');
    }
  };

  const handleDownloadHTML = () => {
    try {
      // Generate HTML report
      const html = generateReportHTML({
        analysis: analysisData,
        patient: patientData,
        scan: scanData,
        generatedBy,
        institutionName,
        reportType,
      });

      // Generate filename
      const filename = `MCI_Report_${patientData.patient_id}_${new Date().toISOString().split('T')[0]}.html`;

      // Download as HTML
      downloadReportAsHTML(html, filename);
    } catch (err: any) {
      console.error('HTML download error:', err);
      setError(err.message || 'Failed to download HTML');
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

      {/* Generate Buttons */}
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
              Generate PDF Report
            </>
          )}
        </Button>

        <Button variant="outline" onClick={handleDownloadHTML}>
          <Download className="h-4 w-4 mr-2" />
          Download HTML
        </Button>
      </div>

      {/* Error Message */}
      {error && status === 'error' && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && (
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
          <p className="font-medium">Report generated successfully!</p>
          <p className="text-xs mt-1">
            The PDF has been saved to the reports section. You can download it from there.
          </p>
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
