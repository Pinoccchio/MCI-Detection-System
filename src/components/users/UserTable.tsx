'use client';

/**
 * User Table Component
 * Displays users with role management for admins
 */

import { useState } from 'react';
import { UserWithProfile } from '@/lib/api/users';
import { formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { changeUserRole, removeUser } from '@/app/dashboard/users/actions';
import {
  User,
  Shield,
  Stethoscope,
  FlaskConical,
  MoreVertical,
  Trash2,
  Edit,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface UserTableProps {
  users: UserWithProfile[];
  currentUserId: string;
}

// ============================================================================
// ROLE BADGE
// ============================================================================

function RoleBadge({ role }: { role: string }) {
  const roleConfig = {
    admin: {
      icon: Shield,
      label: 'Admin',
      className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    },
    clinician: {
      icon: Stethoscope,
      label: 'Clinician',
      className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    },
    researcher: {
      icon: FlaskConical,
      label: 'Researcher',
      className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig] || {
    icon: User,
    label: role,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function UserTable({ users, currentUserId }: UserTableProps) {
  const router = useRouter();
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithProfile | null>(null);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setIsUpdating(true);
      setError(null);

      const result = await changeUserRole(
        userId,
        newRole as 'admin' | 'clinician' | 'researcher'
      );

      if (result.success) {
        setEditingUserId(null);
        router.refresh();
      } else {
        setError(result.error || 'Failed to update role');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsUpdating(true);
      setError(null);

      const result = await removeUser(userToDelete.id);

      if (result.success) {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        router.refresh();
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Last Sign In
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.profile?.full_name}</div>
                          {user.id === currentUserId && (
                            <span className="text-xs text-muted-foreground">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {editingUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-2 py-1 border border-border rounded-md text-sm"
                            disabled={isUpdating}
                          >
                            <option value="admin">Admin</option>
                            <option value="clinician">Clinician</option>
                            <option value="researcher">Researcher</option>
                          </select>
                          <Button
                            size="sm"
                            onClick={() => handleRoleChange(user.id, selectedRole)}
                            disabled={isUpdating}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingUserId(null)}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <RoleBadge role={user.profile?.role || 'unknown'} />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {user.profile?.institution || (
                          <span className="text-muted-foreground">Not specified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-muted-foreground">
                        {user.last_sign_in_at ? (
                          formatDateTime(user.last_sign_in_at)
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {user.id !== currentUserId ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingUserId(user.id);
                                setSelectedRole(user.profile?.role || 'clinician');
                              }}
                              disabled={isUpdating}
                              title="Change Role"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setUserToDelete(user);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={isUpdating}
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      {users.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {users.length} user{users.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        variant="destructive"
        confirmText="Delete User"
        cancelText="Cancel"
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setUserToDelete(null);
        }}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-destructive mb-1">
                Are you sure you want to delete {userToDelete?.profile?.full_name || userToDelete?.email}?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">This will permanently delete:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                User account and authentication
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                User profile information
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                All access permissions
              </li>
            </ul>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}
