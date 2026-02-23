'use client';

/**
 * Report Print Button Component
 * Generates HTML report and opens print dialog for PDF export
 */

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { generateReportHTML, downloadReportAsPDF } from '@/lib/pdf/generator';

interface ReportPrintButtonProps {
  analysisData: any;
  patientData: any;
  scanData: any;
  reportType: 'clinical' | 'research';
  generatedBy: string;
  institutionName?: string;
}

export function ReportPrintButton({
  analysisData,
  patientData,
  scanData,
  reportType,
  generatedBy,
  institutionName,
}: ReportPrintButtonProps) {
  const handlePrint = () => {
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
    const filename = `MCI_Report_${patientData?.patient_id || 'unknown'}_${new Date().toISOString().split('T')[0]}`;

    // Open print dialog
    downloadReportAsPDF(html, filename);
  };

  return (
    <Button variant="outline" onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-2" />
      Print to PDF
    </Button>
  );
}
