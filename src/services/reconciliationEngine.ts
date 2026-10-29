/**
 * Chain of Proof - Material Recovery Reconciliation Engine
 * Law of Conservation of Mass validation against battery passport composition records.
 */

import { ElementalCompositionKg, ReconciliationResult } from '../types';

export const MAX_RECOVERY_EFFICIENCIES: Record<
  keyof ElementalCompositionKg,
  { name: string; maxPercent: number }
> = {
  lithium: { name: 'Lithium (Li)', maxPercent: 95.0 },
  nickel: { name: 'Nickel (Ni)', maxPercent: 98.5 },
  cobalt: { name: 'Cobalt (Co)', maxPercent: 98.0 },
  manganese: { name: 'Manganese (Mn)', maxPercent: 96.0 },
  graphite: { name: 'Graphite (C)', maxPercent: 92.0 },
  copper: { name: 'Copper (Cu)', maxPercent: 99.0 },
  aluminum: { name: 'Aluminum (Al)', maxPercent: 98.5 },
};

/**
 * Evaluates reported material recovery output against passport original composition input.
 */
export function evaluateBatchReconciliation(
  inputCompositionKg: ElementalCompositionKg,
  reportedRecoveredKg: ElementalCompositionKg
): ReconciliationResult {
  const elements = Object.keys(MAX_RECOVERY_EFFICIENCIES) as Array<
    keyof ElementalCompositionKg
  >;

  let overallValid = true;
  let totalInputMassKg = 0;
  let totalRecoveredMassKg = 0;
  let discrepancyReasons: string[] = [];

  const elementalDetails = {} as ReconciliationResult['elementalDetails'];

  elements.forEach((elem) => {
    const info = MAX_RECOVERY_EFFICIENCIES[elem];
    const inputKg = Number((inputCompositionKg[elem] || 0).toFixed(2));
    const recoveredKg = Number((reportedRecoveredKg[elem] || 0).toFixed(2));
    const deltaKg = Number((recoveredKg - inputKg).toFixed(2));

    totalInputMassKg += inputKg;
    totalRecoveredMassKg += recoveredKg;

    const maxAllowedEfficiencyPercent = info.maxPercent;
    const maxAllowedRecoveryKg = Number(
      ((inputKg * maxAllowedEfficiencyPercent) / 100).toFixed(2)
    );
    const recoveryRatePercent =
      inputKg > 0 ? Number(((recoveredKg / inputKg) * 100).toFixed(1)) : 0;

    let status: 'PASS' | 'EXCEEDS_PHYSICAL_LIMIT' | 'DEFICIT_WARNING' = 'PASS';

    // Physical impossibility check 1: Output exceeds total passport input
    if (recoveredKg > inputKg + 0.05) {
      status = 'EXCEEDS_PHYSICAL_LIMIT';
      overallValid = false;
      discrepancyReasons.push(
        `${info.name}: Reported recovered mass (${recoveredKg} kg) exceeds battery passport input mass (${inputKg} kg) by ${deltaKg.toFixed(2)} kg. Violation of Conservation of Mass.`
      );
    }
    // Physical impossibility check 2: Output exceeds maximum theoretical process efficiency
    else if (recoveredKg > maxAllowedRecoveryKg + 0.05) {
      status = 'EXCEEDS_PHYSICAL_LIMIT';
      overallValid = false;
      discrepancyReasons.push(
        `${info.name}: Recovery rate (${recoveryRatePercent}%) exceeds maximum thermodynamic process yield limit (${maxAllowedEfficiencyPercent}% / max ${maxAllowedRecoveryKg} kg).`
      );
    }
    // Warning check: unusually low recovery yield (< 60%)
    else if (inputKg > 1.0 && recoveryRatePercent < 60.0) {
      status = 'DEFICIT_WARNING';
    }

    elementalDetails[elem] = {
      elementName: info.name,
      inputKg,
      recoveredKg,
      deltaKg,
      recoveryRatePercent,
      maxAllowedEfficiencyPercent,
      maxAllowedRecoveryKg,
      status,
    };
  });

  const conservationDeltaKg = Number(
    (totalRecoveredMassKg - totalInputMassKg).toFixed(2)
  );
  const massRecoveryEfficiencyPercent =
    totalInputMassKg > 0
      ? Number(((totalRecoveredMassKg / totalInputMassKg) * 100).toFixed(1))
      : 0;

  return {
    overallChecksumValid: overallValid,
    conservationDeltaKg,
    massRecoveryEfficiencyPercent,
    elementalDetails,
    discrepancyReason:
      discrepancyReasons.length > 0
        ? discrepancyReasons.join(' | ')
        : 'All reported material recovery weights mathematically reconcile with passport composition records.',
    evaluatedAt: new Date().toISOString(),
    auditorVerified: overallValid,
  };
}
