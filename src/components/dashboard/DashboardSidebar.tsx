'use client';

/**
 * Dashboard Sidebar Component
 * Provides role-based navigation for admin, clinician, and researcher users
 * Supports collapsible mode for better screen real estate management
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import { Tooltip } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  Users,
  Scan,
  Brain,
  FileText,
  UserCircle,
  BarChart3,
  Upload,
  Database,
  UserCog,
  Folder,
  Activity,
  ChevronLeft,
  ChevronRight,
  PenTool,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles: ('admin' | 'clinician' | 'researcher')[];
  badge?: string;
}

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const navItems: NavItem[] = [
  // Common - Dashboard Overview
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Overview',
    roles: ['admin', 'clinician', 'researcher'],
  },

  // Admin Navigation
  {
    href: '/dashboard/patients',
    icon: Users,
    label: 'Patients',
    roles: ['admin', 'clinician'],
  },
  {
    href: '/dashboard/scans',
    icon: Scan,
    label: 'MRI Scans',
    roles: ['admin'],
  },
  {
    href: '/dashboard/upload',
    icon: Upload,
    label: 'Upload Scan',
    roles: ['admin'],
  },
  {
    href: '/dashboard/analyze',
    icon: Brain,
    label: 'Analyze',
    roles: ['admin', 'researcher'],
  },
  {
    href: '/dashboard/trace',
    icon: PenTool,
    label: 'Manual Tracing',
    roles: ['admin'],
  },

  // Clinician Navigation
  {
    href: '/dashboard/cases',
    icon: Folder,
    label: 'Patient Cases',
    roles: ['clinician'],
  },
  {
    href: '/dashboard/results',
    icon: Activity,
    label: 'Analysis Results',
    roles: ['clinician', 'admin'],
  },

  // Researcher Navigation
  {
    href: '/dashboard/datasets',
    icon: Database,
    label: 'Datasets',
    roles: ['researcher'],
  },
  {
    href: '/dashboard/analytics',
    icon: BarChart3,
    label: 'Analytics',
    roles: ['researcher', 'admin'],
  },
  {
    href: '/dashboard/batch',
    icon: Upload,
    label: 'Batch Processing',
    roles: ['researcher'],
  },

  // Common
  {
    href: '/dashboard/reports',
    icon: FileText,
    label: 'Reports',
    roles: ['admin', 'clinician', 'researcher'],
  },
  {
    href: '/dashboard/users',
    icon: UserCog,
    label: 'User Management',
    roles: ['admin'],
  },
  {
    href: '/dashboard/profile',
    icon: UserCircle,
    label: 'Profile',
    roles: ['admin', 'clinician', 'researcher'],
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface DashboardSidebarProps {
  role?: 'admin' | 'clinician' | 'researcher';
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebar();

  // Filter navigation items based on user role
  const filteredItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );

  // Get role display name
  const getRoleDisplayName = () => {
    switch (role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'clinician':
        return 'Clinician Portal';
      case 'researcher':
        return 'Research Platform';
      default:
        return 'Dashboard';
    }
  };

  return (
    <aside
      className={cn(
        'bg-card border-r border-border flex flex-col transition-all duration-300 relative',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Logo & Title */}
      <div className="p-6 border-b border-border">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MCI Detection</h1>
              <p className="text-xs text-muted-foreground">
                {getRoleDisplayName()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            // Check if current path matches this nav item (including nested routes)
            // Special case for Overview (/dashboard) - only match exactly to avoid matching all routes
            // Special case for Patients: also highlight when viewing scans (clinicians access scans via patients)
            let isActive = item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === item.href || pathname.startsWith(item.href + '/');

            // For clinicians viewing scan details, highlight "Patients" since they came from there
            if (item.href === '/dashboard/patients' && role === 'clinician' && pathname.startsWith('/dashboard/scans/')) {
              isActive = true;
            }

            const navLink = (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                    : 'text-foreground/80 hover:bg-muted/50 hover:text-foreground',
                  isCollapsed && 'justify-center'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );

            return (
              <li key={item.href}>
                {isCollapsed ? (
                  <Tooltip content={item.label} side="right">
                    {navLink}
                  </Tooltip>
                ) : (
                  navLink
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        {isCollapsed ? (
          <div className="flex justify-center">
            <Tooltip content="System Online" side="right">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>System Online</span>
          </div>
        )}
      </div>
    </aside>
  );
}
