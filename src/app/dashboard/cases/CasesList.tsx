'use client';

/**
 * Cases List Component
 * Client-side component for searching and filtering patient cases
 */

import { useState, useMemo } from 'react';
import { PatientCaseSummary } from '@/lib/api/cases';
import { CaseCard } from '@/components/cases/CaseCard';
import { Search, Filter, X, Folder } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

interface CasesListProps {
  initialCases: PatientCaseSummary[];
  totalCases: number;
}

type StatusFilter = 'all' | 'active' | 'pending' | 'completed' | 'mci';

// ============================================================================
// COMPONENT
// ============================================================================

export function CasesList({ initialCases, totalCases }: CasesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter cases client-side
  const filteredCases = useMemo(() => {
    return initialCases.filter((caseData) => {
      // Text search
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          caseData.full_name.toLowerCase().includes(search) ||
          caseData.patient_id.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'active':
            if (caseData.scan_count === 0) return false;
            break;
          case 'pending':
            if (!(caseData.scan_count > 0 && caseData.analysis_count === 0)) return false;
            break;
          case 'completed':
            if (caseData.analysis_count === 0) return false;
            break;
          case 'mci':
            if (caseData.latest_analysis?.prediction !== 'Mild Cognitive Impairment')
              return false;
            break;
        }
      }

      return true;
    });
  }, [initialCases, searchTerm, statusFilter]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search and Filter Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by patient name or ID..."
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
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-muted/50 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Filter by Status</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Cases' },
              { value: 'active', label: 'Active (Has Scans)' },
              { value: 'pending', label: 'Pending Review' },
              { value: 'completed', label: 'Completed' },
              { value: 'mci', label: 'MCI Detected' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={statusFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(option.value as StatusFilter)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Cases List */}
      {filteredCases.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
              <Folder className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {hasActiveFilters ? 'No Cases Found' : 'No Patient Cases'}
            </h2>
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? 'No cases match your current search or filter criteria. Try adjusting your filters.'
                : 'There are no patient cases in the system yet.'}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCases.map((caseData) => (
            <CaseCard key={caseData.id} caseData={caseData} />
          ))}
        </div>
      )}

      {/* Results count */}
      {filteredCases.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredCases.length} of {totalCases} case
          {totalCases !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
