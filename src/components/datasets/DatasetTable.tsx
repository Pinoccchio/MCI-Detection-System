'use client';

/**
 * Dataset Table Component
 * Display and export research data (analyses) with filtering
 */

import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  FileJson,
  FileSpreadsheet,
  Search,
  CheckSquare,
  Square,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  exportToCSV,
  exportToJSON,
  formatAnalysisForExport,
  ANALYSIS_EXPORT_COLUMNS,
} from '@/lib/utils/export';

// ============================================================================
// TYPES
// ============================================================================

interface DatasetTableProps {
  analyses: any[];
}

type PredictionFilter = 'all' | 'mci' | 'normal';

const PREDICTION_OPTIONS = [
  { value: 'all', label: 'All Predictions' },
  { value: 'mci', label: 'MCI Detected' },
  { value: 'normal', label: 'Cognitively Normal' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function DatasetTable({ analyses }: DatasetTableProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [predictionFilter, setPredictionFilter] = useState<PredictionFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Memoized filtered data - now filtering analyses directly
  const filteredData = useMemo(() => {
    return analyses.filter((analysis) => {
      const scan = analysis.mri_scans || {};
      const patient = scan.patients || {};

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const patientName = patient.full_name?.toLowerCase() || '';
        const patientId = patient.patient_id?.toLowerCase() || '';
        const scanType = scan.scan_type?.toLowerCase() || '';

        if (
          !patientName.includes(search) &&
          !patientId.includes(search) &&
          !scanType.includes(search)
        ) {
          return false;
        }
      }

      // Date filters (on analysis date)
      const analysisDate = analysis.created_at?.split('T')[0] || '';
      if (dateFrom && analysisDate < dateFrom) return false;
      if (dateTo && analysisDate > dateTo) return false;

      // Prediction filter
      if (predictionFilter !== 'all') {
        if (predictionFilter === 'mci') {
          return analysis.prediction === 'Mild Cognitive Impairment';
        }
        if (predictionFilter === 'normal') {
          return analysis.prediction === 'Cognitively Normal';
        }
      }

      return true;
    });
  }, [analyses, searchTerm, predictionFilter, dateFrom, dateTo]);

  // Selection handlers
  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredData.map((a) => a.id)));
  }, [filteredData]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Export handlers
  const getExportData = useCallback(() => {
    if (selectedIds.size > 0) {
      // Export only selected
      return filteredData
        .filter((a) => selectedIds.has(a.id))
        .map(formatAnalysisForExport);
    }
    // Export all filtered
    return filteredData.map(formatAnalysisForExport);
  }, [selectedIds, filteredData]);

  const handleExportCSV = useCallback(() => {
    const exportData = getExportData();
    if (exportData.length === 0) {
      alert('No data to export.');
      return;
    }
    const timestamp = new Date().toISOString().split('T')[0];
    exportToCSV(exportData, `mci-dataset-${timestamp}`, ANALYSIS_EXPORT_COLUMNS);
  }, [getExportData]);

  const handleExportJSON = useCallback(() => {
    const exportData = getExportData();
    if (exportData.length === 0) {
      alert('No data to export.');
      return;
    }
    const timestamp = new Date().toISOString().split('T')[0];
    exportToJSON(exportData, `mci-dataset-${timestamp}`);
  }, [getExportData]);

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;
  const allSelected = filteredData.length > 0 && selectedIds.size === filteredData.length;

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-1 block">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients, IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Prediction Filter */}
        <div className="w-[180px]">
          <label className="text-sm font-medium mb-1 block">Prediction</label>
          <Select
            value={predictionFilter}
            onChange={(e) => setPredictionFilter(e.target.value as PredictionFilter)}
            options={PREDICTION_OPTIONS}
          />
        </div>

        {/* Date Range */}
        <div className="flex gap-2">
          <div>
            <label className="text-sm font-medium mb-1 block">From</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-[140px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">To</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-[140px]"
            />
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={selectAll}>
            <CheckSquare className="h-4 w-4 mr-2" />
            Select All ({filteredData.length})
          </Button>
          <Button variant="outline" size="sm" onClick={clearSelection}>
            <Square className="h-4 w-4 mr-2" />
            Clear
          </Button>
          {hasSelection && (
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            disabled={filteredData.length === 0}
          >
            <FileJson className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAll();
                      } else {
                        clearSelection();
                      }
                    }}
                    className="h-4 w-4 rounded border-border"
                  />
                </th>
                <th className="p-3 text-left font-medium">Patient</th>
                <th className="p-3 text-left font-medium">Scan Type</th>
                <th className="p-3 text-left font-medium">Prediction</th>
                <th className="p-3 text-left font-medium">Confidence</th>
                <th className="p-3 text-left font-medium">Analyzed By</th>
                <th className="p-3 text-left font-medium">Analyzed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    No data matches your filters
                  </td>
                </tr>
              ) : (
                filteredData.map((analysis) => {
                  const scan = analysis.mri_scans || {};
                  const patient = scan.patients || {};
                  const isSelected = selectedIds.has(analysis.id);

                  return (
                    <tr
                      key={analysis.id}
                      className={`hover:bg-muted/50 cursor-pointer ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => toggleSelection(analysis.id)}
                    >
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(analysis.id)}
                          className="h-4 w-4 rounded border-border"
                        />
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">
                            {patient.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient.patient_id || '-'}
                          </p>
                        </div>
                      </td>
                      <td className="p-3">{scan.scan_type || '-'}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            analysis.prediction === 'Mild Cognitive Impairment'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {analysis.prediction === 'Mild Cognitive Impairment'
                            ? 'MCI'
                            : 'Normal'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="font-mono">
                          {(analysis.confidence * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {analysis.analyzer?.full_name || '—'}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {formatDateTime(analysis.created_at)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredData.length} of {analyses.length} analysis results
      </div>
    </div>
  );
}
