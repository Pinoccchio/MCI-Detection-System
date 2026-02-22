'use server';

/**
 * Authentication Server Actions
 * Handles user authentication, registration, and session management
 * Uses Supabase Auth for secure authentication
 */

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { UserRole, CreateUserProfileInput } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface SignInResult {
  success: boolean;
  error?: string;
}

export interface SignUpResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

export interface UserWithProfile {
  id: string;
  email: string;
  profile: {
    full_name: string;
    role: UserRole;
    institution: string | null;
    department: string | null;
    contact_number: string | null;
    bio: string | null;
    avatar_url: string | null;
  } | null;
}

// ============================================================================
// SIGN IN
// ============================================================================

/**
 * Sign in an existing user with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[Auth] Sign in error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: 'Authentication failed. Please try again.',
    };
  }

  // Revalidate all pages to update auth state
  revalidatePath('/', 'layout');

  // Return success - the client will handle the redirect
  // This ensures cookies are properly set before navigation
  return {
    success: true,
  };
}

// ============================================================================
// SIGN UP
// ============================================================================

/**
 * Register a new user and create their profile
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  institution?: string,
  contactNumber?: string,
  department?: string
): Promise<SignUpResult> {
  try {
    const supabase = await createClient();

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error('[Auth] Sign up auth error:', authError.message);
      return {
        success: false,
        error: authError.message,
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account.',
      };
    }

    // Step 2: Create user profile in public.user_profiles
    const profileData: CreateUserProfileInput = {
      id: authData.user.id,
      full_name: fullName,
      role,
      institution: institution || null,
      contact_number: contactNumber || null,
      department: department || null,
    };

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      console.error('[Auth] Profile creation error:', profileError.message);

      // If profile creation fails, we should clean up the auth user
      // However, Supabase doesn't allow deleting users from client side
      // This would need to be handled by an admin or trigger

      return {
        success: false,
        error: `Account created but profile setup failed: ${profileError.message}`,
      };
    }

    // Check if email confirmation is required
    const requiresConfirmation = authData.user.identities?.length === 0;

    if (requiresConfirmation) {
      return {
        success: true,
        requiresEmailConfirmation: true,
      };
    }

    // Success - user is created and can sign in
    return {
      success: true,
      requiresEmailConfirmation: false,
    };
  } catch (error: any) {
    console.error('[Auth] Unexpected sign up error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// SIGN OUT
// ============================================================================

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();

  await supabase.auth.signOut();

  // Revalidate all pages to update auth state
  revalidatePath('/', 'layout');

  // Redirect to home page - this will throw NEXT_REDIRECT
  // Do NOT wrap this in try-catch as it's a control flow mechanism
  redirect('/');
}

// ============================================================================
// GET CURRENT USER
// ============================================================================

/**
 * Get the currently authenticated user with their profile
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<UserWithProfile | null> {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('full_name, role, institution, department, contact_number, bio, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[Auth] Failed to fetch user profile:', profileError.message);
      // Return user without profile data
      return {
        id: user.id,
        email: user.email || '',
        profile: null,
      };
    }

    return {
      id: user.id,
      email: user.email || '',
      profile: profile || null,
    };
  } catch (error) {
    console.error('[Auth] Get current user error:', error);
    return null;
  }
}

// ============================================================================
// CHECK USER ROLE
// ============================================================================

/**
 * Check if the current user has a specific role
 */
export async function checkUserRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    return false;
  }

  return user.profile.role === requiredRole;
}

/**
 * Check if the current user has one of the specified roles
 */
export async function checkUserHasAnyRole(allowedRoles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    return false;
  }

  return allowedRoles.includes(user.profile.role);
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<SignInResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      console.error('[Auth] Password reset error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[Auth] Unexpected password reset error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Update password (requires user to be authenticated)
 */
export async function updatePassword(newPassword: string): Promise<SignInResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error('[Auth] Password update error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[Auth] Unexpected password update error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// UPDATE PROFILE
// ============================================================================

/**
 * Update the current user's profile
 */
export async function updateProfile(updates: {
  full_name?: string;
  institution?: string;
  department?: string;
  contact_number?: string;
  bio?: string;
  avatar_url?: string;
}): Promise<SignInResult> {
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

    // Update profile
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      console.error('[Auth] Profile update error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate to show updated profile
    revalidatePath('/', 'layout');

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('[Auth] Unexpected profile update error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
}
