'use client';

/**
 * Patient Form Component
 * Form for creating and editing patient records
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Patient, CreatePatientInput } from '@/types/database';
import { createPatient, updatePatient } from '@/lib/api/patients';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const patientSchema = z.object({
  patient_id: z
    .string()
    .min(1, 'Patient ID is required')
    .regex(/^[A-Z0-9-]+$/, 'Patient ID must contain only uppercase letters, numbers, and hyphens'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['M', 'F', 'Other']).optional(),
  contact_email: z.string().email('Invalid email address').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

interface PatientFormProps {
  patient?: Patient;
  mode: 'create' | 'edit';
}

export function PatientForm({ patient, mode }: PatientFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: patient
      ? {
          patient_id: patient.patient_id,
          full_name: patient.full_name,
          date_of_birth: patient.date_of_birth,
          gender: patient.gender || undefined,
          contact_email: patient.contact_email || '',
          contact_phone: patient.contact_phone || '',
          notes: patient.notes || '',
        }
      : {
          gender: undefined,
        },
  });

  const onSubmit = async (data: PatientFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      const input: CreatePatientInput = {
        patient_id: data.patient_id,
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender || 'Other',
        contact_email: data.contact_email || undefined,
        contact_phone: data.contact_phone || undefined,
        notes: data.notes || undefined,
      };

      let result;
      if (mode === 'create') {
        result = await createPatient(input);
      } else if (patient) {
        result = await updatePatient(patient.id, input);
      }

      if (!result?.success) {
        setError(result?.error || 'An error occurred');
        return;
      }

      // Success - redirect to patients list
      router.push('/dashboard/patients');
      router.refresh();
    } catch (err: any) {
      console.error('Form submission error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient ID */}
        <div className="space-y-2">
          <Label htmlFor="patient_id" required>
            Patient ID
          </Label>
          <Input
            id="patient_id"
            type="text"
            placeholder="MCI-2024-001"
            error={errors.patient_id?.message}
            disabled={mode === 'edit'} // Can't change patient ID after creation
            {...register('patient_id')}
          />
          <p className="text-xs text-muted-foreground">
            Unique medical record identifier (uppercase letters, numbers, hyphens)
          </p>
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="full_name" required>
            Full Name
          </Label>
          <Input
            id="full_name"
            type="text"
            placeholder="John Doe"
            error={errors.full_name?.message}
            {...register('full_name')}
          />
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="date_of_birth" required>
            Date of Birth
          </Label>
          <Input
            id="date_of_birth"
            type="date"
            error={errors.date_of_birth?.message}
            {...register('date_of_birth')}
          />
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            id="gender"
            options={[
              { value: '', label: 'Select gender' },
              { value: 'M', label: 'Male' },
              { value: 'F', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
            error={errors.gender?.message}
            {...register('gender')}
          />
        </div>

        {/* Contact Email */}
        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            placeholder="patient@example.com"
            error={errors.contact_email?.message}
            {...register('contact_email')}
          />
        </div>

        {/* Contact Phone */}
        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            type="tel"
            placeholder="+63 912 345 6789"
            error={errors.contact_phone?.message}
            {...register('contact_phone')}
          />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Medical Notes</Label>
        <textarea
          id="notes"
          rows={4}
          placeholder="Additional medical information, history, or notes..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          {...register('notes')}
        />
        {errors.notes && (
          <p className="text-xs text-destructive">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === 'create' ? 'Creating...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Patient' : 'Save Changes'}
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/dashboard/patients')}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  );
}
