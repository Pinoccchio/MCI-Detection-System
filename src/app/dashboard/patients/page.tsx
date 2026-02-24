/**
 * Patients List Page
 * Displays all patients with search and management capabilities
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getPatients, deletePatient } from '@/lib/api/patients';
import { PatientTable } from '@/components/patients/PatientTable';
import { Users } from 'lucide-react';

export default async function PatientsPage() {
  // Check authentication and role
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only admins and clinicians can access patient management
  if (!['admin', 'clinician'].includes(user.profile.role)) {
    redirect('/dashboard');
  }

  // Fetch patients
  const { patients, error } = await getPatients();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground mt-1">
            Manage patient records and medical information
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          Failed to load patients: {error}
        </div>
      )}

      {/* Patient Table */}
      <PatientTable
        patients={patients}
        onDelete={user.profile.role === 'admin' ? deletePatient : undefined}
        userRole={user.profile.role}
      />
    </div>
  );
}
