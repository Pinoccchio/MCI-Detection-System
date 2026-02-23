'use client';

/**
 * Profile Form Component
 * Editable form for updating user profile information
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { saveProfile } from './actions';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const profileSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .min(3, 'Full name must be at least 3 characters')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Please enter a valid name'),
  institution: z
    .string()
    .min(1, 'Institution is required')
    .min(3, 'Institution name must be at least 3 characters'),
  contact_number: z
    .string()
    .min(1, 'Contact number is required')
    .regex(
      /^(\+63|0)[9]\d{9}$/,
      'Please enter a valid Philippine mobile number (e.g., +639XXXXXXXXX or 09XXXXXXXXX)'
    ),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

interface ProfileFormProps {
  initialData: {
    full_name: string;
    institution: string;
    contact_number: string;
    bio: string;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setStatus('idle');
      setErrorMessage(null);

      const result = await saveProfile({
        full_name: data.full_name,
        institution: data.institution,
        contact_number: data.contact_number,
        bio: data.bio || undefined,
      });

      if (!result.success) {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to update profile');
        return;
      }

      setStatus('success');
      reset(data); // Reset form state with current data as new baseline

      // Reset status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred');
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Personal Information</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Update your personal details below
          </p>
        </div>
      </div>

      {/* Success Message */}
      {status === 'success' && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">Profile updated successfully!</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name" required>
              Full Name
            </Label>
            <Input
              id="full_name"
              type="text"
              placeholder="Dr. Juan Dela Cruz"
              error={errors.full_name?.message}
              {...register('full_name')}
            />
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <Label htmlFor="institution" required>
              Institution / Organization
            </Label>
            <Input
              id="institution"
              type="text"
              placeholder="Manila General Hospital"
              error={errors.institution?.message}
              {...register('institution')}
            />
          </div>

          {/* Contact Number */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="contact_number" required>
              Contact Number
            </Label>
            <Input
              id="contact_number"
              type="tel"
              placeholder="+63 917 123 4567"
              error={errors.contact_number?.message}
              {...register('contact_number')}
            />
            <p className="text-xs text-muted-foreground">
              Philippine mobile number format: +639XXXXXXXXX or 09XXXXXXXXX
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <textarea
              id="bio"
              placeholder="Tell us a bit about yourself..."
              className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-y"
              {...register('bio')}
            />
            {errors.bio?.message && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          {isDirty && (
            <p className="text-sm text-muted-foreground">
              You have unsaved changes
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
