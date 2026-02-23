-- Migration: Add updated_at timestamp to reports table
-- This tracks when reports are regenerated

-- Add updated_at column to reports table
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
DROP TRIGGER IF EXISTS reports_updated_at_trigger ON public.reports;

CREATE TRIGGER reports_updated_at_trigger
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_reports_updated_at();

-- Backfill existing reports with created_at as initial updated_at
UPDATE public.reports
SET updated_at = created_at
WHERE updated_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.reports.updated_at IS 'Timestamp of last regeneration or update';
