'use client';

/**
 * Dashboard Header Component
 * Displays user information, notifications, and quick actions
 */

import { LogOut, User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth/actions';
import { useState } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface DashboardHeaderProps {
  user: {
    id: string;
    email: string;
    profile: {
      full_name: string;
      role: 'admin' | 'clinician' | 'researcher';
      institution: string | null;
      department: string | null;
      avatar_url: string | null;
    } | null;
  };
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    // Note: signOut() redirects to '/' on success, so code after this won't execute
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'clinician':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'researcher':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
      {/* Left Side - Greeting */}
      <div>
        <h2 className="text-lg font-semibold">
          Welcome back, {user.profile?.full_name || user.email}
        </h2>
        <div className="flex items-center gap-3 mt-0.5">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getRoleBadgeColor(
              user.profile?.role
            )}`}
          >
            {user.profile?.role || 'User'}
          </span>
          {user.profile?.institution && (
            <span className="text-sm text-muted-foreground">
              {user.profile.institution}
            </span>
          )}
          {user.profile?.department && (
            <span className="text-sm text-muted-foreground">
              • {user.profile.department}
            </span>
          )}
        </div>
      </div>

      {/* Right Side - Actions */}
      <div className="flex items-center gap-2">
        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm">
              {user.profile?.avatar_url ? (
                <img
                  src={user.profile.avatar_url}
                  alt={user.profile.full_name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                getInitials(user.profile?.full_name || user.email)
              )}
            </div>

            {/* User Info */}
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium leading-none">
                {user.profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {user.email}
              </p>
            </div>

            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />

              {/* Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                <div className="p-3 border-b border-border">
                  <p className="text-sm font-medium">
                    {user.profile?.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user.email}
                  </p>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      router.push('/dashboard/profile');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Your Profile</span>
                  </button>
                </div>

                <div className="p-1 border-t border-border">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
