'use server';

/**
 * User Management Server Actions
 * Wrapper actions for user management operations
 */

import { updateUserRole, deleteUser, createUser, CreateUserInput } from '@/lib/api/users';
import { UserRole } from '@/types/database';

export async function changeUserRole(userId: string, newRole: UserRole) {
  return await updateUserRole({ userId, newRole });
}

export async function removeUser(userId: string) {
  return await deleteUser(userId);
}

export async function addUser(input: CreateUserInput) {
  return await createUser(input);
}
