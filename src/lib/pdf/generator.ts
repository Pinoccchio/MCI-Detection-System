/**
 * PDF Report Generator
 * Generates clinical and research reports for MCI analysis results
 */

import { AnalysisResultWithDetails } from '@/lib/api/analyses';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  anonymizePatientName,
  calculateAge,
  anonymizePatientId,
  anonymizeScanDate,
  getYearOnly,
  anonymizeInstitution,
  standardizeGender,
} from './anonymizer';

// ============================================================================
// TYPES
// ============================================================================

export interface ReportData {
  analysis: AnalysisResultWithDetails;
  patient: any;
  scan: any;
  generatedBy: string;
  institutionName?: string;
  reportType?: 'clinical' | 'research';
}

// ============================================================================
// HTML TEMPLATE GENERATOR
// ============================================================================

/**
 * Generate HTML template for PDF report
 */
export function generateReportHTML(data: ReportData): string {
  const { analysis, patient, scan, generatedBy, institutionName, reportType = 'clinical' } = data;
  const isResearch = reportType === 'research';

  const reportDate = new Date().toISOString();
  const isMCI = analysis.prediction === 'Mild Cognitive Impairment';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MCI ${isResearch ? 'Research' : 'Clinical'} Report - ${isResearch ? anonymizePatientName(patient.patient_id) : patient.full_name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
    }

    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .header h1 {
      color: #2563eb;
      font-size: 28px;
      margin-bottom: 5px;
    }

    .header .subtitle {
      color: #64748b;
      font-size: 14px;
    }

    .institution {
      text-align: right;
      color: #64748b;
      font-size: 12px;
      margin-top: -20px;
    }

    .section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 18px;
      color: #1e40af;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
      margin-bottom: 15px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }

    .info-item {
      padding: 12px;
      background: #f8fafc;
      border-radius: 6px;
    }

    .info-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }

    .prediction-box {
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      border: 2px solid ${isMCI ? '#f59e0b' : '#10b981'};
      background: ${isMCI ? '#fef3c7' : '#d1fae5'};
    }

    .prediction-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 5px;
    }

    .prediction-value {
      font-size: 24px;
      font-weight: bold;
      color: ${isMCI ? '#d97706' : '#059669'};
      margin-bottom: 10px;
    }

    .confidence-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }

    .confidence-fill {
      height: 100%;
      background: ${isMCI ? '#f59e0b' : '#10b981'};
      width: ${(analysis.confidence * 100).toFixed(1)}%;
    }

    .probabilities {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 15px;
    }

    .probability-item {
      padding: 15px;
      background: #f8fafc;
      border-radius: 6px;
    }

    .probability-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 5px;
    }

    .probability-value {
      font-size: 20px;
      font-weight: bold;
      color: #1e293b;
    }

    .probability-bar {
      width: 100%;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 8px;
    }

    .probability-fill {
      height: 100%;
      background: #2563eb;
    }

    .volumetry-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 15px;
    }

    .volumetry-item {
      text-align: center;
      padding: 15px;
      background: #f8fafc;
      border-radius: 6px;
    }

    .volumetry-label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .volumetry-value {
      font-size: 24px;
      font-weight: bold;
      color: #1e293b;
    }

    .volumetry-unit {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 15px;
    }

    .feature-item {
      padding: 10px;
      background: #f8fafc;
      border-radius: 4px;
      font-size: 11px;
    }

    .feature-label {
      color: #64748b;
      margin-bottom: 3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .feature-value {
      font-weight: 600;
      color: #1e293b;
    }

    .disclaimer {
      margin-top: 40px;
      padding: 15px;
      background: #fef2f2;
      border-left: 4px solid #dc2626;
      border-radius: 4px;
      font-size: 11px;
      line-height: 1.5;
      color: #7f1d1d;
    }

    .disclaimer-title {
      font-weight: bold;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      font-size: 11px;
      color: #64748b;
    }

    .signature-section {
      margin-top: 40px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
    }

    .signature-box {
      border-top: 1px solid #000;
      padding-top: 10px;
    }

    .signature-label {
      font-size: 11px;
      color: #64748b;
    }

    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <h1>MCI ${isResearch ? 'Research' : 'Clinical'} Report</h1>
    <div class="subtitle">Mild Cognitive Impairment Detection System</div>
    ${institutionName ? `<div class="institution">${isResearch ? anonymizeInstitution(institutionName) : institutionName}</div>` : ''}
  </div>

  <!-- Patient Information -->
  <div class="section">
    <h2 class="section-title">${isResearch ? 'Subject Information' : 'Patient Information'}</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">${isResearch ? 'Subject ID' : 'Patient Name'}</div>
        <div class="info-value">${isResearch ? anonymizePatientName(patient.patient_id) : patient.full_name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${isResearch ? 'Study ID' : 'Patient ID'}</div>
        <div class="info-value">${isResearch ? anonymizePatientId(patient.patient_id) : patient.patient_id}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${isResearch ? 'Age' : 'Date of Birth'}</div>
        <div class="info-value">${isResearch ? `${calculateAge(patient.date_of_birth)} years` : formatDate(patient.date_of_birth)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Gender</div>
        <div class="info-value">${standardizeGender(patient.gender)}</div>
      </div>
    </div>
  </div>

  <!-- Scan Information -->
  <div class="section">
    <h2 class="section-title">Scan Information</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Scan Type</div>
        <div class="info-value">${scan.scan_type}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${isResearch ? 'Scan Timing' : 'Scan Date'}</div>
        <div class="info-value">${isResearch ? anonymizeScanDate(scan.scan_date, analysis.created_at) : formatDateTime(scan.scan_date)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">${isResearch ? 'Analysis Year' : 'Analysis Date'}</div>
        <div class="info-value">${isResearch ? getYearOnly(analysis.created_at) : formatDateTime(analysis.created_at)}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Model Version</div>
        <div class="info-value">${analysis.model_version}</div>
      </div>
    </div>
  </div>

  <!-- Prediction Results -->
  <div class="section">
    <h2 class="section-title">Analysis Results</h2>
    <div class="prediction-box">
      <div class="prediction-label">PREDICTION</div>
      <div class="prediction-value">${analysis.prediction}</div>
      <div class="prediction-label">Confidence: ${(analysis.confidence * 100).toFixed(2)}%</div>
      <div class="confidence-bar">
        <div class="confidence-fill"></div>
      </div>
    </div>

    <div class="probabilities">
      ${Object.entries(analysis.probabilities)
        .map(
          ([className, prob]) => `
        <div class="probability-item">
          <div class="probability-label">${className}</div>
          <div class="probability-value">${(prob * 100).toFixed(2)}%</div>
          <div class="probability-bar">
            <div class="probability-fill" style="width: ${(prob * 100).toFixed(1)}%"></div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  </div>

  ${
    analysis.volumetry
      ? `
  <!-- Hippocampal Volumetry -->
  <div class="section">
    <h2 class="section-title">Hippocampal Volumetry</h2>
    <div class="volumetry-grid">
      ${Object.entries(analysis.volumetry)
        .map(
          ([key, value]) => `
        <div class="volumetry-item">
          <div class="volumetry-label">${key.replace(/_/g, ' ')}</div>
          <div class="volumetry-value">${value.toFixed(2)}</div>
          <div class="volumetry-unit">mm³</div>
        </div>
      `
        )
        .join('')}
    </div>
  </div>
  `
      : ''
  }

  ${
    analysis.features
      ? `
  <!-- Extracted Features -->
  <div class="section">
    <h2 class="section-title">Extracted Features (26 Hippocampal Features)</h2>
    <div class="features-grid">
      ${Object.entries(analysis.features)
        .map(
          ([key, value]) => `
        <div class="feature-item">
          <div class="feature-label">${key}</div>
          <div class="feature-value">${value.toFixed(4)}</div>
        </div>
      `
        )
        .join('')}
    </div>
  </div>
  `
      : ''
  }

  <!-- Disclaimer -->
  <div class="disclaimer">
    <div class="disclaimer-title">${isResearch ? 'Research Disclaimer' : 'Medical Disclaimer'}</div>
    <p>
      ${isResearch
        ? `This report is generated for research purposes only. All patient identifying information has been anonymized
           to protect privacy. This analysis is part of a research study and should not be used for clinical diagnosis
           or treatment decisions. The data presented is intended solely for statistical analysis and research publication.`
        : `This AI-powered analysis is intended for research and clinical decision support purposes only.
           It should not be used as the sole basis for clinical diagnosis or treatment decisions.
           The results must be interpreted by qualified healthcare professionals in conjunction with
           other clinical findings, patient history, and diagnostic tests. Always consult with qualified
           medical professionals for definitive diagnosis and treatment planning.`
      }
    </p>
  </div>

  <!-- Signature Section -->
  ${!isResearch ? `
  <div class="signature-section">
    <div class="signature-box">
      <div class="signature-label">Analyzed By</div>
      <div style="margin-top: 5px; font-weight: 600;">${generatedBy}</div>
    </div>
    <div class="signature-box">
      <div class="signature-label">Reviewing Physician</div>
      <div style="margin-top: 30px;"></div>
    </div>
  </div>
  ` : ''}

  <!-- Footer -->
  <div class="footer">
    <div>Report Generated: ${formatDateTime(reportDate)}</div>
    <div>MCI Detection System v1.0 | Powered by Random Forest ML Model (87-91% Accuracy)</div>
  </div>
</body>
</html>
  `.trim();
}

// ============================================================================
// PDF GENERATION (Client-side using browser print)
// ============================================================================

/**
 * Generate PDF report URL for download
 */
export function generateReportBlobURL(html: string): string {
  const blob = new Blob([html], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

/**
 * Download report as PDF (triggers browser print dialog)
 */
export function downloadReportAsPDF(html: string, filename: string) {
  // Open in new window and trigger print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Download report as HTML file
 */
export function downloadReportAsHTML(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
