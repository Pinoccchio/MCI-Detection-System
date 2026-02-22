'use client';

/**
 * Patient Selector Component
 * Client component for selecting a patient on upload page
 */

import { Patient } from '@/types/database';
import { useRouter } from 'next/navigation';

interface PatientSelectorProps {
  patients: Patient[];
}

export function PatientSelector({ patients }: PatientSelectorProps) {
  const router = useRouter();

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      router.push(`/dashboard/upload?patient=${e.target.value}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Select Patient
        </label>
        <select
          onChange={handlePatientChange}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background"
          defaultValue=""
        >
          <option value="" disabled>
            Choose a patient...
          </option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.full_name} - {patient.patient_id}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-muted-foreground">
        Select a patient to begin uploading their MRI scan.
      </p>
    </div>
  );
}
