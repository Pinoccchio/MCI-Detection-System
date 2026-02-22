/**
 * Settings Page
 * User preferences and system configuration
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { Settings as SettingsIcon, User, Bell, Lock, Palette, Globe } from 'lucide-react';

export default async function SettingsPage() {
  // Check authentication
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account preferences and system configuration
          </p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="mt-1 text-foreground">{user.profile.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1 text-foreground">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="mt-1">
                <span className="px-2 py-1 text-xs rounded-full capitalize bg-primary/20 text-primary">
                  {user.profile.role}
                </span>
              </p>
            </div>
            {user.profile.institution && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Institution</label>
                <p className="mt-1 text-foreground">{user.profile.institution}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">Analysis Complete</p>
                <p className="text-sm text-muted-foreground">Get notified when analysis finishes</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">Report Generated</p>
                <p className="text-sm text-muted-foreground">Notify when reports are ready</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <p className="font-medium">System Updates</p>
                <p className="text-sm text-muted-foreground">Get updates about new features</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold">Security</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <button className="mt-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
                Change Password
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Two-Factor Authentication</label>
              <div className="mt-2 p-3 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground">Not enabled</p>
                <button className="mt-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Enable 2FA
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Active Sessions</label>
              <div className="mt-2 p-3 border border-border rounded-lg">
                <p className="text-sm">1 active session</p>
                <p className="text-xs text-muted-foreground mt-1">Last login: Just now</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Theme</label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button className="p-3 border-2 border-primary rounded-lg hover:bg-muted transition-colors">
                  <div className="text-center">
                    <div className="h-8 w-8 bg-white border border-border rounded mx-auto mb-1" />
                    <p className="text-xs">Light</p>
                  </div>
                </button>
                <button className="p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-center">
                    <div className="h-8 w-8 bg-gray-900 rounded mx-auto mb-1" />
                    <p className="text-xs">Dark</p>
                  </div>
                </button>
                <button className="p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                  <div className="text-center">
                    <div className="h-8 w-8 bg-gradient-to-r from-white to-gray-900 rounded mx-auto mb-1" />
                    <p className="text-xs">Auto</p>
                  </div>
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Sidebar</label>
              <div className="mt-2 p-3 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Collapsed by default</span>
                  <input type="checkbox" className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Settings (Admin Only) */}
        {user.profile.role === 'admin' && (
          <div className="bg-card border border-border rounded-lg p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold">System Configuration</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Database</h3>
                <p className="text-sm text-muted-foreground mb-3">Supabase PostgreSQL</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">ML Model</h3>
                <p className="text-sm text-muted-foreground mb-3">Random Forest v1.0</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">Storage</h3>
                <p className="text-sm text-muted-foreground mb-3">Supabase Storage</p>
                <p className="text-xs text-muted-foreground">Used: ~2.4 GB / 10 GB</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-2">API Status</h3>
                <p className="text-sm text-muted-foreground mb-3">FastAPI Backend</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-green-600 dark:text-green-400">Running</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <SettingsIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Settings Information</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Some settings may require admin privileges to change. Contact your system administrator
              if you need to modify system-level configurations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
