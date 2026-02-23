'use server';

/**
 * Profile Page Server Actions
 * Handles profile update operations
 */

import { updateProfile, UpdateProfileInput } from '@/lib/api/users';

export async function saveProfile(input: UpdateProfileInput) {
  return await updateProfile(input);
}
