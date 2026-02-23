'use server';

/**
 * Reports API Operations
 * CRUD operations for report management
 */

import { createClient } from '@/lib/supabase/server';
import { Report } from '@/types/database';
import { revalidatePath } from 'next/cache';

// ============================================================================
// TYPES
// ============================================================================

export interface ReportsListResult {
  reports: any[];
  total: number;
  error?: string;
}

export interface ReportResult {
  report: any | null;
  error?: string;
}

export interface CreateReportInput {
  analysis_id: string;
  report_type: 'clinical' | 'research';
  title: string;
  pdf_path?: string;
  file_size?: number;
}

export interface OperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

// ============================================================================
// LIST REPORTS
// ============================================================================

/**
 * Get list of reports with optional filtering
 */
export async function getReports(options?: {
  analysisId?: string;
  reportType?: string;
  limit?: number;
  offset?: number;
}): Promise<ReportsListResult> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('reports')
      .select(
        `
        *,
        analysis_results!inner(
          id,
          prediction,
          confidence,
          scan_id,
          mri_scans!inner(
            patient_id,
            scan_type,
            patients!inner(
              patient_id,
              full_name
            )
          )
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    // Filter by analysis
    if (options?.analysisId) {
      query = query.eq('analysis_id', options.analysisId);
    }

    // Filter by type
    if (options?.reportType) {
      query = query.eq('report_type', options.reportType);
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[Reports API] List error:', error.message);
      return {
        reports: [],
        total: 0,
        error: error.message,
      };
    }

    // Fetch user profiles separately for each report
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(r => r.generated_by).filter(Boolean))];

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, role')
          .in('id', userIds);

        // Map profiles to reports
        const reportsWithProfiles = data.map(report => ({
          ...report,
          user_profiles: profiles?.find(p => p.id === report.generated_by) || null
        }));

        return {
          reports: reportsWithProfiles,
          total: count || 0,
        };
      }
    }

    return {
      reports: data || [],
      total: count || 0,
    };
  } catch (error: any) {
    console.error('[Reports API] Unexpected list error:', error);
    return {
      reports: [],
      total: 0,
      error: error.message || 'Failed to fetch reports',
    };
  }
}

// ============================================================================
// GET SINGLE REPORT
// ============================================================================

/**
 * Get report by ID with related data
 */
export async function getReportById(id: string): Promise<ReportResult> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('reports')
      .select(
        `
        *,
        analysis_results(
          id,
          prediction,
          confidence,
          probabilities,
          volumetry,
          features,
          model_version,
          created_at,
          mri_scans(
            id,
            scan_type,
            scan_date,
            patient_id,
            patients(
              patient_id,
              full_name,
              date_of_birth,
              gender
            )
          )
        )
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('[Reports API] Get by ID error:', error.message);
      return {
        report: null,
        error: error.message,
      };
    }

    // Fetch user profile separately
    if (data && data.generated_by) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, full_name, role, institution')
        .eq('id', data.generated_by)
        .single();

      return {
        report: {
          ...data,
          user_profiles: profile
        },
      };
    }

    return {
      report: data,
    };
  } catch (error: any) {
    console.error('[Reports API] Unexpected get error:', error);
    return {
      report: null,
      error: error.message || 'Failed to fetch report',
    };
  }
}

// ============================================================================
// CREATE REPORT
// ============================================================================

/**
 * Create a new report record with server-side PDF generation
 */
export async function createReport(
  input: CreateReportInput
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

    // Check user role (admins and clinicians can create reports)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'clinician'].includes(profile.role)) {
      return {
        success: false,
        error: 'Only administrators and clinicians can create reports',
      };
    }

    // Generate PDF using server-side generator (if not provided)
    let pdfPath = input.pdf_path;
    let fileSize = input.file_size;

    if (!pdfPath) {
      // Import server generator dynamically to avoid client-side imports
      const { generateAndUploadPDF } = await import('@/lib/pdf/server-generator');

      const pdfResult = await generateAndUploadPDF(input.analysis_id, input.report_type);

      if (!pdfResult.success) {
        return {
          success: false,
          error: `PDF generation failed: ${pdfResult.error}`,
        };
      }

      pdfPath = pdfResult.filePath;
      fileSize = pdfResult.fileSize;
    }

    // Create report record
    console.log('[Reports API] Attempting to create report:', {
      analysis_id: input.analysis_id,
      report_type: input.report_type,
      title: input.title,
      pdf_path: pdfPath,
      file_size: fileSize,
      generated_by: user.id,
    });

    const { data, error } = await supabase
      .from('reports')
      .insert({
        analysis_id: input.analysis_id,
        report_type: input.report_type,
        title: input.title,
        pdf_path: pdfPath,
        file_size: fileSize,
        generated_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[Reports API] Create error:', error);
      console.error('[Reports API] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return {
        success: false,
        error: `Database insert failed: ${error.message}${error.hint ? ` (${error.hint})` : ''}`,
      };
    }

    console.log('[Reports API] Report created successfully:', data);

    // Revalidate pages
    revalidatePath('/dashboard/reports');

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('[Reports API] Unexpected create error:', error);
    return {
      success: false,
      error: error.message || 'Failed to create report',
    };
  }
}

// ============================================================================
// DELETE REPORT
// ============================================================================

/**
 * Delete a report (admin only)
 */
export async function deleteReport(id: string): Promise<OperationResult> {
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
        error: 'Only administrators can delete reports',
      };
    }

    // Delete report
    const { error } = await supabase.from('reports').delete().eq('id', id);

    if (error) {
      console.error('[Reports API] Delete error:', error.message);
      // Still revalidate to ensure UI is in sync
      revalidatePath('/dashboard/reports');
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate pages after successful delete
    revalidatePath('/dashboard/reports');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[Reports API] Unexpected delete error:', error);
    // Always revalidate on errors to keep UI in sync
    revalidatePath('/dashboard/reports');
    return {
      success: false,
      error: error.message || 'Failed to delete report',
    };
  }
}

// ============================================================================
// REPORT STATISTICS
// ============================================================================

/**
 * Get report statistics for dashboard
 */
export async function getReportStats(): Promise<{
  total: number;
  thisMonth: number;
  clinical: number;
  research: number;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get total count
    const { count: total } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    // Get count for this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonth } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Get clinical count
    const { count: clinical } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('report_type', 'clinical');

    // Get research count
    const { count: research } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('report_type', 'research');

    return {
      total: total || 0,
      thisMonth: thisMonth || 0,
      clinical: clinical || 0,
      research: research || 0,
    };
  } catch (error: any) {
    console.error('[Reports API] Stats error:', error);
    return {
      total: 0,
      thisMonth: 0,
      clinical: 0,
      research: 0,
      error: error.message,
    };
  }
}
