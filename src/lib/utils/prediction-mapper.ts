/**
 * Prediction Value Mapping Utility
 * Centralized constants for prediction values used throughout the application
 *
 * NOTE: Database and display values are the SAME.
 * Both store and display the full descriptive names.
 *
 * Database stores: 'Cognitively Normal', 'Mild Cognitive Impairment', "Alzheimer's Disease"
 * Application displays: 'Cognitively Normal', 'Mild Cognitive Impairment', "Alzheimer's Disease"
 * ML Backend returns: 'Cognitively Normal', 'Mild Cognitive Impairment'
 */

export const DB_PREDICTIONS = {
  NORMAL: 'Cognitively Normal',
  MCI: 'Mild Cognitive Impairment',
  ALZHEIMERS: "Alzheimer's Disease",
} as const;

export const DISPLAY_PREDICTIONS = {
  NORMAL: 'Cognitively Normal',
  MCI: 'Mild Cognitive Impairment',
  ALZHEIMERS: "Alzheimer's Disease",
} as const;

const dbToDisplay: Record<string, string> = {
  [DB_PREDICTIONS.NORMAL]: DISPLAY_PREDICTIONS.NORMAL,
  [DB_PREDICTIONS.MCI]: DISPLAY_PREDICTIONS.MCI,
  [DB_PREDICTIONS.ALZHEIMERS]: DISPLAY_PREDICTIONS.ALZHEIMERS,
};

const displayToDb: Record<string, string> = {
  [DISPLAY_PREDICTIONS.NORMAL]: DB_PREDICTIONS.NORMAL,
  [DISPLAY_PREDICTIONS.MCI]: DB_PREDICTIONS.MCI,
  [DISPLAY_PREDICTIONS.ALZHEIMERS]: DB_PREDICTIONS.ALZHEIMERS,
};

/**
 * Convert display prediction to database value
 * NOTE: Since display and DB values are the same, this is a pass-through.
 * Kept for API consistency and potential future mapping needs.
 * @param displayValue - The display name (e.g., 'Cognitively Normal')
 * @returns Database value (same as input)
 */
export function toDbPrediction(displayValue: string): string {
  return displayToDb[displayValue] || displayValue;
}

/**
 * Convert database prediction to display value
 * NOTE: Since display and DB values are the same, this is a pass-through.
 * Kept for API consistency and potential future mapping needs.
 * @param dbValue - The database value (e.g., 'Cognitively Normal')
 * @returns Display name (same as input)
 */
export function toDisplayPrediction(dbValue: string): string {
  return dbToDisplay[dbValue] || dbValue;
}

/**
 * Get all database prediction values
 * @returns Array of database prediction values
 */
export function getAllDbPredictions(): string[] {
  return Object.values(DB_PREDICTIONS);
}

/**
 * Get all display prediction values
 * @returns Array of display prediction values
 */
export function getAllDisplayPredictions(): string[] {
  return Object.values(DISPLAY_PREDICTIONS);
}
