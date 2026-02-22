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
      });

      // Generate filename
      const filename = `MCI_Report_${patientData.patient_id}_${new Date().toISOString().split('T')[0]}`;

      // Save report record to database
      const reportData = {
        analysis_id: analysisId,
        report_type: 'clinical' as const,
        title: `MCI Analysis Report - ${patientData.full_name}`,
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
            Use the print dialog to save as PDF or print the report.
          </p>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-muted-foreground">
        <p>
          The PDF report will open in a new window. Use your browser's print dialog
          to save as PDF or print directly.
        </p>
      </div>
    </div>
  );
}
