'use server';

/**
 * User Management API
 * Server-side operations for user management (admin only)
 */

import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { UserProfile, UserRole } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface UserWithProfile {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  profile: UserProfile | null;
}

export interface UsersListResult {
  users: UserWithProfile[];
  total: number;
  error?: string;
}

export interface UserStatsResult {
  total: number;
  admins: number;
  clinicians: number;
  researchers: number;
  activeThisWeek: number;
}

export interface UpdateUserRoleInput {
  userId: string;
  newRole: UserRole;
}

export interface CreateUserInput {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  institution: string;
  contact_number: string;
}

export interface OperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

// ============================================================================
// GET USERS
// ============================================================================

/**
 * Get all users with their profiles
 * Admin only
 */
export async function getUsers(options?: {
  role?: UserRole;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<UsersListResult> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Build query for user profiles
    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' });

    // Apply filters
    if (options?.role) {
      query = query.eq('role', options.role);
    }

    if (options?.search) {
      query = query.or(
        `full_name.ilike.%${options.search}%,institution.ilike.%${options.search}%`
      );
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    // Order by created date
    query = query.order('created_at', { ascending: false });

    const { data: profiles, error: profileError, count } = await query;

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
      return { users: [], total: 0, error: profileError.message };
    }

    // Get auth users data using service role client
    const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return { users: [], total: 0, error: authError.message };
    }

    // Combine auth data with profiles
    const users: UserWithProfile[] = profiles.map(profile => {
      const authUser = authUsers.find(u => u.id === profile.id);
      return {
        id: profile.id,
        email: authUser?.email || 'Unknown',
        created_at: authUser?.created_at || profile.created_at,
        last_sign_in_at: authUser?.last_sign_in_at || null,
        profile: profile,
      };
    });

    return { users, total: count || 0 };
  } catch (error: any) {
    console.error('Error in getUsers:', error);
    return { users: [], total: 0, error: error.message };
  }
}

// ============================================================================
// GET USER STATISTICS
// ============================================================================

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(): Promise<UserStatsResult> {
  try {
    const supabase = await createClient();

    // Get total users
    const { count: total } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // Get users by role
    const { count: admins } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');

    const { count: clinicians } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'clinician');

    const { count: researchers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'researcher');

    // Get users created this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { count: activeThisWeek } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString());

    return {
      total: total || 0,
      admins: admins || 0,
      clinicians: clinicians || 0,
      researchers: researchers || 0,
      activeThisWeek: activeThisWeek || 0,
    };
  } catch (error: any) {
    console.error('Error in getUserStats:', error);
    return {
      total: 0,
      admins: 0,
      clinicians: 0,
      researchers: 0,
      activeThisWeek: 0,
    };
  }
}

// ============================================================================
// UPDATE USER ROLE
// ============================================================================

/**
 * Update a user's role
 * Admin only
 */
export async function updateUserRole(input: UpdateUserRoleInput): Promise<OperationResult> {
  try {
    const supabase = await createClient();

    // Update user profile
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: input.newRole, updated_at: new Date().toISOString() })
      .eq('id', input.userId);

    if (error) {
      console.error('Error updating user role:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (error: any) {
    console.error('Error in updateUserRole:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// DELETE USER
// ============================================================================

/**
 * Delete a user account
 * Admin only - Use with caution
 * Deletes both the user_profiles record and auth.users record
 */
export async function deleteUser(userId: string): Promise<OperationResult> {
  try {
    const supabaseAdmin = createServiceRoleClient();

    // Step 1: Delete user profile first (FK constraint doesn't have CASCADE)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      console.error('Error deleting user profile:', profileError);
      return { success: false, error: profileError.message };
    }

    // Step 2: Delete user from auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error('Error deleting auth user:', authError);
      return { success: false, error: authError.message };
    }

    revalidatePath('/dashboard/users');
    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteUser:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// GET USER BY ID
// ============================================================================

/**
 * Get a single user with profile by ID
 */
export async function getUserById(userId: string): Promise<{ user: UserWithProfile | null; error?: string }> {
  try {
    const supabase = await createClient();
    const supabaseAdmin = createServiceRoleClient();

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return { user: null, error: profileError.message };
    }

    // Get auth user using service role client
    const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError) {
      console.error('Error fetching auth user:', authError);
      return { user: null, error: authError.message };
    }

    const user: UserWithProfile = {
      id: userId,
      email: authUser.email || 'Unknown',
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at || null,
      profile: profile,
    };

    return { user };
  } catch (error: any) {
    console.error('Error in getUserById:', error);
    return { user: null, error: error.message };
  }
}

// ============================================================================
// CREATE USER
// ============================================================================

/**
 * Create a new user with auth account and profile
 * Admin only
 */
export async function createUser(input: CreateUserInput): Promise<OperationResult & { userId?: string }> {
  try {
    const supabaseAdmin = createServiceRoleClient();

    // Step 1: Create auth user (with email_confirm: true to skip verification)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.full_name,
        role: input.role,
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return { success: false, error: authError.message };
    }

    // Step 2: Create profile record
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        full_name: input.full_name,
        role: input.role,
        institution: input.institution,
        contact_number: input.contact_number,
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Rollback: delete auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: profileError.message };
    }

    revalidatePath('/dashboard/users');
    return { success: true, userId: authData.user.id };
  } catch (error: any) {
    console.error('Error in createUser:', error);
    return { success: false, error: error.message };
  }
}
