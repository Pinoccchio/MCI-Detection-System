'use server';

/**
 * Patient API Operations
 * CRUD operations for patient management
 */

import { createClient } from '@/lib/supabase/server';
import { Patient, CreatePatientInput, UpdatePatientInput } from '@/types/database';
import { revalidatePath } from 'next/cache';

// ============================================================================
// TYPES
// ============================================================================

export interface PatientsListResult {
  patients: Patient[];
  total: number;
  error?: string;
}

export interface PatientResult {
  patient: Patient | null;
  error?: string;
}

export interface OperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Default query limit to prevent memory overflow
const DEFAULT_LIMIT = 50;

// ============================================================================
// LIST PATIENTS
// ============================================================================

/**
 * Get list of patients with optional filtering and pagination
 */
export async function getPatients(options?: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<PatientsListResult> {
  try {
    const supabase = await createClient();
    const limit = options?.limit ?? DEFAULT_LIMIT;

    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    // Apply search filter
    if (options?.search) {
      query = query.or(
        `full_name.ilike.%${options.search}%,patient_id.ilike.%${options.search}%,contact_email.ilike.%${options.search}%`
      );
    }

    // Apply offset for pagination
    if (options?.offset) {
      query = query.range(options.offset, options.offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Patients API] List error:', error.message);
      return {
        patients: [],
        total: 0,
        error: error.message,
      };
    }

    return {
      patients: data || [],
      total: count || 0,
    };
  } catch (error: any) {
    console.error('[Patients API] Unexpected list error:', error);
    return {
      patients: [],
      total: 0,
      error: error.message || 'Failed to fetch patients',
    };
  }
}

// ============================================================================
// GET SINGLE PATIENT
// ============================================================================

/**
 * Get patient by ID with related data
 */
export async function getPatientById(id: string): Promise<PatientResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Patients API] Get by ID error:', error.message);
      return {
        patient: null,
        error: error.message,
      };
    }

    return {
      patient: data,
    };
  } catch (error: any) {
    console.error('[Patients API] Unexpected get error:', error);
    return {
      patient: null,
      error: error.message || 'Failed to fetch patient',
    };
  }
}

/**
 * Get patient by patient_id (medical record ID)
 */
export async function getPatientByMedicalId(patientId: string): Promise<PatientResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id', patientId)
      .single();

    if (error) {
      console.error('[Patients API] Get by medical ID error:', error.message);
      return {
        patient: null,
        error: error.message,
      };
    }

    return {
      patient: data,
    };
  } catch (error: any) {
    console.error('[Patients API] Unexpected get error:', error);
    return {
      patient: null,
      error: error.message || 'Failed to fetch patient',
    };
  }
}

// ============================================================================
// CREATE PATIENT
// ============================================================================

/**
 * Create a new patient record
 */
export async function createPatient(input: CreatePatientInput): Promise<OperationResult> {
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

    // Check if patient_id already exists
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_id', input.patient_id)
      .single();

    if (existing) {
      return {
        success: false,
        error: `Patient ID ${input.patient_id} already exists`,
      };
    }

    // Create patient
    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...input,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[Patients API] Create error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate patient pages
    revalidatePath('/dashboard/patients');

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('[Patients API] Unexpected create error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create patient',
    };
  }
}

// ============================================================================
// UPDATE PATIENT
// ============================================================================

/**
 * Update an existing patient record
 */
export async function updatePatient(
  id: string,
  updates: UpdatePatientInput
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

    // Note: patient_id is not updatable for data integrity
    // If you need to change a patient ID, create a new patient record

    // Update patient
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Patients API] Update error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate patient pages
    revalidatePath('/dashboard/patients');
    revalidatePath(`/dashboard/patients/${id}`);

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('[Patients API] Unexpected update error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update patient',
    };
  }
}

// ============================================================================
// DELETE PATIENT
// ============================================================================

/**
 * Delete a patient record
 * Note: This will cascade delete all related scans and analyses
 */
export async function deletePatient(id: string): Promise<OperationResult> {
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

    // Check user role (only admins can delete)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return {
        success: false,
        error: 'Only administrators can delete patients',
      };
    }

    // Delete patient
    const { error } = await supabase.from('patients').delete().eq('id', id);

    if (error) {
      console.error('[Patients API] Delete error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate patient pages
    revalidatePath('/dashboard/patients');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[Patients API] Unexpected delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete patient',
    };
  }
}

// ============================================================================
// PATIENT STATISTICS
// ============================================================================

/**
 * Get patient statistics for dashboard
 * Uses optimized RPC function for single-query aggregation
 */
export async function getPatientStats(): Promise<{
  total: number;
  thisMonth: number;
  withScans: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Use optimized RPC function
    const { data, error } = await supabase.rpc('get_patient_stats');

    if (error) {
      console.error('[Patients API] Stats RPC error:', error.message);
      // Fallback to individual queries if RPC not available
      return await getPatientStatsFallback();
    }

    return {
      total: data?.total ?? 0,
      thisMonth: data?.this_month ?? 0,
      withScans: data?.with_scans ?? 0,
    };
  } catch (error: any) {
    console.error('[Patients API] Stats error:', error);
    return {
      total: 0,
      thisMonth: 0,
      withScans: 0,
      error: error.message,
    };
  }
}

/**
 * Fallback function for patient stats (used if RPC not available)
 */
async function getPatientStatsFallback(): Promise<{
  total: number;
  thisMonth: number;
  withScans: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get total count
    const { count: total } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true });

    // Get count for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonth } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Get patients with scans
    const { data: scanCounts } = await supabase
      .from('patient_scan_summary')
      .select('id')
      .gt('total_scans', 0);

    return {
      total: total || 0,
      thisMonth: thisMonth || 0,
      withScans: scanCounts?.length || 0,
    };
  } catch (error: any) {
    console.error('[Patients API] Stats fallback error:', error);
    return {
      total: 0,
      thisMonth: 0,
      withScans: 0,
      error: error.message,
    };
  }
}

// ============================================================================
// PATIENT WITH SCANS
// ============================================================================

/**
 * Get patient with their scans
 */
export async function getPatientWithScans(id: string): Promise<{
  patient: Patient | null;
  scans: any[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get patient
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (patientError) {
      return {
        patient: null,
        scans: [],
        error: patientError.message,
      };
    }

    // Get scans for this patient
    const { data: scans, error: scansError } = await supabase
      .from('mri_scans')
      .select('*')
      .eq('patient_id', id)
      .order('scan_date', { ascending: false });

    if (scansError) {
      console.error('[Patients API] Scans error:', scansError.message);
    }

    return {
      patient,
      scans: scans || [],
    };
  } catch (error: any) {
    console.error('[Patients API] Get with scans error:', error);
    return {
      patient: null,
      scans: [],
      error: error.message,
    };
  }
}
