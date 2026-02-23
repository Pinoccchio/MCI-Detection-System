'use server';

/**
 * Profile Page Server Actions
 * Handles profile update operations
 */

import { updateProfile, UpdateProfileInput } from '@/lib/api/users';
import { createClient } from '@/lib/supabase/server';

export async function saveProfile(input: UpdateProfileInput) {
  return await updateProfile(input);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Password change error:', error);
    return { success: false, error: error.message || 'Failed to change password' };
  }
}
