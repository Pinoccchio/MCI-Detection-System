'use client';

/**
 * Report Actions Component
 * Handles view, download and delete actions for reports
 */

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Trash2, Loader2, Eye } from 'lucide-react';
import { deleteReport } from '@/lib/api/reports';
import { useRouter } from 'next/navigation';

// ============================================================================
// TYPES
// ============================================================================

interface ReportActionsProps {
  reportId: string;
  pdfPath: string | null;
  userRole: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ReportActions({ reportId, pdfPath, userRole }: ReportActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const result = await deleteReport(reportId);

      if (!result.success) {
        setError(result.error || 'Failed to delete report');
        return;
      }

      // Refresh the page to show updated list
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* View Report - Link to report detail page */}
        <Link href={`/dashboard/reports/${reportId}`}>
          <Button
            variant="ghost"
            size="sm"
            title="View Report"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </Link>

        {userRole === 'admin' && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            title="Delete Report"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        )}

        {error && (
          <div className="absolute top-full mt-2 right-0 p-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded z-10 whitespace-nowrap">
            {error}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Report"
        variant="destructive"
        confirmText="Delete Report"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this report? This action cannot be undone.</p>
        </div>
      </AlertDialog>
    </>
  );
}
