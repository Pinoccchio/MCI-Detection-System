'use server';

/**
 * Supabase Storage Upload Utilities
 * Handles file uploads to Supabase Storage buckets
 */

import { createClient } from '@/lib/supabase/server';

// ============================================================================
// TYPES
// ============================================================================

export interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  error?: string;
}

export interface UploadOptions {
  bucket: 'mri-scans' | 'reports' | 'avatars';
  path: string;
  file: File | Blob;
  contentType?: string;
  upsert?: boolean;
}

// ============================================================================
// UPLOAD FILE
// ============================================================================

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(options: UploadOptions): Promise<UploadResult> {
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

    // Convert File/Blob to ArrayBuffer for upload
    const fileBuffer = await options.file.arrayBuffer();

    // Upload to storage
    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(options.path, fileBuffer, {
        contentType: options.contentType || options.file.type,
        upsert: options.upsert || false,
      });

    if (error) {
      console.error('[Storage] Upload error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL for public buckets
    let publicUrl: string | undefined;
    if (options.bucket === 'avatars') {
      const { data: urlData } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);
      publicUrl = urlData.publicUrl;
    }

    return {
      success: true,
      path: data.path,
      url: publicUrl,
    };
  } catch (error: any) {
    console.error('[Storage] Unexpected upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload file',
    };
  }
}

// ============================================================================
// UPLOAD MRI SCAN
// ============================================================================

/**
 * Upload an MRI scan file (DICOM/NIfTI)
 */
export async function uploadMRIScan(
  patientId: string,
  scanId: string,
  file: File
): Promise<UploadResult> {
  // Generate file path: patient_id/scan_id/filename
  const extension = file.name.split('.').pop();
  const path = `${patientId}/${scanId}/scan.${extension}`;

  return uploadFile({
    bucket: 'mri-scans',
    path,
    file,
    contentType: file.type || 'application/octet-stream',
  });
}

// ============================================================================
// UPLOAD REPORT
// ============================================================================

/**
 * Upload a generated PDF report
 */
export async function uploadReport(
  analysisId: string,
  reportId: string,
  pdfBlob: Blob
): Promise<UploadResult> {
  // Generate file path: analysis_id/report_id.pdf
  const path = `${analysisId}/${reportId}.pdf`;

  return uploadFile({
    bucket: 'reports',
    path,
    file: pdfBlob,
    contentType: 'application/pdf',
  });
}

// ============================================================================
// UPLOAD AVATAR
// ============================================================================

/**
 * Upload user avatar image
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadResult> {
  // Generate file path: user_id/avatar.ext
  const extension = file.name.split('.').pop();
  const path = `${userId}/avatar.${extension}`;

  return uploadFile({
    bucket: 'avatars',
    path,
    file,
    contentType: file.type,
    upsert: true, // Allow replacing existing avatar
  });
}

// ============================================================================
// DELETE FILE
// ============================================================================

/**
 * Delete a file from storage
 */
export async function deleteFile(
  bucket: 'mri-scans' | 'reports' | 'avatars',
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      console.error('[Storage] Delete error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[Storage] Unexpected delete error:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete file',
    };
  }
}

// ============================================================================
// GET SIGNED URL
// ============================================================================

/**
 * Get a signed URL for private file access
 */
export async function getSignedUrl(
  bucket: 'mri-scans' | 'reports',
  path: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error('[Storage] Signed URL error:', error.message);
      return {
        error: error.message,
      };
    }

    return {
      url: data.signedUrl,
    };
  } catch (error: any) {
    console.error('[Storage] Unexpected signed URL error:', error);
    return {
      error: error.message || 'Failed to generate signed URL',
    };
  }
}

// ============================================================================
// LIST FILES
// ============================================================================

/**
 * List files in a storage bucket folder
 */
export async function listFiles(
  bucket: 'mri-scans' | 'reports' | 'avatars',
  path?: string
): Promise<{ files: any[]; error?: string }> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage.from(bucket).list(path, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      console.error('[Storage] List error:', error.message);
      return {
        files: [],
        error: error.message,
      };
    }

    return {
      files: data || [],
    };
  } catch (error: any) {
    console.error('[Storage] Unexpected list error:', error);
    return {
      files: [],
      error: error.message || 'Failed to list files',
    };
  }
}
