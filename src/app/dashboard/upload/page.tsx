/**
 * Upload Scan Page
 * Page for uploading new MRI scans
 */

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/actions';
import { getPatients } from '@/lib/api/patients';
import { ScanUploader } from '@/components/scans/ScanUploader';
import { PatientSelector } from '@/components/scans/PatientSelector';
import { Upload as UploadIcon } from 'lucide-react';
import { Patient } from '@/types/database';

interface UploadPageProps {
  searchParams: Promise<{
    patient?: string;
  }>;
}

export default async function UploadPage({ searchParams }: UploadPageProps) {
  // Await searchParams
  const params = await searchParams;

  // Check authentication and role
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only admins can upload scans
  if (user.profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // If patient ID provided, fetch that patient
  // Otherwise show patient selection
  const preSelectedPatientId = params.patient;

  let selectedPatient: Patient | null | undefined = null;
  let allPatients: Patient[] = [];

  if (preSelectedPatientId) {
    const { patients } = await getPatients();
    selectedPatient = patients.find((p) => p.id === preSelectedPatientId);
  } else {
    const { patients } = await getPatients();
    allPatients = patients;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <UploadIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Upload MRI Scan</h1>
          <p className="text-muted-foreground mt-1">
            Upload DICOM or NIfTI files for analysis
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        {selectedPatient ? (
          <ScanUploader
            patientId={selectedPatient.id}
            patientName={selectedPatient.full_name}
          />
        ) : allPatients.length > 0 ? (
          <PatientSelector patients={allPatients} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No patients found. Please add a patient first.
            </p>
            <a
              href="/dashboard/patients/new"
              className="text-primary hover:underline"
            >
              Add New Patient
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
