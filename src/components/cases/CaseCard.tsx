'use client';

/**
 * Case Card Component
 * Displays a patient case summary with quick actions
 */

import { useState } from 'react';
import Link from 'next/link';
import { PatientCaseSummary } from '@/lib/api/cases';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  User,
  Scan,
  Activity,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

interface CaseCardProps {
  caseData: PatientCaseSummary;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

function getStatusBadge(caseData: PatientCaseSummary) {
  if (caseData.latest_analysis?.prediction === 'Mild Cognitive Impairment') {
    return {
      label: 'MCI Detected',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icon: AlertTriangle,
    };
  }
  if (caseData.latest_analysis?.prediction === 'Cognitively Normal') {
    return {
      label: 'Cognitively Normal',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      icon: CheckCircle,
    };
  }
  if (caseData.scan_count > 0 && caseData.analysis_count === 0) {
    return {
      label: 'Pending Review',
      className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      icon: Activity,
    };
  }
  return {
    label: 'No Scans',
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    icon: Scan,
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CaseCard({ caseData }: CaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const status = getStatusBadge(caseData);
  const StatusIcon = status.icon;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all hover:shadow-md">
      {/* Main Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          {/* Patient Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-lg truncate">{caseData.full_name}</h3>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                  <StatusIcon className="h-3 w-3" />
                  {status.label}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="font-mono">{caseData.patient_id}</span>
                <span>{calculateAge(caseData.date_of_birth)} yrs, {caseData.gender === 'M' ? 'Male' : caseData.gender === 'F' ? 'Female' : 'Other'}</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 ml-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Scan className="h-4 w-4" />
                <span className="text-lg font-semibold text-foreground">{caseData.scan_count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Scans</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span className="text-lg font-semibold text-foreground">{caseData.analysis_count}</span>
              </div>
              <p className="text-xs text-muted-foreground">Analyses</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Latest Analysis Summary (always visible if exists) */}
        {caseData.latest_analysis && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Latest Analysis:</span>
                <span className={`font-medium ${
                  caseData.latest_analysis.prediction === 'Mild Cognitive Impairment'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {caseData.latest_analysis.prediction}
                </span>
                <span className="text-muted-foreground">
                  ({Math.round(caseData.latest_analysis.confidence * 100)}% confidence)
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDateTime(caseData.latest_analysis.created_at)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="border-t border-border pt-4">
            {/* Detailed Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Date of Birth
                </p>
                <p className="text-sm font-medium">{formatDate(caseData.date_of_birth)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Scan className="h-3 w-3" />
                  Latest Scan
                </p>
                <p className="text-sm font-medium">
                  {caseData.latest_scan_date
                    ? formatDate(caseData.latest_scan_date)
                    : 'No scans'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Registered
                </p>
                <p className="text-sm font-medium">{formatDate(caseData.created_at)}</p>
              </div>
              {caseData.contact_email && (
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium truncate">{caseData.contact_email}</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/dashboard/patients/${caseData.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Patient
                </Button>
              </Link>
              {caseData.analysis_count > 0 && (
                <Link href={`/dashboard/results?patient=${caseData.id}`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                </Link>
              )}
              <Link href={`/dashboard/reports?patient=${caseData.id}`}>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
