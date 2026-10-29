/**
 * Chain of Proof - Battery Data Service
 * Exports persistent battery mock records BAT-001 through BAT-006 with exact technical parameters,
 * SOH percentages, capacities, chemistries, and lifecycle states.
 */

import { EVBatteryPassport } from '../types';
import { INITIAL_BATTERY_PASSPORTS } from '../data/initialMockData';

/**
 * The 6 core ecosystem battery records (BAT-001 through BAT-006)
 */
export const SIX_BATTERIES: EVBatteryPassport[] = INITIAL_BATTERY_PASSPORTS;

/**
 * Retrieves the 6 battery records from local storage if available,
 * otherwise falls back to the default 6 seed battery records and persists them.
 */
export const loadBatteryData = (): EVBatteryPassport[] => {
  try {
    const stored = localStorage.getItem('chain_of_proof_batteries');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length >= 6) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load battery data from localStorage:', err);
  }

  saveBatteryData(SIX_BATTERIES);
  return SIX_BATTERIES;
};

/**
 * Persists the current battery records to localStorage.
 */
export const saveBatteryData = (batteries: EVBatteryPassport[]): void => {
  try {
    localStorage.setItem('chain_of_proof_batteries', JSON.stringify(batteries));
  } catch (err) {
    console.warn('Failed to save battery data to localStorage:', err);
  }
};

/**
 * Resets persisted battery data back to default 6 records.
 */
export const resetBatteryData = (): EVBatteryPassport[] => {
  try {
    localStorage.removeItem('chain_of_proof_batteries');
  } catch (err) {
    console.warn('Failed to clear battery data from localStorage:', err);
  }
  saveBatteryData(SIX_BATTERIES);
  return SIX_BATTERIES;
};
