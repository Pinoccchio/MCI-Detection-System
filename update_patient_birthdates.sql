-- Update patient birthdates to more accurate ages for MCI assessment
-- Maria Clara Santos: 69 years old (born 1955)
UPDATE patients 
SET date_of_birth = '1955-03-15'
WHERE patient_id = 'MCI-2024-001';

-- Juan Dela Cruz: 62 years old (born 1962) 
UPDATE patients 
SET date_of_birth = '1962-08-22'
WHERE patient_id = 'MCI-2024-002';

-- Rosa Reyes: 76 years old (born 1948)
UPDATE patients 
SET date_of_birth = '1948-11-30'
WHERE patient_id = 'MCI-2024-003';

-- Verify the updates
SELECT patient_id, full_name, date_of_birth, 
       EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth::date)) as age
FROM patients 
WHERE patient_id IN ('MCI-2024-001', 'MCI-2024-002', 'MCI-2024-003')
ORDER BY patient_id;
