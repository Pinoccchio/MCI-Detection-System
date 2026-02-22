'use client';

/**
 * Results Table Component
 * Displays analysis results with search and filtering
 */

import { useState } from 'react';
import Link from 'next/link';
import { AnalysisResult } from '@/types/database';
import { formatDateTime } from '@/lib/utils';
import { Search, Eye, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

interface ResultsTableProps {
  analyses: any[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ResultsTable({ analyses }: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrediction, setFilterPrediction] = useState<string>('all');

  // Filter analyses based on search and prediction filter
  const filteredAnalyses = analyses.filter((analysis) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      analysis.mri_scans?.patients?.full_name.toLowerCase().includes(search) ||
      analysis.mri_scans?.patients?.patient_id.toLowerCase().includes(search) ||
      analysis.mri_scans?.scan_type.toLowerCase().includes(search) ||
      analysis.model_version.toLowerCase().includes(search);

    const matchesPrediction =
      filterPrediction === 'all' || analysis.prediction === filterPrediction;

    return matchesSearch && matchesPrediction;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by patient, scan type, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={filterPrediction}
            onChange={(e) => setFilterPrediction(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background"
          >
            <option value="all">All Predictions</option>
            <option value="Cognitively Normal">Cognitively Normal</option>
            <option value="Mild Cognitive Impairment">MCI Detected</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
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
                  Prediction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Analyzed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    {searchTerm || filterPrediction !== 'all'
                      ? 'No results match your search criteria'
                      : 'No analysis results yet'}
                  </td>
                </tr>
              ) : (
                filteredAnalyses.map((analysis: any) => (
                  <tr key={analysis.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/dashboard/patients/${analysis.mri_scans?.patient_id}`}
                        className="hover:underline"
                      >
                        <div className="font-medium">
                          {analysis.mri_scans?.patients?.full_name}
                        </div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {analysis.mri_scans?.patients?.patient_id}
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium">
                        {analysis.mri_scans?.scan_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {analysis.prediction === 'Cognitively Normal' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            analysis.prediction === 'Cognitively Normal'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                          }`}
                        >
                          {analysis.prediction}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${analysis.confidence * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(analysis.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {analysis.model_version}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(analysis.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/results/${analysis.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results count */}
      {filteredAnalyses.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredAnalyses.length} of {analyses.length} result
          {analyses.length !== 1 ? 's' : ''}
          {filterPrediction !== 'all' && (
            <span> (filtered by: {filterPrediction})</span>
          )}
        </div>
      )}
    </div>
  );
}
