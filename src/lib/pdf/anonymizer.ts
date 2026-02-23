/**
 * Anonymization Utilities for Research Reports
 * Provides helper functions to anonymize patient data for research purposes
 */

// ============================================================================
// PATIENT NAME ANONYMIZATION
// ============================================================================

/**
 * Anonymize patient name for research reports
 * Converts full name to "Subject_XXX" format
 */
export function anonymizePatientName(patientId: string): string {
  // Extract last 3 characters from patient ID for anonymization
  const suffix = patientId.slice(-3).toUpperCase();
  return `Subject_${suffix}`;
}

// ============================================================================
// AGE CALCULATION
// ============================================================================

/**
 * Calculate age from date of birth without exposing exact birthdate
 * Returns age in years
 */
export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Get age range for additional privacy
 * Returns age ranges like "60-64", "65-69", etc.
 */
export function getAgeRange(dateOfBirth: string): string {
  const age = calculateAge(dateOfBirth);
  const lowerBound = Math.floor(age / 5) * 5;
  const upperBound = lowerBound + 4;
  return `${lowerBound}-${upperBound}`;
}

// ============================================================================
// PATIENT ID ANONYMIZATION
// ============================================================================

/**
 * Anonymize patient ID for research reports
 * Converts to research-friendly ID format
 */
export function anonymizePatientId(patientId: string): string {
  // Use hash-like format: PT_XXX
  const hash = patientId.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  const shortHash = (hash % 1000).toString().padStart(3, '0');
  return `PT_${shortHash}`;
}

// ============================================================================
// DATE ANONYMIZATION
// ============================================================================

/**
 * Anonymize scan date to relative time
 * Instead of absolute date, returns relative description
 */
export function anonymizeScanDate(scanDate: string, analysisDate: string): string {
  const scan = new Date(scanDate);
  const analysis = new Date(analysisDate);
  const diffTime = Math.abs(analysis.getTime() - scan.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Same day as analysis';
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} before analysis`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} before analysis`;
  } else {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} before analysis`;
  }
}

/**
 * Get year only from date for research reports
 */
export function getYearOnly(date: string): string {
  return new Date(date).getFullYear().toString();
}

// ============================================================================
// GENDER ANONYMIZATION
// ============================================================================

/**
 * Convert gender to standardized format
 * For research, may want to keep this or use coded values
 */
export function standardizeGender(gender: string): string {
  if (gender === 'M') return 'Male';
  if (gender === 'F') return 'Female';
  return 'Other';
}

// ============================================================================
// INSTITUTION ANONYMIZATION
// ============================================================================

/**
 * Anonymize institution name for research
 */
export function anonymizeInstitution(institutionName?: string): string {
  if (!institutionName) return 'Research Institution';

  // Replace with generic institutional identifier
  const hash = institutionName.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);

  const instId = (hash % 100).toString().padStart(2, '0');
  return `Research Site ${instId}`;
}
