'use server';

/**
 * MRI Scan API Operations
 * CRUD operations for MRI scan management
 */

import { createClient } from '@/lib/supabase/server';
import { MRIScan, CreateMRIScanInput, UpdateMRIScanInput } from '@/types/database';
import { revalidatePath } from 'next/cache';

// ============================================================================
// TYPES
// ============================================================================

export interface ScansListResult {
  scans: MRIScan[];
  total: number;
  error?: string;
}

export interface ScanResult {
  scan: MRIScan | null;
  error?: string;
}

export interface OperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

// ============================================================================
// LIST SCANS
// ============================================================================

// Default query limit to prevent memory overflow
const DEFAULT_LIMIT = 50;

/**
 * Get list of MRI scans with optional filtering
 */
export async function getScans(options?: {
  patientId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ScansListResult> {
  try {
    const supabase = await createClient();
    const limit = options?.limit ?? DEFAULT_LIMIT;

    let query = supabase
      .from('mri_scans')
      .select('*, patients(patient_id, full_name)', { count: 'exact' })
      .order('scan_date', { ascending: false })
      .limit(limit);

    // Filter by patient
    if (options?.patientId) {
      query = query.eq('patient_id', options.patientId);
    }

    // Filter by status
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    // Apply offset for pagination
    if (options?.offset) {
      query = query.range(options.offset, options.offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Scans API] List error:', error.message);
      return {
        scans: [],
        total: 0,
        error: error.message,
      };
    }

    return {
      scans: data || [],
      total: count || 0,
    };
  } catch (error: any) {
    console.error('[Scans API] Unexpected list error:', error);
    return {
      scans: [],
      total: 0,
      error: error.message || 'Failed to fetch scans',
    };
  }
}

// ============================================================================
// GET SINGLE SCAN
// ============================================================================

/**
 * Get scan by ID
 */
export async function getScanById(id: string): Promise<ScanResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('mri_scans')
      .select('*, patients(patient_id, full_name, date_of_birth, gender)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Scans API] Get by ID error:', error.message);
      return {
        scan: null,
        error: error.message,
      };
    }

    return {
      scan: data,
    };
  } catch (error: any) {
    console.error('[Scans API] Unexpected get error:', error);
    return {
      scan: null,
      error: error.message || 'Failed to fetch scan',
    };
  }
}

// ============================================================================
// CREATE SCAN
// ============================================================================

/**
 * Create a new MRI scan record
 */
export async function createScan(input: CreateMRIScanInput): Promise<OperationResult> {
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

    // Check user role (only admins can create scans)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return {
        success: false,
        error: 'Only administrators can upload scans',
      };
    }

    // Create scan record
    const { data, error } = await supabase
      .from('mri_scans')
      .insert({
        ...input,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[Scans API] Create error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate pages
    revalidatePath('/dashboard/scans');
    revalidatePath(`/dashboard/patients/${input.patient_id}`);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('[Scans API] Unexpected create error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create scan',
    };
  }
}

// ============================================================================
// UPDATE SCAN
// ============================================================================

/**
 * Update an existing scan record
 */
export async function updateScan(
  id: string,
  updates: UpdateMRIScanInput
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

    // Check user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return {
        success: false,
        error: 'Only administrators can update scans',
      };
    }

    // Update scan
    const { data, error } = await supabase
      .from('mri_scans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Scans API] Update error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate pages
    revalidatePath('/dashboard/scans');
    revalidatePath(`/dashboard/scans/${id}`);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('[Scans API] Unexpected update error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update scan',
    };
  }
}

// ============================================================================
// DELETE SCAN
// ============================================================================

/**
 * Delete a scan record
 */
export async function deleteScan(id: string): Promise<OperationResult> {
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
        error: 'Only administrators can delete scans',
      };
    }

    // Delete scan
    const { error } = await supabase.from('mri_scans').delete().eq('id', id);

    if (error) {
      console.error('[Scans API] Delete error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate pages
    revalidatePath('/dashboard/scans');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[Scans API] Unexpected delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete scan',
    };
  }
}

// ============================================================================
// SCAN STATISTICS
// ============================================================================

/**
 * Get scan statistics for dashboard
 * Uses optimized RPC function for single-query aggregation
 */
export async function getScanStats(): Promise<{
  total: number;
  thisWeek: number;
  completed: number;
  pending: number;
  failed: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Use optimized RPC function
    const { data, error } = await supabase.rpc('get_scan_stats');

    if (error) {
      // RPC not available, use fallback (this is expected if RPC function not created)
      return await getScanStatsFallback();
    }

    return {
      total: data?.total ?? 0,
      thisWeek: data?.this_week ?? 0,
      completed: data?.completed ?? 0,
      pending: data?.pending ?? 0,
      failed: data?.failed ?? 0,
    };
  } catch (error: any) {
    console.error('[Scans API] Stats error:', error);
    return {
      total: 0,
      thisWeek: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      error: error.message,
    };
  }
}

/**
 * Fallback function for scan stats (used if RPC not available)
 */
async function getScanStatsFallback(): Promise<{
  total: number;
  thisWeek: number;
  completed: number;
  pending: number;
  failed: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get total count
    const { count: total } = await supabase
      .from('mri_scans')
      .select('*', { count: 'exact', head: true });

    // Get count for this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: thisWeek } = await supabase
      .from('mri_scans')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString());

    // Get completed count
    const { count: completed } = await supabase
      .from('mri_scans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    // Get pending count
    const { count: pending } = await supabase
      .from('mri_scans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get failed/error count
    const { count: failed } = await supabase
      .from('mri_scans')
      .select('*', { count: 'exact', head: true })
      .in('status', ['failed', 'error']);

    return {
      total: total || 0,
      thisWeek: thisWeek || 0,
      completed: completed || 0,
      pending: pending || 0,
      failed: failed || 0,
    };
  } catch (error: any) {
    console.error('[Scans API] Stats fallback error:', error);
    return {
      total: 0,
      thisWeek: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      error: error.message,
    };
  }
}

// ============================================================================
// GET SCAN WITH ANALYSES
// ============================================================================

/**
 * Get scan with analysis results
 */
export async function getScanWithAnalyses(id: string): Promise<{
  scan: MRIScan | null;
  analyses: any[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get scan
    const { data: scan, error: scanError } = await supabase
      .from('mri_scans')
      .select('*, patients(patient_id, full_name, date_of_birth, gender)')
      .eq('id', id)
      .single();

    if (scanError) {
      return {
        scan: null,
        analyses: [],
        error: scanError.message,
      };
    }

    // Get analyses for this scan
    const { data: analyses, error: analysesError } = await supabase
      .from('analysis_results')
      .select('*')
      .eq('scan_id', id)
      .order('created_at', { ascending: false });

    if (analysesError) {
      console.error('[Scans API] Analyses error:', analysesError.message);
    }

    return {
      scan,
      analyses: analyses || [],
    };
  } catch (error: any) {
    console.error('[Scans API] Get with analyses error:', error);
    return {
      scan: null,
      analyses: [],
      error: error.message,
    };
  }
}
