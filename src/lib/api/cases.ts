'use server';

/**
 * Cases API Operations
 * Provides aggregated patient case data for clinicians
 */

import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES
// ============================================================================

export interface PatientCaseSummary {
  id: string;
  patient_id: string;
  full_name: string;
  date_of_birth: string;
  gender: 'M' | 'F' | 'Other';
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  // Aggregated data
  scan_count: number;
  analysis_count: number;
  latest_scan_date?: string;
  latest_analysis?: {
    id: string;
    prediction: string;
    confidence: number;
    created_at: string;
  } | null;
}

export interface CasesListResult {
  cases: PatientCaseSummary[];
  total: number;
  error?: string;
}

export interface CaseStats {
  active: number;       // Patients with at least one scan
  pendingReview: number; // Patients with scans but no analysis
  completed: number;    // Patients with completed analyses
  mciDetected: number;  // Patients with MCI diagnosis
  error?: string;
}

// ============================================================================
// GET CASES WITH SUMMARY
// ============================================================================

/**
 * Get all patient cases with aggregated scan and analysis data
 */
export async function getCasesWithSummary(options?: {
  search?: string;
  status?: 'all' | 'active' | 'pending' | 'completed' | 'mci';
  limit?: number;
  offset?: number;
}): Promise<CasesListResult> {
  try {
    const supabase = await createClient();

    // Fetch patients
    let patientsQuery = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply search filter
    if (options?.search) {
      patientsQuery = patientsQuery.or(
        `full_name.ilike.%${options.search}%,patient_id.ilike.%${options.search}%`
      );
    }

    const { data: patients, error: patientsError, count } = await patientsQuery;

    if (patientsError) {
      console.error('[Cases API] Patients error:', patientsError.message);
      return {
        cases: [],
        total: 0,
        error: patientsError.message,
      };
    }

    if (!patients || patients.length === 0) {
      return {
        cases: [],
        total: 0,
      };
    }

    // Get all scans for these patients
    const patientIds = patients.map((p) => p.id);
    const { data: scans } = await supabase
      .from('mri_scans')
      .select('id, patient_id, scan_date, status')
      .in('patient_id', patientIds)
      .order('scan_date', { ascending: false });

    // Get all analyses with related scan info
    const { data: analyses } = await supabase
      .from('analysis_results')
      .select('id, scan_id, prediction, confidence, created_at')
      .order('created_at', { ascending: false });

    // Create maps for quick lookups
    const scansByPatient: Record<string, typeof scans> = {};
    const analysesByScan: Record<string, typeof analyses> = {};

    scans?.forEach((scan) => {
      if (!scansByPatient[scan.patient_id]) {
        scansByPatient[scan.patient_id] = [];
      }
      scansByPatient[scan.patient_id]?.push(scan);
    });

    analyses?.forEach((analysis) => {
      if (!analysesByScan[analysis.scan_id]) {
        analysesByScan[analysis.scan_id] = [];
      }
      analysesByScan[analysis.scan_id]?.push(analysis);
    });

    // Build case summaries
    let cases: PatientCaseSummary[] = patients.map((patient) => {
      const patientScans = scansByPatient[patient.id] || [];
      const scanCount = patientScans.length;
      const latestScanDate = patientScans[0]?.scan_date;

      // Get all analyses for this patient's scans
      type AnalysisItem = { id: string; scan_id: string; prediction: string; confidence: number; created_at: string };
      let allAnalyses: AnalysisItem[] = [];
      patientScans.forEach((scan) => {
        const scanAnalyses = analysesByScan[scan.id] || [];
        allAnalyses = allAnalyses.concat(scanAnalyses as AnalysisItem[]);
      });

      // Sort by date descending and get the latest
      allAnalyses.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const latestAnalysis = allAnalyses[0];

      return {
        id: patient.id,
        patient_id: patient.patient_id,
        full_name: patient.full_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        contact_email: patient.contact_email,
        contact_phone: patient.contact_phone,
        created_at: patient.created_at,
        scan_count: scanCount,
        analysis_count: allAnalyses.length,
        latest_scan_date: latestScanDate,
        latest_analysis: latestAnalysis
          ? {
              id: latestAnalysis.id,
              prediction: latestAnalysis.prediction,
              confidence: latestAnalysis.confidence,
              created_at: latestAnalysis.created_at,
            }
          : null,
      };
    });

    // Apply status filter
    if (options?.status && options.status !== 'all') {
      cases = cases.filter((c) => {
        switch (options.status) {
          case 'active':
            return c.scan_count > 0;
          case 'pending':
            return c.scan_count > 0 && c.analysis_count === 0;
          case 'completed':
            return c.analysis_count > 0;
          case 'mci':
            return c.latest_analysis?.prediction === 'Mild Cognitive Impairment';
          default:
            return true;
        }
      });
    }

    // Apply pagination (after filtering)
    const totalFiltered = cases.length;
    if (options?.offset) {
      cases = cases.slice(options.offset);
    }
    if (options?.limit) {
      cases = cases.slice(0, options.limit);
    }

    return {
      cases,
      total: options?.status && options.status !== 'all' ? totalFiltered : (count || 0),
    };
  } catch (error: any) {
    console.error('[Cases API] Unexpected error:', error);
    return {
      cases: [],
      total: 0,
      error: error.message || 'Failed to fetch cases',
    };
  }
}

