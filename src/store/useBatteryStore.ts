/**
 * Chain of Proof - Single Source of Truth Battery Store
 * Manages the 6 core ecosystem batteries (BAT-001 through BAT-006)
 * and their QUBO disposition decision state ('REUSE' | 'RECYCLE').
 */

import { create } from 'zustand';
import { EVBatteryPassport } from '../types';
import { SIX_BATTERIES } from '../services/batteryData';

export interface BatteryItem extends EVBatteryPassport {
  decision: 'REUSE' | 'RECYCLE';
}

// Initial 6 batteries with SOH-derived decisions (SOH >= 65 => REUSE, SOH < 65 => RECYCLE)
const initialBatteries: BatteryItem[] = SIX_BATTERIES.map((b) => ({
  ...b,
  decision: b.currentSOH >= 65.0 ? 'REUSE' : 'RECYCLE',
}));

interface BatteryStoreState {
  batteries: BatteryItem[];
  setBatteries: (batteries: BatteryItem[]) => void;
  updateDecisions: (assignments: { battery_id?: string; id?: string; decision?: string; recommendation?: string }[]) => void;
}

export const useBatteryStore = create<BatteryStoreState>((set) => ({
  batteries: initialBatteries,

  setBatteries: (batteries) => set({ batteries }),

  updateDecisions: (assignments) =>
    set((state) => {
      const assignmentMap = new Map<string, 'REUSE' | 'RECYCLE'>();

      assignments.forEach((a) => {
        const id = a.battery_id || a.id;
        const decString = String(a.decision || a.recommendation || '').toUpperCase();
        if (id) {
          if (decString.includes('REUSE') || decString.includes('SECOND-LIFE') || decString.includes('BESS')) {
            assignmentMap.set(id, 'REUSE');
          } else {
            assignmentMap.set(id, 'RECYCLE');
          }
        }
      });

      const updated = state.batteries.map((b) => {
        const newDecision = assignmentMap.get(b.id);
        if (newDecision) {
          return { ...b, decision: newDecision };
        }
        return b;
      });

      return { batteries: updated };
    }),
}));
