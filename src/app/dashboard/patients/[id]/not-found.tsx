/**
 * Patient Not Found Page
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { UserX, ArrowLeft } from 'lucide-react';

export default function PatientNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="p-6 bg-muted rounded-full">
        <UserX className="h-16 w-16 text-muted-foreground" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Patient Not Found</h1>
        <p className="text-muted-foreground max-w-md">
          The patient you're looking for doesn't exist or you don't have permission to view it.
        </p>
      </div>

      <Link href="/dashboard/patients">
        <Button>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Patients
        </Button>
      </Link>
    </div>
  );
}
