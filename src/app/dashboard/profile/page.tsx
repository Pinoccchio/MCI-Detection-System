/**
 * Profile Page
 * Allows users to view and edit their own profile information
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { ProfileForm } from './ProfileForm';
import { PasswordChangeForm } from './PasswordChangeForm';
import { UserCircle, Mail, Shield, Calendar } from 'lucide-react';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getRoleBadgeColor(role?: string) {
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
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default async function ProfilePage() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  const profile = user.profile;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <UserCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your profile information
          </p>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(profile.full_name)
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile.full_name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${getRoleBadgeColor(
                  profile.role
                )}`}
              >
                {profile.role}
              </span>
              {profile.institution && (
                <span className="text-muted-foreground">
                  {profile.institution}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Member since {formatDate(profile.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information Form */}
        <ProfileForm
          initialData={{
            full_name: profile.full_name,
            institution: profile.institution || '',
            contact_number: profile.contact_number || '',
            bio: profile.bio || '',
          }}
        />

        {/* Password Change Form */}
        <PasswordChangeForm />
      </div>

      {/* Account Information (Read-only) */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This information is managed by the system and cannot be changed here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email Address
              </label>
              <p className="text-foreground mt-1">{user.email}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Role
              </label>
              <p className="text-foreground mt-1 capitalize">{profile.role}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Contact an administrator to change your role
              </p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Member Since
              </label>
              <p className="text-foreground mt-1">
                {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <UserCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">
              Profile Information
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Your profile information is used throughout the system to identify you.
              Keep your contact information up to date to receive important notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
