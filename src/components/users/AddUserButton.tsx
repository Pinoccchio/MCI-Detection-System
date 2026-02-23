'use client';

/**
 * Add User Button Component
 * Client component that opens the CreateUserDialog
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from '@/components/users/CreateUserDialog';
import { UserPlus } from 'lucide-react';

export function AddUserButton() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setDialogOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        Add User
      </Button>

      <CreateUserDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
