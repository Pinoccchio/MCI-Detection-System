/**
 * Edit Patient Page
 * Form to edit existing patient record
 */

import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getPatientById } from '@/lib/api/patients';
import { PatientForm } from '@/components/patients/PatientForm';
import { Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params
  const { id } = await params;

  // Check authentication and role
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only admins can edit patients
  if (user.profile.role !== 'admin') {
    redirect('/dashboard/patients');
  }

  // Fetch patient data
  const { patient, error } = await getPatientById(id);

  if (error || !patient) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Edit className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Edit Patient</h1>
            <p className="text-muted-foreground mt-1">
              Update patient information for {patient.full_name}
            </p>
          </div>
        </div>

        <Link href={`/dashboard/patients/${patient.id}`}>
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patient
          </Button>
        </Link>
      </div>

      {/* Patient Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <PatientForm patient={patient} mode="edit" />
      </div>
    </div>
  );
}
