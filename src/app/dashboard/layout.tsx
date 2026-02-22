/**
 * Dashboard Layout
 * Wraps all dashboard pages with sidebar navigation and header
 * Enforces authentication and provides user context
 * Supports collapsible sidebar with state persistence
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get current authenticated user
  const user = await getCurrentUser();

  // Redirect to home if not authenticated
  if (!user) {
    redirect('/');
  }

  // Redirect to home if user has no profile
  if (!user.profile) {
    console.error('[Dashboard] User has no profile');
    redirect('/');
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar Navigation */}
        <DashboardSidebar role={user.profile.role} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <DashboardHeader user={user} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
