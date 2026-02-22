'use client';

/**
 * Authentication Context
 * Provides user authentication state and profile data throughout the application
 * Uses Supabase Auth with real-time session updates
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Failed to fetch profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('[AuthContext] Unexpected error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      setLoading(true);
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event);

      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook to access authentication context
 * Throws error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// ============================================================================
// ROLE CHECKING HOOKS
// ============================================================================

/**
 * Check if user has admin role
 */
export function useIsAdmin(): boolean {
  const { profile } = useAuth();
  return profile?.role === 'admin';
}

/**
 * Check if user has clinician role
 */
export function useIsClinician(): boolean {
  const { profile } = useAuth();
  return profile?.role === 'clinician';
}

/**
 * Check if user has researcher role
 */
export function useIsResearcher(): boolean {
  const { profile } = useAuth();
  return profile?.role === 'researcher';
}

/**
 * Check if user has any of the specified roles
 */
export function useHasAnyRole(roles: ('admin' | 'clinician' | 'researcher')[]): boolean {
  const { profile } = useAuth();
  if (!profile) return false;
  return roles.includes(profile.role);
}

/**
 * Check if user is authenticated
 */
export function useIsAuthenticated(): boolean {
  const { user } = useAuth();
  return user !== null;
}
