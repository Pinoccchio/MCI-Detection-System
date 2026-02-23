'use client';

/**
 * Report Generator Component
 * Generates and downloads PDF reports for analysis results
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateReportHTML } from '@/lib/pdf/generator';
import { createReport } from '@/lib/api/reports';
import { FileText, Loader2, CheckCircle, Settings, ChevronDown, ChevronUp } from 'lucide-react';

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

interface ReportSections {
  patientInfo: boolean;
  scanDetails: boolean;
  prediction: boolean;
  probabilities: boolean;
  volumetry: boolean;
  features: boolean;
  recommendations: boolean;
}

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
  const [showCustomization, setShowCustomization] = useState(false);
  const [sections, setSections] = useState<ReportSections>({
    patientInfo: true,
    scanDetails: true,
    prediction: true,
    probabilities: true,
    volumetry: true,
    features: false,
    recommendations: true,
  });

  const toggleSection = (key: keyof ReportSections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sectionLabels: Record<keyof ReportSections, string> = {
    patientInfo: 'Patient Information',
    scanDetails: 'Scan Details',
    prediction: 'Prediction Result',
    probabilities: 'Class Probabilities',
    volumetry: 'Hippocampal Volumetry',
    features: 'Feature Analysis',
    recommendations: 'Clinical Recommendations',
  };

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
        setError(result.error || 'Failed to create report in database');
        setStatus('error');
        return;
      }

      if (result.data) {
        setReportId(result.data.id);
        console.log('[ReportGenerator] Report created successfully:', result.data.id);
      }

      setStatus('success');

      // Don't auto-reset - let user see the success message with link
    } catch (err: any) {
      console.error('[ReportGenerator] Unexpected error:', err);
      setError(err.message || 'Failed to generate report');
      setStatus('error');
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

      {/* Customization Options */}
      <div className="border border-border rounded-lg">
        <button
          type="button"
          onClick={() => setShowCustomization(!showCustomization)}
          className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
          disabled={status === 'generating'}
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Customize Report Sections</span>
          </div>
          {showCustomization ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {showCustomization && (
          <div className="p-3 pt-0 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">
              Select which sections to include in the report
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(sections) as Array<keyof ReportSections>).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={sections[key]}
                    onChange={() => toggleSection(key)}
                    className="h-4 w-4 rounded border-border"
                    disabled={status === 'generating'}
                  />
                  <span className="text-sm">{sectionLabels[key]}</span>
                </label>
              ))}
            </div>
          </div>
        )}
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
