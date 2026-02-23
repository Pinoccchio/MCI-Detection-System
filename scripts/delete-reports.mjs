import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zqtsadnsusddihbhgmqk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxdHNhZG5zdXNkZGloYmhnbXFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM0MzEyMywiZXhwIjoyMDg0OTE5MTIzfQ.OqyZWpreFjBmhIM8tgIeBWkUqxT_8JaUjdfLuTqPWqU'
);

async function deleteAllReports() {
  // List all files in reports bucket
  const { data: files, error: listError } = await supabase.storage
    .from('reports')
    .list();

  if (listError) {
    console.error('Error listing files:', listError);
    return;
  }

  if (!files || files.length === 0) {
    console.log('No files to delete');
    return;
  }

  console.log('Found', files.length, 'files to delete');

  // Get file paths
  const filePaths = files.map(f => f.name);
  console.log('Files:', filePaths);

  // Delete all files
  const { data, error: deleteError } = await supabase.storage
    .from('reports')
    .remove(filePaths);

  if (deleteError) {
    console.error('Error deleting files:', deleteError);
    return;
  }

  console.log('Successfully deleted', filePaths.length, 'files from reports bucket');
}

deleteAllReports();
