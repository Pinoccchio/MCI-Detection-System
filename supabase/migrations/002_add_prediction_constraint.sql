-- Migration: Add CHECK constraint to prediction column
-- This ensures only valid prediction values can be stored in the database

-- Add CHECK constraint to analysis_results.prediction
ALTER TABLE analysis_results
ADD CONSTRAINT prediction_valid_values_check
CHECK (
  prediction IN (
    'Cognitively Normal',
    'Mild Cognitive Impairment',
    'Alzheimer''s Disease'
  )
);

-- Add comment to document the constraint
COMMENT ON CONSTRAINT prediction_valid_values_check ON analysis_results IS
'Ensures prediction column only contains valid classification values: Cognitively Normal, Mild Cognitive Impairment, or Alzheimer''s Disease';
