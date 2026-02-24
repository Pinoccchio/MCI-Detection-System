'use server';

/**
 * Analysis Results API Operations
 * CRUD operations for MRI analysis results
 */

import { createClient } from '@/lib/supabase/server';
import { AnalysisResult } from '@/types/database';
import { revalidatePath } from 'next/cache';

// ============================================================================
// TYPES
// ============================================================================

export interface AnalysesListResult {
  analyses: AnalysisResult[];
  total: number;
  error?: string;
}

export interface AnalysisResultWithDetails extends AnalysisResult {
  scan?: any;
  patient?: any;
}

export interface CreateAnalysisInput {
  scan_id: string;
  model_version: string;
  prediction: string;
  confidence: number;
  probabilities: Record<string, number>;
  volumetry?: Record<string, number>;
  features?: Record<string, number>;
  gradcam_image?: string;
  processing_time_ms?: number;
}

export interface OperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Default query limit to prevent memory overflow
const DEFAULT_LIMIT = 50;

// ============================================================================
// LIST ANALYSES
// ============================================================================

/**
 * Get list of analysis results with optional filtering
 */
export async function getAnalyses(options?: {
  scanId?: string;
  patientId?: string;
  prediction?: string;
  limit?: number;
  offset?: number;
}): Promise<AnalysesListResult> {
  try {
    const supabase = await createClient();
    const limit = options?.limit ?? DEFAULT_LIMIT;

    let query = supabase
      .from('analysis_results')
      .select(
        `
        *,
        mri_scans!inner(
          id,
          patient_id,
          scan_type,
          scan_date,
          patients!inner(
            patient_id,
            full_name
          )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filter by scan
    if (options?.scanId) {
      query = query.eq('scan_id', options.scanId);
    }

    // Filter by patient
    if (options?.patientId) {
      query = query.eq('mri_scans.patient_id', options.patientId);
    }

    // Filter by prediction
    if (options?.prediction) {
      query = query.eq('prediction', options.prediction);
    }

    // Apply offset for pagination
    if (options?.offset) {
      query = query.range(options.offset, options.offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Analyses API] List error:', error.message);
      return {
        analyses: [],
        total: 0,
        error: error.message,
      };
    }

    return {
      analyses: data || [],
      total: count || 0,
    };
  } catch (error: any) {
    console.error('[Analyses API] Unexpected list error:', error);
    return {
      analyses: [],
      total: 0,
      error: error.message || 'Failed to fetch analyses',
    };
  }
}

// ============================================================================
// GET SINGLE ANALYSIS
// ============================================================================

/**
 * Get analysis by ID with related data
 */
export async function getAnalysisById(id: string): Promise<{
  analysis: AnalysisResultWithDetails | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('analysis_results')
      .select(
        `
        *,
        mri_scans(
          id,
          patient_id,
          scan_type,
          scan_date,
          file_path,
          patients(
            patient_id,
            full_name,
            date_of_birth,
            gender
          )
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Analyses API] Get by ID error:', error.message);
      return {
        analysis: null,
        error: error.message,
      };
    }

    // Fetch user profile separately if analyzed_by is set
    if (data && data.analyzed_by) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, full_name, role')
        .eq('id', data.analyzed_by)
        .single();

      if (profile) {
        (data as any).user_profiles = profile;
      }
    }

    return {
      analysis: data,
    };
  } catch (error: any) {
    console.error('[Analyses API] Unexpected get error:', error);
    return {
      analysis: null,
      error: error.message || 'Failed to fetch analysis',
    };
  }
}

// ============================================================================
// CREATE ANALYSIS
// ============================================================================

/**
 * Create a new analysis result
 */
export async function createAnalysis(
  input: CreateAnalysisInput
): Promise<OperationResult> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    // Check user role (admins and researchers can create analyses)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'researcher'].includes(profile.role)) {
      return {
        success: false,
        error: 'Only administrators and researchers can create analyses',
      };
    }

    // Create analysis record
    const { data, error } = await supabase
      .from('analysis_results')
      .insert({
        ...input,
        analyzed_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[Analyses API] Create error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate pages
    revalidatePath('/dashboard/results');
    revalidatePath(`/dashboard/scans/${input.scan_id}`);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('[Analyses API] Unexpected create error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create analysis',
    };
  }
}

// ============================================================================
// ANALYSIS STATISTICS
// ============================================================================

/**
 * Get analysis statistics for dashboard
 * Uses optimized RPC function for single-query aggregation (including AVG)
 */
export async function getAnalysisStats(): Promise<{
  total: number;
  thisWeek: number;
  mciDetected: number;
  avgConfidence: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Use optimized RPC function that calculates AVG in SQL
    const { data, error } = await supabase.rpc('get_analysis_stats');

    if (error) {
      console.error('[Analyses API] Stats RPC error:', error.message);
      // Fallback to individual queries if RPC not available
      return await getAnalysisStatsFallback();
    }

    return {
      total: data?.total ?? 0,
      thisWeek: data?.this_week ?? 0,
      mciDetected: data?.mci_detected ?? 0,
      avgConfidence: data?.avg_confidence ?? 0,
    };
  } catch (error: any) {
    console.error('[Analyses API] Stats error:', error);
    return {
      total: 0,
      thisWeek: 0,
      mciDetected: 0,
      avgConfidence: 0,
      error: error.message,
    };
  }
}

/**
 * Fallback function for analysis stats (used if RPC not available)
 */
async function getAnalysisStatsFallback(): Promise<{
  total: number;
  thisWeek: number;
  mciDetected: number;
  avgConfidence: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get total count
    const { count: total } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true });

    // Get count for this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: thisWeek } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());

    // Get MCI detected count
    const { count: mciDetected } = await supabase
      .from('analysis_results')
      .select('*', { count: 'exact', head: true })
      .eq('prediction', 'Mild Cognitive Impairment');

    // Get average confidence - limit to prevent memory issues
    const { data: allAnalyses } = await supabase
      .from('analysis_results')
      .select('confidence')
      .limit(1000);

    const avgConfidence =
      allAnalyses && allAnalyses.length > 0
        ? allAnalyses.reduce((sum, a) => sum + a.confidence, 0) /
          allAnalyses.length
        : 0;

    return {
      total: total || 0,
      thisWeek: thisWeek || 0,
      mciDetected: mciDetected || 0,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
    };
  } catch (error: any) {
    console.error('[Analyses API] Stats fallback error:', error);
    return {
      total: 0,
      thisWeek: 0,
      mciDetected: 0,
      avgConfidence: 0,
      error: error.message,
    };
  }
}

// ============================================================================
// DELETE ANALYSIS
// ============================================================================

/**
 * Delete an analysis result (admin only)
 */
export async function deleteAnalysis(id: string): Promise<OperationResult> {
  try {
    const supabase = await createClient();

    // Get current user and check if admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return {
        success: false,
        error: 'Only administrators can delete analyses',
      };
    }

    // Delete analysis
    const { error } = await supabase
      .from('analysis_results')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Analyses API] Delete error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate pages
    revalidatePath('/dashboard/results');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[Analyses API] Unexpected delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete analysis',
    };
  }
}
