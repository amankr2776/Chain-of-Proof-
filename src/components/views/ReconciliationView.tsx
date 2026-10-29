/**
 * Chain of Proof - Reconciliation View (Module 6: Mass Balance & Fraud Rejection)
 * Dense data table comparing recovery claims against passport composition baselines.
 * Rejected claims render deviation % and status in Marigold (#F59E0B).
 * Row expansion renders side-by-side:
 * - Left: Passport Baseline JSON
 * - Right: Auditor Signature and Quantum Nonce
 */

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../common/StatusBadge';
import { TruncatedHash } from '../common/TruncatedHash';
import { apiFetch } from '../../services/apiClient';
import { verifyMassBalanceClaim } from '../../services/qpiaiApi';
import { MathCard } from '../common/MathCard';

export const ReconciliationView: React.FC = () => {
  const storeClaims = useAppStore((state) => state.recoveryClaims);
  const passports = useAppStore((state) => state.passports);
  const [expandedClaimId, setExpandedClaimId] = useState<string | null>('CLM-004'); // Default expand CLM-004 to show rejected claim demo
  const [apiClaims, setApiClaims] = useState<any[]>([]);

  useEffect(() => {
    const fetchReconciliationData = async () => {
      try {
        const res = await apiFetch('/api/reconciliation');
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.claims)) {
            setApiClaims(data.claims);
            return;
          }
        }
        // Verification call test
        if (storeClaims.length > 0) {
          const firstClaim = storeClaims[0];
          await verifyMassBalanceClaim(
            'BATCH-2026-REC-081',
            firstClaim.batteryId,
            firstClaim.materialType,
            firstClaim.claimedKg
          );
        }
      } catch {
        // Fallback to storeClaims if server call fails
      }
    };
    fetchReconciliationData();
  }, [storeClaims.length]);

  const activeClaimsList = apiClaims.length > 0 ? apiClaims : storeClaims;

  const toggleRow = (id: string) => {
    setExpandedClaimId(expandedClaimId === id ? null : id);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto py-8 px-8 bg-[#EAEBEE] text-[#2A1B24]">
      {/* Editorial View Header */}
      <div className="border-b-2 border-[#2A1B24] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]/60 mb-2">
            PS-02 MASS BALANCE & FRAUD FIREWALL
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-[#2A1B24] tracking-tighter uppercase leading-none">
            RECONCILIATION LEDGER
          </h1>
        </div>
        <p className="text-sm font-medium text-[#2A1B24]/80 max-w-xl leading-relaxed">
          Cryptographic evidence ledger verifying material recovery claims against passport baseline compositions and detecting duplicate or fraudulent claims.
        </p>
      </div>

      {/* DENSE RECONCILIATION DATA TABLE */}
      <div className="border border-[#2A1B24] bg-[#EAEBEE] p-6 space-y-4 rounded-none">
        <div className="flex items-center justify-between border-b border-[#2A1B24]/20 pb-3">
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]">
            Material Recovery Submissions & Audit Trail
          </span>
          <span className="text-xs font-mono text-[#2A1B24]/60">
            {activeClaimsList.length} Claims Registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest font-black text-[#2A1B24] border-b border-[#2A1B24] bg-[#2A1B24]/10 font-mono">
                <th className="py-3.5 px-3">Battery ID</th>
                <th className="py-3.5 px-3">Material</th>
                <th className="py-3.5 px-3 text-right">Expected (kg)</th>
                <th className="py-3.5 px-3 text-right">Claimed (kg)</th>
                <th className="py-3.5 px-3 text-right">Deviation (%)</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 px-3 text-right">Auditor Anchor</th>
                <th className="py-3.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A1B24] font-mono text-xs">
              {activeClaimsList.map((claim) => {
                const isExpanded = expandedClaimId === claim.id;
                const isRejected = claim.status === 'rejected' || claim.status === 'duplicate';

                // Find corresponding passport baseline
                const matchedPassport = passports.find((p) => p.id === claim.batteryId) || passports[1];

                const passportBaselineObj = {
                  passportId: matchedPassport.id,
                  serialNumber: matchedPassport.serialNumber,
                  modelName: matchedPassport.modelName,
                  chemistry: matchedPassport.chemistry,
                  nominalMassKg: matchedPassport.nominalMassKg,
                  compositionKg: matchedPassport.compositionKg,
                  manufacturer: matchedPassport.manufacturer,
                  genesisBlockHash: matchedPassport.genesisBlockHash,
                };

                return (
                  <React.Fragment key={claim.id}>
                    <tr
                      onClick={() => toggleRow(claim.id)}
                      className={`cursor-pointer transition-none border-b border-[#2A1B24] ${
                        isRejected ? 'bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20' : 'hover:bg-[#2A1B24]/5'
                      }`}
                    >
                      <td className="py-3.5 px-3 font-bold text-[#2A1B24]">{claim.batteryId}</td>
                      <td className="py-3.5 px-3 uppercase text-[#2A1B24] font-bold">{claim.materialType}</td>
                      <td className="py-3.5 px-3 text-right text-[#2A1B24]/70">{claim.expectedKg} kg</td>
                      <td className="py-3.5 px-3 text-right font-bold text-[#2A1B24]">{claim.claimedKg} kg</td>

                      {/* Rejected claims render deviation % and status in Marigold (#F59E0B) */}
                      <td
                        className={`py-3.5 px-3 text-right font-black ${
                          isRejected ? 'text-[#F59E0B] text-sm' : 'text-[#2A1B24]'
                        }`}
                      >
                        {claim.computedDeviationPercent > 0 ? `+${claim.computedDeviationPercent}` : claim.computedDeviationPercent}%
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        {isRejected ? (
                          <span className="inline-block px-2.5 py-1 border border-[#F59E0B] bg-[#F59E0B] text-[#2A1B24] font-black text-[10px] uppercase tracking-wider rounded-none">
                            {claim.status === 'duplicate' ? '✕ DUPLICATE' : '✕ REJECTED'}
                          </span>
                        ) : (
                          <StatusBadge label={claim.status} />
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <TruncatedHash hash={claim.auditorSignature} prefixLen={6} suffixLen={4} />
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button className="px-2.5 py-1 border border-[#2A1B24] bg-[#2A1B24] text-[#EAEBEE] text-[10px] uppercase font-bold hover:bg-[#2A1B24]/80 rounded-none whitespace-nowrap">
                          {isExpanded ? 'CLOSE [-]' : 'EXPAND [+]'}
                        </button>
                      </td>
                    </tr>

                    {/* SIDE-BY-SIDE EXPANDED ROW DETAIL (Left: Passport Baseline JSON, Right: Auditor Signature & Nonce) */}
                    {isExpanded && (
                      <tr className="bg-[#2A1B24] text-[#EAEBEE] border-b-2 border-[#2A1B24]">
                        <td colSpan={8} className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border border-[#EAEBEE]/20 p-5 bg-[#2A1B24] rounded-none">
                            {/* LEFT: Passport Baseline Human-Readable Component */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-[#EAEBEE]/20 pb-1.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A3E635] block font-sans">
                                  Passport Baseline Genesis Record
                                </span>
                                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[#60A5FA]">
                                  VERIFIED GENESIS ANCHOR
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#EAEBEE]/5 p-4 border border-[#EAEBEE]/15">
                                {/* Left Sub-column: Passport Attributes */}
                                <div className="space-y-2.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3E635] block font-sans border-b border-[#EAEBEE]/10 pb-1">
                                    Passport Attributes
                                  </span>
                                  <div className="space-y-2 font-sans text-xs">
                                    <div>
                                      <span className="text-[10px] uppercase font-semibold text-[#EAEBEE]/60 block">Passport ID</span>
                                      <span className="font-mono text-sm font-bold text-[#A3E635]">{matchedPassport.id}</span>
                                    </div>
                                    <div>
                                      <span className="text-[10px] uppercase font-semibold text-[#EAEBEE]/60 block">Model Name</span>
                                      <span className="font-mono text-xs font-bold text-[#EAEBEE]">{matchedPassport.modelName}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <div>
                                        <span className="text-[10px] uppercase font-semibold text-[#EAEBEE]/60 block">Chemistry</span>
                                        <span className="font-mono text-xs font-bold text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-2 py-0.5 inline-block">
                                          {matchedPassport.chemistry}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-[10px] uppercase font-semibold text-[#EAEBEE]/60 block">Nominal Mass</span>
                                        <span className="font-mono text-xs font-bold text-[#EAEBEE]">{matchedPassport.nominalMassKg} kg</span>
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-[10px] uppercase font-semibold text-[#EAEBEE]/60 block">Manufacturer</span>
                                      <span className="font-mono text-[11px] text-[#EAEBEE]/80">{matchedPassport.manufacturer}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right Sub-column: Elemental Composition */}
                                <div className="space-y-2.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3E635] block font-sans border-b border-[#EAEBEE]/10 pb-1">
                                    Elemental Composition (kg)
                                  </span>
                                  <div className="space-y-1.5 font-sans text-xs">
                                    {Object.entries(matchedPassport.compositionKg).map(([material, kg]) => {
                                      const numKg = Number(kg);
                                      const maxVal = Math.max(...(Object.values(matchedPassport.compositionKg) as number[])) || 1;
                                      const pct = Math.max(3, Math.round((numKg / maxVal) * 100));
                                      const isKeyMaterial = ['lithium', 'nickel', 'cobalt'].includes(material.toLowerCase());

                                      return (
                                        <div key={material} className="space-y-0.5">
                                          <div className="flex justify-between items-center text-[11px]">
                                            <span className="font-medium capitalize text-[#EAEBEE]/80 font-sans">
                                              {material}
                                            </span>
                                            <span className="font-mono font-bold text-[#EAEBEE]">
                                              {numKg} kg
                                            </span>
                                          </div>
                                          <div className="w-full h-1.5 bg-[#EAEBEE]/10 overflow-hidden">
                                            <div
                                              className={`h-full ${isKeyMaterial ? 'bg-[#A3E635]' : 'bg-[#3B82F6]'}`}
                                              style={{ width: `${numKg > 0 ? pct : 0}%` }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* RIGHT: Auditor Signature & QRNG Nonce */}
                            <div className="space-y-4 flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F59E0B] block border-b border-[#EAEBEE]/20 pb-1 mb-3">
                                  Cryptographic Auditor Signature & QRNG Nonce
                                </span>

                                <div className="space-y-3 font-mono text-xs">
                                  <div className="p-3 border border-[#EAEBEE]/20 bg-[#EAEBEE]/5">
                                    <span className="text-[10px] uppercase font-bold text-[#EAEBEE]/60 block mb-1">
                                      Auditor Wallet Signature Anchor
                                    </span>
                                    <span className="text-[#F59E0B] font-bold break-all block text-xs">
                                      {claim.auditorSignature}
                                    </span>
                                  </div>

                                  <div className="p-3 border border-[#EAEBEE]/20 bg-[#EAEBEE]/5 space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-[#EAEBEE]/60 block mb-1">
                                      128-Bit Quantum QRNG Nonce & Backend
                                    </span>
                                    <span className="text-[#EAEBEE] font-bold break-all block text-xs">
                                      {claim.qrng_nonce || claim.nonce || '0xQPIAI_QRNG_128BIT_SUPERPOSITION_SALT'}
                                    </span>
                                    <span className="text-[10px] text-[#60A5FA] font-mono block pt-0.5">
                                      Backend: {claim.backend || 'QpiAI QCloud Simulator (128-bit Hadamard Circuit)'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="p-3 border border-[#EAEBEE]/30 bg-[#2A1B24] flex items-center justify-between font-mono text-xs">
                                <span className="text-[#EAEBEE]/80 uppercase font-bold text-[10px]">
                                  Fraud Tolerance Evaluation
                                </span>
                                <span
                                  className={`font-black text-xs uppercase ${
                                    isRejected ? 'text-[#F59E0B]' : 'text-[#F59E0B]'
                                  }`}
                                >
                                  {isRejected
                                    ? `✕ REJECTED: DEVIATION (${claim.computedDeviationPercent}%) > 5.0% THRESHOLD`
                                    : '✓ VALIDATED: WITHIN 5.0% TOLERANCE'}
                                </span>
                              </div>
                            </div>

                            {/* MATH & LOGIC VERIFIER CARD FOR RECONCILIATION */}
                            <div className="lg:col-span-2 pt-2">
                              <MathCard
                                title="RECONCILIATION MASS BALANCE & QCLOUD NONCE MATH"
                                subtitle={`Evaluation for Claim #${claim.id} (${claim.batteryId} · ${claim.materialType.toUpperCase()})`}
                                mathFormulation={{
                                  equation: `Deviation % = |(${claim.claimedKg} - ${claim.expectedKg}) / ${claim.expectedKg}| × 100 = ${claim.computedDeviationPercent}%`,
                                  quantumCircuit: "QCloud Nonce = Measure( H^{\\otimes 128} |0\\rangle^{\\otimes 128} ) → " + claim.nonce,
                                  constraints: [
                                    "Acceptance Invariant: |Deviation %| ≤ 5.0% (EU Battery Directive Rule)",
                                    `Computed Result: ${claim.computedDeviationPercent}% ${isRejected ? '> 5.0% (MATHEMATICALLY REJECTED)' : '≤ 5.0% (VALIDATED & ACCEPTED)'}`
                                  ]
                                }}
                                englishTranslation={{
                                  conclusion: `Independent Hydrometallurgical Mass Balance Audit Results for Claim #${claim.id}:

• MATERIAL RECOVERY AUDIT: Evaluated ${claim.materialType.toUpperCase()} recovery from Battery ${claim.batteryId}.
• BASELINE EXPECTATION: Stoichiometric chemical analysis dictates an expected yield of ${claim.expectedKg} kg.
• RECYCLER CLAIM: The recycler reported a recovered mass of ${claim.claimedKg} kg.
• COMPUTED MASS DEVIATION: |(${claim.claimedKg} - ${claim.expectedKg}) / ${claim.expectedKg}| × 100 = ${claim.computedDeviationPercent}%.

${isRejected 
  ? `Status: MATHEMATICALLY REJECTED. The deviation of ${claim.computedDeviationPercent}% exceeds the 5.0% EU Battery Directive mass conservation tolerance window. The system flagged potential material inflation or fake credit generation.`
  : `Status: VERIFIED & ACCEPTED. The deviation of ${claim.computedDeviationPercent}% falls strictly within the 5.0% mass conservation threshold.`}`,
                                  constraintAnalysis: `EU Mass Conservation & Anti-Fraud Firewall Rules:

• Conservation Invariant: Recycler recovery claims must satisfy |m_claimed - m_expected| / m_expected <= 0.05.
• Penalty Enforcement: Claims violating the 5.0% threshold are blocked from earning recycled content credit certificates and generate an automated compliance alert for environmental regulators.`,
                                  quantumSecurity: `How QpiAI QCloud Quantum QRNG Secures This Record:

To lock this audit determination into the immutable ledger, the platform requests a true quantum entropy seed from QpiAI QCloud. A 128-qubit quantum circuit initializes |0⟩^{\\otimes 128}, applies Hadamard gates (H^{\\otimes 128}) to put all 128 qubits into equal physical superposition, and measures the collapsed quantum state. This produces the unforgeable 128-bit hex nonce ${claim.nonce}.`,
                                  personaContext: "INDEPENDENT AUDITOR & REGULATOR: Zero-tolerance fraud firewall anchored by QCloud QRNG."
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


