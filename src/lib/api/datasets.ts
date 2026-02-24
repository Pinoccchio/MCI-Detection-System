'use server';

/**
 * Datasets API
 * Dataset statistics and data retrieval for researchers
 */

import { createClient } from '@/lib/supabase/server';
import { MRIScan, AnalysisResult } from '@/types/database';
import { DB_PREDICTIONS } from '@/lib/utils/prediction-mapper';

// ============================================================================
// TYPES
// ============================================================================

export interface DatasetStats {
  totalScans: number;
  analyzedScans: number;
  mciCount: number;
  normalCount: number;
  unanalyzedCount: number;
}

export interface ScanWithAnalysis extends MRIScan {
  patients?: {
    patient_id: string;
    full_name: string;
    date_of_birth?: string;
    gender?: string;
  };
  analysis_results?: AnalysisResult[];
  latest_analysis?: AnalysisResult | null;
}

export interface DatasetFilters {
  dateFrom?: string;
  dateTo?: string;
  predictionType?: 'all' | 'mci' | 'normal' | 'unanalyzed';
  status?: string;
  limit?: number;
  offset?: number;
}

// Default query limit
const DEFAULT_LIMIT = 100;

// ============================================================================
// GET DATASET STATS
// ============================================================================

/**
 * Get aggregated statistics for the dataset
 */
export async function getDatasetStats(): Promise<DatasetStats> {
  try {
    const supabase = await createClient();

    // Get total scans count
    const { count: totalScans } = await supabase
      .from('mri_scans')
      .select('*', { count: 'exact', head: true });

    // Get count of scans with at least one analysis
    const { data: analyzedData } = await supabase
      .from('analysis_results')
      .select('scan_id')
      .limit(10000);

    const uniqueAnalyzedScans = new Set(analyzedData?.map((a) => a.scan_id) || []);
    const analyzedScans = uniqueAnalyzedScans.size;

    // Get MCI count
    const { count: mciCount } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true })
      .eq('prediction', DB_PREDICTIONS.MCI);

    // Get Normal count
    const { count: normalCount } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true })
      .eq('prediction', DB_PREDICTIONS.NORMAL);

    return {
      totalScans: totalScans || 0,
      analyzedScans,
      mciCount: mciCount || 0,
      normalCount: normalCount || 0,
      unanalyzedCount: (totalScans || 0) - analyzedScans,
    };
  } catch (error: any) {
    console.error('[Datasets API] Stats error:', error);
    return {
      totalScans: 0,
      analyzedScans: 0,
      mciCount: 0,
      normalCount: 0,
      unanalyzedCount: 0,
    };
  }
}

// ============================================================================
// GET SCANS WITH ANALYSES
// ============================================================================

/**
 * Get scans with their analysis results for the dataset view
 */
export async function getScansWithAnalyses(
  filters?: DatasetFilters
): Promise<{ data: ScanWithAnalysis[]; total: number; error?: string }> {
  try {
    const supabase = await createClient();
    const limit = filters?.limit ?? DEFAULT_LIMIT;

    // First, get scans with patient info
    let scansQuery = supabase
      .from('mri_scans')
      .select(
        `
        *,
        patients(patient_id, full_name, date_of_birth, gender)
      `,
        { count: 'exact' }
      )
      .order('scan_date', { ascending: false })
      .limit(limit);

    // Apply date filters
    if (filters?.dateFrom) {
      scansQuery = scansQuery.gte('scan_date', filters.dateFrom);
    }
    if (filters?.dateTo) {
      scansQuery = scansQuery.lte('scan_date', filters.dateTo);
    }

    // Apply status filter
    if (filters?.status) {
      scansQuery = scansQuery.eq('status', filters.status);
    }

    // Apply offset for pagination
    if (filters?.offset) {
      scansQuery = scansQuery.range(filters.offset, filters.offset + limit - 1);
    }

    const { data: scans, error: scansError, count } = await scansQuery;

    if (scansError) {
      console.error('[Datasets API] Scans query error:', scansError.message);
      return { data: [], total: 0, error: scansError.message };
    }

    if (!scans || scans.length === 0) {
      return { data: [], total: 0 };
    }

    // Get analyses for these scans
    const scanIds = scans.map((s) => s.id);
    const { data: analyses } = await supabase
      .from('analysis_results')
      .select('*')
      .in('scan_id', scanIds)
      .order('created_at', { ascending: false });

    // Group analyses by scan_id and attach to scans
    const analysesByScan = new Map<string, AnalysisResult[]>();
    analyses?.forEach((analysis) => {
      const existing = analysesByScan.get(analysis.scan_id) || [];
      existing.push(analysis);
      analysesByScan.set(analysis.scan_id, existing);
    });

    // Combine scans with their analyses
    let result: ScanWithAnalysis[] = scans.map((scan) => {
      const scanAnalyses = analysesByScan.get(scan.id) || [];
      return {
        ...scan,
        analysis_results: scanAnalyses,
        latest_analysis: scanAnalyses[0] || null,
      };
    });

    // Apply prediction type filter (client-side since it depends on analysis)
    if (filters?.predictionType && filters.predictionType !== 'all') {
      result = result.filter((scan) => {
        if (filters.predictionType === 'unanalyzed') {
          return !scan.latest_analysis;
        }
        if (!scan.latest_analysis) return false;

        if (filters.predictionType === 'mci') {
          return scan.latest_analysis.prediction === DB_PREDICTIONS.MCI;
        }
        if (filters.predictionType === 'normal') {
          return scan.latest_analysis.prediction === DB_PREDICTIONS.NORMAL;
        }
        return true;
      });
    }

    return { data: result, total: count || 0 };
  } catch (error: any) {
    console.error('[Datasets API] getScansWithAnalyses error:', error);
    return { data: [], total: 0, error: error.message };
  }
}

// ============================================================================
// GET EXPORTABLE ANALYSES
// ============================================================================

/**
 * Get all analyses with full details for export
 */
export async function getExportableAnalyses(
  filters?: DatasetFilters
): Promise<{ data: any[]; total: number; error?: string }> {
  try {
    const supabase = await createClient();
    const limit = filters?.limit ?? 1000; // Higher limit for exports

    let query = supabase
      .from('analysis_results')
      .select(
        `
        *,
        mri_scans(
          id,
          patient_id,
          scan_type,
          scan_date,
          status,
          patients(
            patient_id,
            full_name,
            date_of_birth,
            gender
          )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply prediction filter
    if (filters?.predictionType === 'mci') {
      query = query.eq('prediction', DB_PREDICTIONS.MCI);
    } else if (filters?.predictionType === 'normal') {
      query = query.eq('prediction', DB_PREDICTIONS.NORMAL);
    }

    // Apply offset for pagination
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Datasets API] Export query error:', error.message);
      return { data: [], total: 0, error: error.message };
    }

    // Filter by date if specified (on scan_date)
    let result = data || [];
    if (filters?.dateFrom || filters?.dateTo) {
      result = result.filter((item) => {
        const scanDate = item.mri_scans?.scan_date;
        if (!scanDate) return true;

        if (filters.dateFrom && scanDate < filters.dateFrom) return false;
        if (filters.dateTo && scanDate > filters.dateTo) return false;
        return true;
      });
    }

    return { data: result, total: count || 0 };
  } catch (error: any) {
    console.error('[Datasets API] getExportableAnalyses error:', error);
    return { data: [], total: 0, error: error.message };
  }
}
