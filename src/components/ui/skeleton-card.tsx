/**
 * Skeleton Card Component
 * Reusable loading placeholder for stat cards and content cards
 */

import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  showIcon?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className,
  showIcon = true,
  lines = 2
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-6',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-32" />
          ))}
        </div>
        {showIcon && (
          <Skeleton className="h-12 w-12 rounded-lg" />
        )}
      </div>
    </div>
  );
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonActionCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-4 border border-border rounded-lg',
        className
      )}
    >
      <Skeleton className="h-6 w-6 mb-2" />
      <Skeleton className="h-5 w-24 mb-1" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function SkeletonActivityItem({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-3 border border-border rounded-lg',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
