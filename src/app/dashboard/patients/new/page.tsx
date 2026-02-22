/**
 * New Patient Page
 * Form to create a new patient record
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { PatientForm } from '@/components/patients/PatientForm';
import { UserPlus } from 'lucide-react';

export default async function NewPatientPage() {
  // Check authentication and role
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only admins and clinicians can create patients
  if (!['admin', 'clinician'].includes(user.profile.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <UserPlus className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Add New Patient</h1>
          <p className="text-muted-foreground mt-1">
            Register a new patient in the system
          </p>
        </div>
      </div>

      {/* Patient Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <PatientForm mode="create" />
      </div>
    </div>
  );
}
