'use client';

/**
 * Scans Table Component
 * Displays list of MRI scans with search and actions
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDateTime, formatFileSize } from '@/lib/utils';
import { Search, Eye, Trash2, Upload, AlertTriangle, Filter, X } from 'lucide-react';
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
  const [scanTypeFilter, setScanTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<Scan | null>(null);

  // Get unique scan types for filter dropdown
  const scanTypes = useMemo(() => {
    const types = new Set(scans.map((s) => s.scan_type));
    return Array.from(types).sort();
  }, [scans]);

  // Filter scans based on search and filters
  const filteredScans = useMemo(() => {
    return scans.filter((scan) => {
      // Text search
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        scan.patients?.full_name.toLowerCase().includes(search) ||
        scan.patients?.patient_id.toLowerCase().includes(search) ||
        scan.scan_type.toLowerCase().includes(search) ||
        scan.file_type?.toLowerCase().includes(search);

      if (!matchesSearch) return false;

      // Scan type filter
      if (scanTypeFilter !== 'all' && scan.scan_type !== scanTypeFilter) {
        return false;
      }

      return true;
    });
  }, [scans, searchTerm, scanTypeFilter]);

  const activeFiltersCount = [
    scanTypeFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setScanTypeFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search scans by patient, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        <Link href="/dashboard/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Scan
          </Button>
        </Link>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filters</h3>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {/* Scan Type Filter */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Scan Type</label>
              <select
                value={scanTypeFilter}
                onChange={(e) => setScanTypeFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="all">All Types</option>
                {scanTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

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
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
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
