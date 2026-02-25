'use server';

/**
 * Server Actions for Scan Detail Page
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Get a signed URL for accessing a scan file
 */
export async function getScanFileUrl(
  filePath: string
): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: 'Not authenticated' };
    }

    // Generate signed URL (1 hour expiry)
    const { data, error } = await supabase.storage
      .from('mri-scans')
      .createSignedUrl(filePath, 3600);

    if (error) {
      console.error('[Scan Actions] Signed URL error:', error.message);
      return { error: error.message };
    }

    return { url: data.signedUrl };
  } catch (error: any) {
    console.error('[Scan Actions] Unexpected error:', error);
    return { error: error.message || 'Failed to get file URL' };
  }
}
