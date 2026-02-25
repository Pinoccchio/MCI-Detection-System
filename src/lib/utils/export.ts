/**
 * Export Utilities
 * Reusable functions for exporting data to CSV and JSON formats
 */

import { AnalysisResult } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

export interface FormattedAnalysis {
  id: string;
  scan_id: string;
  patient_id: string;
  patient_name: string;
  scan_date: string;
  scan_type: string;
  prediction: string;
  confidence: number;
  confidence_percent: string;
  prob_normal: number;
  prob_mci: number;
  model_version: string;
  analyzed_by: string;
  analyzed_at: string;
  left_hippocampus?: number;
  right_hippocampus?: number;
  total_volume?: number;
}

// ============================================================================
// EXPORT TO CSV
// ============================================================================

/**
 * Export data to CSV file and trigger download
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: ExportColumn[]
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Build header row
  const headers = columns.map((col) => col.header);

  // Build data rows
  const rows = data.map((item) => {
    return columns.map((col) => {
      const value = getNestedValue(item, col.key);
      const formatted = col.formatter ? col.formatter(value) : String(value ?? '');
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')) {
        return `"${formatted.replace(/"/g, '""')}"`;
      }
      return formatted;
    });
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create and trigger download
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

// ============================================================================
// EXPORT TO JSON
// ============================================================================

/**
 * Export data to JSON file and trigger download
 */
export function exportToJSON<T>(data: T[], filename: string): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

// ============================================================================
// FORMAT ANALYSIS FOR EXPORT
// ============================================================================

/**
 * Format analysis result with nested scan/patient data for export
 */
export function formatAnalysisForExport(analysis: any): FormattedAnalysis {
  const scan = analysis.mri_scans || {};
  const patient = scan.patients || {};
  const volumetry = analysis.volumetry || {};
  const probabilities = analysis.probabilities || {};

  return {
    id: analysis.id,
    scan_id: analysis.scan_id,
    patient_id: patient.patient_id || '',
    patient_name: patient.full_name || 'Unknown',
    scan_date: scan.scan_date || '',
    scan_type: scan.scan_type || '',
    prediction: analysis.prediction,
    confidence: analysis.confidence,
    confidence_percent: `${(analysis.confidence * 100).toFixed(1)}%`,
    prob_normal: probabilities['Cognitively Normal'] || 0,
    prob_mci: probabilities['Mild Cognitive Impairment'] || 0,
    model_version: analysis.model_version,
    analyzed_by: analysis.analyzer?.full_name || '',
    analyzed_at: analysis.created_at,
    left_hippocampus: volumetry.left_hippocampus,
    right_hippocampus: volumetry.right_hippocampus,
    total_volume: volumetry.total_volume,
  };
}

// ============================================================================
// DEFAULT EXPORT COLUMNS
// ============================================================================

/**
 * Default columns for analysis export
 */
export const ANALYSIS_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'patient_id', header: 'Patient ID' },
  { key: 'patient_name', header: 'Patient Name' },
  { key: 'scan_date', header: 'Scan Date', formatter: formatDate },
  { key: 'scan_type', header: 'Scan Type' },
  { key: 'prediction', header: 'Prediction' },
  { key: 'confidence_percent', header: 'Confidence' },
  { key: 'prob_normal', header: 'P(Normal)', formatter: formatProbability },
  { key: 'prob_mci', header: 'P(MCI)', formatter: formatProbability },
  { key: 'model_version', header: 'Model Version' },
  { key: 'analyzed_by', header: 'Analyzed By' },
  { key: 'analyzed_at', header: 'Analyzed At', formatter: formatDateTime },
  { key: 'left_hippocampus', header: 'Left Hippocampus (mm³)', formatter: formatVolume },
  { key: 'right_hippocampus', header: 'Right Hippocampus (mm³)', formatter: formatVolume },
  { key: 'total_volume', header: 'Total Volume (mm³)', formatter: formatVolume },
];

/**
 * Minimal columns for quick export
 */
export const MINIMAL_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'patient_id', header: 'Patient ID' },
  { key: 'scan_date', header: 'Scan Date', formatter: formatDate },
  { key: 'prediction', header: 'Prediction' },
  { key: 'confidence_percent', header: 'Confidence' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Create and trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format date for export
 */
function formatDate(value: any): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(value);
  }
}

/**
 * Format datetime for export
 */
function formatDateTime(value: any): string {
  if (!value) return '';
  try {
    return new Date(value).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(value);
  }
}

/**
 * Format probability for export
 */
function formatProbability(value: any): string {
  if (value == null) return '';
  return `${(Number(value) * 100).toFixed(2)}%`;
}

/**
 * Format volume for export
 */
function formatVolume(value: any): string {
  if (value == null) return '';
  return Number(value).toFixed(2);
}