// ============================================================================
// GET CASE STATS
// ============================================================================

/**
 * Get case statistics for dashboard cards
 */
export async function getCaseStats(): Promise<CaseStats> {
  try {
    const supabase = await createClient();

    // Get all patients
    const { data: patients } = await supabase.from('patients').select('id');

    if (!patients || patients.length === 0) {
      return {
        active: 0,
        pendingReview: 0,
        completed: 0,
        mciDetected: 0,
      };
    }

    const patientIds = patients.map((p) => p.id);

    // Get scans grouped by patient
    const { data: scans } = await supabase
      .from('mri_scans')
      .select('id, patient_id')
      .in('patient_id', patientIds);

    // Get all analyses
    const { data: analyses } = await supabase
      .from('analysis_results')
      .select('id, scan_id, prediction');

    // Create lookup maps
    const scansPerPatient: Record<string, string[]> = {};
    scans?.forEach((scan) => {
      if (!scansPerPatient[scan.patient_id]) {
        scansPerPatient[scan.patient_id] = [];
      }
      scansPerPatient[scan.patient_id].push(scan.id);
    });

    const analysesPerScan: Record<string, typeof analyses> = {};
    analyses?.forEach((analysis) => {
      if (!analysesPerScan[analysis.scan_id]) {
        analysesPerScan[analysis.scan_id] = [];
      }
      analysesPerScan[analysis.scan_id]?.push(analysis);
    });

    // Calculate stats
    let active = 0;
    let pendingReview = 0;
    let completed = 0;
    let mciDetected = 0;

    patients.forEach((patient) => {
      const patientScanIds = scansPerPatient[patient.id] || [];
      const hasScans = patientScanIds.length > 0;

      // Get all analyses for this patient
      type StatsAnalysis = { id: string; scan_id: string; prediction: string };
      let patientAnalyses: StatsAnalysis[] = [];
      patientScanIds.forEach((scanId) => {
        const scanAnalyses = analysesPerScan[scanId] || [];
        patientAnalyses = patientAnalyses.concat(scanAnalyses as StatsAnalysis[]);
      });

      const hasAnalyses = patientAnalyses.length > 0;
      const hasMCI = patientAnalyses.some(
        (a) => a.prediction === 'Mild Cognitive Impairment'
      );

      if (hasScans) active++;
      if (hasScans && !hasAnalyses) pendingReview++;
      if (hasAnalyses) completed++;
      if (hasMCI) mciDetected++;
    });

    return {
      active,
      pendingReview,
      completed,
      mciDetected,
    };
  } catch (error: any) {
    console.error('[Cases API] Stats error:', error);
    return {
      active: 0,
      pendingReview: 0,
      completed: 0,
      mciDetected: 0,
      error: error.message,
    };
  }
}
