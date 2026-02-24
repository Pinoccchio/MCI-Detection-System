'use client';

/**
 * Patient Table Component
 * Displays list of patients with search and actions
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Patient, UserRole } from '@/types/database';
import { formatDate } from '@/lib/utils';
import { Search, Eye, Edit, Trash2, UserPlus, AlertTriangle, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertDialog } from '@/components/ui/alert-dialog';

// ============================================================================
// TYPES
// ============================================================================

interface PatientTableProps {
  patients: Patient[];
  onDelete?: (id: string) => void;
  userRole?: UserRole;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function PatientTable({ patients, onDelete, userRole = 'admin' }: PatientTableProps) {
  // Clinicians have read-only access
  const isReadOnly = userRole === 'clinician';
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  // Filter patients based on search and advanced filters
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      // Text search
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        patient.full_name.toLowerCase().includes(search) ||
        patient.patient_id.toLowerCase().includes(search) ||
        patient.contact_email?.toLowerCase().includes(search) ||
        patient.contact_phone?.includes(search);

      if (!matchesSearch) return false;

      // Gender filter
      if (genderFilter !== 'all' && patient.gender !== genderFilter) {
        return false;
      }

      // Date range filter
      if (dateFrom || dateTo) {
        const patientDate = new Date(patient.created_at);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          if (patientDate < fromDate) return false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (patientDate > toDate) return false;
        }
      }

      return true;
    });
  }, [patients, searchTerm, genderFilter, dateFrom, dateTo]);

  const activeFiltersCount = [
    genderFilter !== 'all',
    dateFrom !== '',
    dateTo !== '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setGenderFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
              placeholder="Search patients by name, ID, email..."
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

        {!isReadOnly && (
          <Link href="/dashboard/patients/new">
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </Link>
        )}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gender Filter */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Gender</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              >
                <option value="all">All Genders</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>

            {/* Date From Filter */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Registered From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
            </div>

            {/* Date To Filter */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Registered To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
              />
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
                  Patient ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    {searchTerm ? 'No patients found matching your search' : 'No patients yet'}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm font-medium">
                        {patient.patient_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{patient.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">
                        {calculateAge(patient.date_of_birth)} years
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm">
                        {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {patient.contact_email && (
                          <div className="text-muted-foreground">{patient.contact_email}</div>
                        )}
                        {patient.contact_phone && (
                          <div className="text-muted-foreground">{patient.contact_phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(patient.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/dashboard/patients/${patient.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="View patient details"
                          >
                            <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                        </Link>
                        {!isReadOnly && (
                          <Link href={`/dashboard/patients/${patient.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              title="Edit patient information"
                            >
                              <Edit className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </Button>
                          </Link>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-destructive hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete patient"
                            onClick={() => {
                              setPatientToDelete(patient);
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
      {filteredPatients.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredPatients.length} of {patients.length} patient
          {patients.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Patient"
        variant="destructive"
        confirmText="Delete Patient"
        cancelText="Cancel"
        onConfirm={() => {
          if (patientToDelete && onDelete) {
            onDelete(patientToDelete.id);
            setPatientToDelete(null);
          }
        }}
        onCancel={() => {
          setPatientToDelete(null);
        }}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-destructive mb-1">
                Are you sure you want to delete {patientToDelete?.full_name}?
              </p>
              <p className="text-sm text-muted-foreground">
                This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">This will permanently delete:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Patient record and personal information
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                All MRI scans
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
