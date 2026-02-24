/**
 * Table Skeleton Component
 * Loading placeholder for data tables
 */

import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface TableSkeletonProps {
  columns?: number;
  rows?: number;
  showHeader?: boolean;
  showActions?: boolean;
  className?: string;
}

export function TableSkeleton({
  columns = 5,
  rows = 5,
  showHeader = true,
  showActions = true,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('bg-card border border-border rounded-lg overflow-hidden', className)}>
      {/* Search/Filter Bar */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          {showActions && <Skeleton className="h-10 w-32" />}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {showHeader && (
            <thead className="bg-muted/50">
              <tr>
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
                {showActions && (
                  <th className="px-4 py-3 text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                  </th>
                )}
              </tr>
            </thead>
          )}
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-t border-border">
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-4">
                    <Skeleton
                      className={cn(
                        'h-4',
                        colIndex === 0 ? 'w-32' : colIndex === 1 ? 'w-40' : 'w-24'
                      )}
                    />
                  </td>
                ))}
                {showActions && (
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SimpleTableSkeleton({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 border border-border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
