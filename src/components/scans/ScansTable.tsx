'use client';

/**
 * Scans Table Component
 * Displays list of MRI scans with search and actions
 */

import { useState } from 'react';
import Link from 'next/link';
import { formatDateTime, formatFileSize } from '@/lib/utils';
import { Search, Eye, Trash2, Upload, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';

// ============================================================================
// TYPES
// ============================================================================

interface Scan {
  id: string;
  patient_id: string;
  scan_type: string;
  scan_date: string;
  file_path: string | null;
  file_type: string | null;
  file_size: number | null;
  status: string;
  created_at: string;
  patients?: {
    full_name: string;
    patient_id: string;
  };
}

interface ScansTableProps {
  scans: Scan[];
  onDelete?: (id: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ScansTable({ scans, onDelete }: ScansTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<Scan | null>(null);

  // Filter scans based on search
  const filteredScans = scans.filter((scan) => {
    const search = searchTerm.toLowerCase();
    return (
      scan.patients?.full_name.toLowerCase().includes(search) ||
      scan.patients?.patient_id.toLowerCase().includes(search) ||
      scan.scan_type.toLowerCase().includes(search) ||
      scan.file_type?.toLowerCase().includes(search) ||
      scan.status.toLowerCase().includes(search)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'processing':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search scans by patient, type, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Link href="/dashboard/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Scan
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Scan Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  File Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  File Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Scan Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    {searchTerm ? 'No scans found matching your search' : 'No scans yet'}
                  </td>
                </tr>
              ) : (
                filteredScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{scan.patients?.full_name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {scan.patients?.patient_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium">{scan.scan_type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {scan.file_type || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {scan.file_size ? formatFileSize(scan.file_size) : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(scan.scan_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                          scan.status
                        )}`}
                      >
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/scans/${scan.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View scan details"
                          >
                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                        </Link>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-destructive hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete scan"
                            onClick={() => {
                              setScanToDelete(scan);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
      {filteredScans.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredScans.length} of {scans.length} scan
          {scans.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete MRI Scan"
        variant="destructive"
        confirmText="Delete Scan"
        cancelText="Cancel"
        onConfirm={() => {
          if (scanToDelete && onDelete) {
            onDelete(scanToDelete.id);
            setScanToDelete(null);
          }
        }}
        onCancel={() => {
          setScanToDelete(null);
        }}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-destructive mb-1">
                Are you sure you want to delete this MRI scan?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Scan details:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Patient: {scanToDelete?.patients?.full_name}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Type: {scanToDelete?.scan_type}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                Date: {scanToDelete && formatDateTime(scanToDelete.scan_date)}
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">This will permanently delete:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                MRI scan file and metadata
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                All analysis results
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                All associated reports
              </li>
            </ul>
          </div>
        </div>
      </AlertDialog>
    </div>
  );
}
