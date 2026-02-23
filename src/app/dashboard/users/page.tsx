/**
 * User Management Page
 * Admin-only page for managing users and roles
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getUsers, getUserStats } from '@/lib/api/users';
import { UserTable } from '@/components/users/UserTable';
import { AddUserButton } from '@/components/users/AddUserButton';
import { Users, Shield, Stethoscope, FlaskConical } from 'lucide-react';

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: string;
}

function StatCard({ title, value, icon: Icon, description, color = 'primary' }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}/10 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default async function UsersPage() {
  // Check authentication and authorization
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only admins can access this page
  if (user.profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch users and statistics
  const { users, error } = await getUsers();
  const stats = await getUserStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage user accounts and role assignments
            </p>
          </div>
        </div>
        <AddUserButton />
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={Users}
          description={`+${stats.activeThisWeek} this week`}
        />
        <StatCard
          title="Administrators"
          value={stats.admins}
          icon={Shield}
          description="System admins"
          color="purple"
        />
        <StatCard
          title="Clinicians"
          value={stats.clinicians}
          icon={Stethoscope}
          description="Medical professionals"
          color="blue"
        />
        <StatCard
          title="Researchers"
          value={stats.researchers}
          icon={FlaskConical}
          description="Research staff"
          color="green"
        />
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Admin Privileges Required</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              You can change user roles and delete accounts. Changes take effect immediately.
              Users cannot modify their own role or delete their own account.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          Failed to load users: {error}
        </div>
      )}

      {/* User Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">All Users</h2>
          <div className="text-sm text-muted-foreground">
            {users.length > 1 ? (
              'Click the edit icon to change a user\'s role'
            ) : (
              'Add more users to manage roles and permissions'
            )}
          </div>
        </div>

        {users.length === 1 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> You cannot edit or delete your own account. Create additional user accounts to see role management actions.
            </p>
          </div>
        )}

        <UserTable users={users} currentUserId={user.id} />
      </div>

      {/* Role Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold">Admin</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Full system access</li>
            <li>• Manage all patients and scans</li>
            <li>• Upload and analyze MRI scans</li>
            <li>• Generate reports</li>
            <li>• Manage user accounts</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Stethoscope className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold">Clinician</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• View patient cases</li>
            <li>• Review analysis results</li>
            <li>• Access patient records</li>
            <li>• View and download reports</li>
            <li>• Limited to assigned patients</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FlaskConical className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold">Researcher</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Access anonymized datasets</li>
            <li>• Run batch analyses</li>
            <li>• View model analytics</li>
            <li>• Export research data</li>
            <li>• Performance metrics access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
