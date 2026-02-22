/**
 * Patient Detail Page
 * Displays detailed patient information and scan history
 */

import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/actions';
import { getPatientWithScans } from '@/lib/api/patients';
import { formatDate, formatDateTime } from '@/lib/utils';
import { User, Edit, Scan, Calendar, Mail, Phone, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Generate metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { patient } = await getPatientWithScans(id);

  return {
    title: patient ? `${patient.full_name} - Patient Details` : 'Patient Not Found',
  };
}

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params
  const { id } = await params;

  // Check authentication
  const user = await getCurrentUser();

  if (!user || !user.profile) {
    redirect('/');
  }

  // Only admins and clinicians can view patient details
  if (!['admin', 'clinician'].includes(user.profile.role)) {
    redirect('/dashboard');
  }

  // Fetch patient with scans
  const { patient, scans, error } = await getPatientWithScans(id);

  if (error || !patient) {
    notFound();
  }

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{patient.full_name}</h1>
            <p className="text-muted-foreground mt-1">
              Patient ID: <span className="font-mono">{patient.patient_id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user.profile.role === 'admin' && (
            <Link href={`/dashboard/patients/${patient.id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Patient
              </Button>
            </Link>
          )}
          <Link href="/dashboard/patients">
            <Button variant="ghost">Back to List</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information Card */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Patient Information</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">
                      {formatDate(patient.date_of_birth)} ({calculateAge(patient.date_of_birth)}{' '}
                      years old)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-medium">
                      {patient.gender === 'M'
                        ? 'Male'
                        : patient.gender === 'F'
                        ? 'Female'
                        : 'Other'}
                    </p>
                  </div>
                </div>

                {patient.contact_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium break-all">{patient.contact_email}</p>
                    </div>
                  </div>
                )}

                {patient.contact_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{patient.contact_phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Registered</p>
                    <p className="font-medium">{formatDateTime(patient.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {patient.notes && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-sm font-semibold mb-2">Medical Notes</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {patient.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MRI Scans History */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">MRI Scans</h2>
              {user.profile.role === 'admin' && (
                <Link href={`/dashboard/upload?patient=${patient.id}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Scan
                  </Button>
                </Link>
              )}
            </div>

            {scans.length === 0 ? (
              <div className="text-center py-12">
                <Scan className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground">No MRI scans uploaded yet</p>
                {user.profile.role === 'admin' && (
                  <Link href={`/dashboard/upload?patient=${patient.id}`}>
                    <Button variant="outline" className="mt-4">
                      Upload First Scan
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {scans.map((scan) => (
                  <Link
                    key={scan.id}
                    href={`/dashboard/scans/${scan.id}`}
                    className="block p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Scan className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">{scan.scan_type}</p>
                          <p className="text-sm text-muted-foreground">
                            Scanned: {formatDateTime(scan.scan_date)}
                          </p>
                          {scan.file_type && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Format: {scan.file_type}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          scan.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : scan.status === 'processing'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : scan.status === 'failed'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {scan.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
