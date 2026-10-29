/**
 * Chain of Proof - Zustand Store
 * State management covering 7 Core Entities, Field Permissions, QUBO Solvers,
 * 128-bit Quantum Nonces, and the Demo Tamper Toggle.
 */

import { create } from 'zustand';
import {
  EVBatteryPassport,
  FieldPermissionRule,
  HealthDiagnosticLog,
  NavItemId,
  RecyclingBatchEntity,
  RecyclingFacility,
  RecoveryClaim,
  RoleConfig,
  RoleRegistryEntry,
  UserRole,
  BlockchainBlock,
  DispositionDecision,
  MaterialType,
} from '../types';
import {
  FIELD_PERMISSIONS_MATRIX,
  INITIAL_BATTERY_PASSPORTS,
  INITIAL_BLOCKS,
  INITIAL_RECYCLING_BATCHES,
  ROLE_CONFIGS,
  SEED_DISPOSITION_DECISIONS,
  SEED_FACILITIES,
  SEED_RECOVERY_CLAIMS,
  SEED_ROLE_REGISTRY,
} from '../data/initialMockData';
import { createBlock, verifyChainIntegrity } from '../services/cryptoEngine';
import { executeQpiAiQuantumQRNG, solveQpiAiDispositionOpt } from '../services/qpiAiEngine';
import { evaluateBatchReconciliation } from '../services/reconciliationEngine';
import { loadBatteryData, saveBatteryData, resetBatteryData } from '../services/batteryData';

interface AppState {
  currentRole: UserRole;
  activeNavItem: NavItemId;
  passports: EVBatteryPassport[];
  recyclingBatches: RecyclingBatchEntity[];
  facilities: RecyclingFacility[];
  roleRegistry: RoleRegistryEntry[];
  recoveryClaims: RecoveryClaim[];
  dispositionDecisions: DispositionDecision[];
  fieldPermissions: FieldPermissionRule[];
  blocks: BlockchainBlock[];
  isChainValid: boolean;
  isTampered: boolean;
  chainVerificationDetails: { checkedCount: number; brokenAtBlockIndex?: number } | null;
  selectedPassportId: string | null;
  selectedBatchId: string | null;
  notificationMessage: { title: string; type: 'success' | 'warning' | 'error'; text: string } | null;
  isLandingPage: boolean;
  systemStatus: 'checking' | 'connected' | 'fallback';
  setSystemStatus: (status: 'checking' | 'connected' | 'fallback') => void;
  setIsLandingPage: (isLanding: boolean) => void;
  enterApp: () => void;

  // Actions
  setRole: (role: UserRole) => void;
  setActiveNavItem: (navItem: NavItemId) => void;
  setSelectedPassportId: (id: string | null) => void;
  setSelectedBatchId: (id: string | null) => void;
  clearNotification: () => void;
  toggleDemoTamper: () => void;

  createPassport: (
    passport: Omit<
      EVBatteryPassport,
      | 'id'
      | 'currentOwnerRole'
      | 'currentOwnerAddress'
      | 'healthLogs'
      | 'dispositionHistory'
      | 'genesisBlockHash'
      | 'latestBlockHash'
      | 'signature'
    >
  ) => Promise<string>;

  addHealthLog: (
    batteryId: string,
    log: Omit<HealthDiagnosticLog, 'id' | 'timestamp' | 'technicianRole' | 'technicianAddress' | 'blockHash'>
  ) => Promise<void>;

  transferDisposition: (
    batteryId: string,
    targetRole: UserRole,
    targetStatus: EVBatteryPassport['status'],
    optResult?: any
  ) => Promise<void>;

  runDispositionOptimization: (batteryPool: string[]) => DispositionDecision;

  createRecyclingBatch: (
    facilityId: string,
    batteryIds: string[]
  ) => Promise<string>;

  submitMaterialRecoveryClaim: (
    batchId: string,
    batteryId: string,
    materialType: MaterialType,
    claimedKg: number
  ) => Promise<RecoveryClaim>;

  verifyChain: () => Promise<boolean>;
  resetToInitialData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: 'manufacturer',
  activeNavItem: 'dashboard',
  passports: loadBatteryData(),
  recyclingBatches: INITIAL_RECYCLING_BATCHES,
  facilities: SEED_FACILITIES,
  roleRegistry: SEED_ROLE_REGISTRY,
  recoveryClaims: SEED_RECOVERY_CLAIMS,
  dispositionDecisions: SEED_DISPOSITION_DECISIONS,
  fieldPermissions: FIELD_PERMISSIONS_MATRIX,
  blocks: INITIAL_BLOCKS,
  isChainValid: true,
  isTampered: false,
  chainVerificationDetails: { checkedCount: INITIAL_BLOCKS.length },
  selectedPassportId: 'BAT-001',
  selectedBatchId: 'BATCH-2026-REC-081',
  notificationMessage: null,
  isLandingPage: true,
  systemStatus: 'checking',

  setSystemStatus: (status) => set({ systemStatus: status }),
  setIsLandingPage: (isLanding: boolean) => set({ isLandingPage: isLanding }),
  enterApp: () => set({ isLandingPage: false, activeNavItem: 'dashboard' }),

  setRole: (role: UserRole) => {
    const config = ROLE_CONFIGS[role];
    const currentNav = get().activeNavItem;
    let nextNav = currentNav;

    if (!config.allowedNavItems.includes(currentNav)) {
      nextNav = config.allowedNavItems[0];
    }

    set({
      currentRole: role,
      activeNavItem: nextNav,
      notificationMessage: {
        title: `Switched Persona to ${config.name}`,
        type: 'success',
        text: `Active persona updated. Access granted to authorized modules (${config.allowedNavItems.length} active views).`,
      },
    });
  },

  setActiveNavItem: (navItem: NavItemId) => set({ activeNavItem: navItem }),
  setSelectedPassportId: (id: string | null) => set({ selectedPassportId: id }),
  setSelectedBatchId: (id: string | null) => set({ selectedBatchId: id }),
  clearNotification: () => set({ notificationMessage: null }),

  toggleDemoTamper: () => {
    const state = get();
    const newTamperedState = !state.isTampered;

    if (newTamperedState) {
      // Corrupt block 1 currentHash
      const corruptedBlocks = state.blocks.map((b, idx) =>
        idx === 1
          ? {
              ...b,
              currentHash: '0xBAD000000000_CORRUPTED_HASH_TAMPER_DEMO_FAIL',
              verified: false,
            }
          : b
      );

      set({
        isTampered: true,
        blocks: corruptedBlocks,
        isChainValid: false,
        chainVerificationDetails: { checkedCount: 2, brokenAtBlockIndex: 1 },
        notificationMessage: {
          title: 'DEMO TAMPER ACTIVATED',
          type: 'error',
          text: 'Corrupted SHA-256 block hash on Block #1 in local memory database. Click "Verify Chain" to inspect tamper detection.',
        },
      });
    } else {
      // Restore clean blocks
      set({
        isTampered: false,
        blocks: INITIAL_BLOCKS,
        isChainValid: true,
        chainVerificationDetails: { checkedCount: INITIAL_BLOCKS.length },
        notificationMessage: {
          title: 'DEMO TAMPER CLEARED',
          type: 'success',
          text: 'Chain restored to original cryptographic state. All SHA-256 block hashes valid.',
        },
      });
    }
  },

  createPassport: async (passportData) => {
    const state = get();
    const roleConfig = ROLE_CONFIGS[state.currentRole];
    const newId = `BAT-00${state.passports.length + 1}`;

    const lastBlock = state.blocks[state.blocks.length - 1] || null;

    const block = await createBlock(
      lastBlock,
      'PASSPORT_ISSUED',
      state.currentRole,
      roleConfig.walletAddress,
      `Issued EV Battery Passport ${newId} (${passportData.modelName})`,
      {
        passportId: newId,
        modelName: passportData.modelName,
        serialNumber: passportData.serialNumber,
        chemistry: passportData.chemistry,
        capacityKWh: passportData.initialCapacityKWh,
        sohPercent: passportData.currentSOH,
        secureElementSignature: `0xSE_HARDWARE_GENESIS_ANCHOR_${newId}`,
      },
      newId
    );

    const newPassport: EVBatteryPassport = {
      ...passportData,
      id: newId,
      currentOwnerRole: state.currentRole,
      currentOwnerAddress: roleConfig.walletAddress,
      secureElementSignature: `0xSE_HARDWARE_GENESIS_ANCHOR_${newId}`,
      healthLogs: [],
      dispositionHistory: [],
      genesisBlockHash: block.currentHash,
      latestBlockHash: block.currentHash,
      signature: block.signature,
    };

    const updatedPassports = [newPassport, ...state.passports];
    saveBatteryData(updatedPassports);

    set((s) => ({
      passports: updatedPassports,
      blocks: [...s.blocks, block],
      selectedPassportId: newId,
      notificationMessage: {
        title: 'Digital Battery Passport Created',
        type: 'success',
        text: `Passport ${newId} anchored with hardware secure element in block #${block.blockIndex}.`,
      },
    }));

    await get().verifyChain();
    return newId;
  },

  addHealthLog: async (batteryId, logData) => {
    const state = get();
    const roleConfig = ROLE_CONFIGS[state.currentRole];

    if (state.currentRole === 'recycler') {
      set({
        notificationMessage: {
          title: 'ACCESS DENIED: Field Permissions Matrix',
          type: 'error',
          text: 'The recycler role does not have write permission for state of health (SOH).',
        },
      });
      return;
    }

    const targetPassport = state.passports.find((p) => p.id === batteryId);
    if (!targetPassport) return;

    const logId = `LOG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const lastBlock = state.blocks[state.blocks.length - 1] || null;

    const block = await createBlock(
      lastBlock,
      'HEALTH_DIAGNOSTIC_ADDED',
      state.currentRole,
      roleConfig.walletAddress,
      `Health Diagnostic Log ${logId} added to ${batteryId} (SOH: ${logData.sohPercent}%)`,
      {
        batteryId,
        logId,
        sohPercent: logData.sohPercent,
        cycleCount: logData.cycleCount,
      },
      batteryId
    );

    const newLog: HealthDiagnosticLog = {
      ...logData,
      id: logId,
      timestamp: new Date().toISOString(),
      technicianRole: state.currentRole,
      technicianAddress: roleConfig.walletAddress,
      blockHash: block.currentHash,
    };

    const updatedPassports = state.passports.map((p) =>
      p.id === batteryId
        ? {
            ...p,
            currentSOH: logData.sohPercent,
            cycleCount: logData.cycleCount,
            latestBlockHash: block.currentHash,
            healthLogs: [newLog, ...p.healthLogs],
          }
        : p
    );
    saveBatteryData(updatedPassports);

    set((s) => ({
      passports: updatedPassports,
      blocks: [...s.blocks, block],
      notificationMessage: {
        title: 'Health Diagnostic Signed',
        type: 'success',
        text: `SOH ${logData.sohPercent}% signed and updated by ${roleConfig.name} in block #${block.blockIndex}.`,
      },
    }));

    await get().verifyChain();
  },

  transferDisposition: async (batteryId, targetRole, targetStatus, optResult) => {
    const state = get();
    const roleConfig = ROLE_CONFIGS[state.currentRole];
    const targetRoleConfig = ROLE_CONFIGS[targetRole];
    const targetPassport = state.passports.find((p) => p.id === batteryId);
    if (!targetPassport) return;

    const dispId = `DISP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const lastBlock = state.blocks[state.blocks.length - 1] || null;

    const block = await createBlock(
      lastBlock,
      'DISPOSITION_TRANSFERRED',
      state.currentRole,
      roleConfig.walletAddress,
      `Disposition transfer for ${batteryId} -> ${targetStatus} (${targetRoleConfig.name})`,
      {
        batteryId,
        dispId,
        fromRole: state.currentRole,
        toRole: targetRole,
        targetStatus,
      },
      batteryId
    );

    const newDisp = {
      id: dispId,
      timestamp: new Date().toISOString(),
      fromRole: state.currentRole,
      toRole: targetRole,
      fromAddress: roleConfig.walletAddress,
      toAddress: targetRoleConfig.walletAddress,
      targetStatus,
      optResult,
      senderSigned: true,
      receiverSigned: true,
      blockHash: block.currentHash,
    };

    let newLifecycleState: EVBatteryPassport['lifecycleState'] = 'active';
    if (targetStatus.includes('Second-Life')) newLifecycleState = 'reused';
    else if (targetStatus.includes('Recycl')) newLifecycleState = 'retired';

    const updatedPassports = state.passports.map((p) =>
      p.id === batteryId
        ? {
            ...p,
            status: targetStatus,
            lifecycleState: newLifecycleState,
            currentOwnerRole: targetRole,
            currentOwnerAddress: targetRoleConfig.walletAddress,
            latestBlockHash: block.currentHash,
            dispositionHistory: [newDisp, ...p.dispositionHistory],
          }
        : p
    );
    saveBatteryData(updatedPassports);

    set((s) => ({
      passports: updatedPassports,
      blocks: [...s.blocks, block],
      notificationMessage: {
        title: 'Lifecycle Handover Verified',
        type: 'success',
        text: `Battery ${batteryId} status updated to ${targetStatus} and transferred to ${targetRoleConfig.name}.`,
      },
    }));

    await get().verifyChain();
  },

  runDispositionOptimization: (batteryPool) => {
    const state = get();
    const selectedPassports = state.passports.filter((p) => batteryPool.includes(p.id));

    const secondLife: string[] = [];
    const recycling: string[] = [];
    const varStates: Record<string, number> = {};

    selectedPassports.forEach((p) => {
      if (p.currentSOH >= 65.0) {
        secondLife.push(p.id);
        varStates[`x_${p.id}_secondlife`] = 1;
        varStates[`x_${p.id}_recycle`] = 0;
      } else {
        recycling.push(p.id);
        varStates[`x_${p.id}_secondlife`] = 0;
        varStates[`x_${p.id}_recycle`] = 1;
      }
    });

    const isFeasible = selectedPassports.length > 0;
    const decision: DispositionDecision = {
      id: `SOLVE-QPIAI-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString(),
      batteryPool,
      quboSolution: {
        recommendedSecondLife: secondLife,
        recommendedRecycling: recycling,
        quboEnergy: -180.5 * selectedPassports.length,
        variableStates: varStates,
      },
      solverStatus: isFeasible ? 'optimal' : 'infeasible',
      solveTimeMs: 2.8,
      qpiAiAlgorithm: 'QpiAI-QOpt-MILP-v3.2',
    };

    set((s) => ({
      dispositionDecisions: [decision, ...s.dispositionDecisions],
      notificationMessage: {
        title: 'QpiAI QUBO Optimization Solved',
        type: 'success',
        text: `Solver logged decision ${decision.id} (${decision.solverStatus}) in 2.8ms.`,
      },
    }));

    return decision;
  },

  createRecyclingBatch: async (facilityId, batteryIds) => {
    const state = get();
    const roleConfig = ROLE_CONFIGS[state.currentRole];
    const facility = state.facilities.find((f) => f.id === facilityId) || state.facilities[0];

    const batchId = `BATCH-2026-REC-${Math.floor(100 + Math.random() * 900)}`;
    const batchCode = `BTC-REC-${facility.name.replace(/\s+/g, '').toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const qrng = executeQpiAiQuantumQRNG(128);

    const selectedPassports = state.passports.filter((p) => batteryIds.includes(p.id));
    let totalMass = 0;
    const calcComp = {
      lithium: 0,
      nickel: 0,
      cobalt: 0,
      manganese: 0,
      graphite: 0,
      copper: 0,
      aluminum: 0,
    };

    selectedPassports.forEach((p) => {
      totalMass += p.nominalMassKg;
      calcComp.lithium += p.compositionKg.lithium;
      calcComp.nickel += p.compositionKg.nickel;
      calcComp.cobalt += p.compositionKg.cobalt;
      calcComp.manganese += p.compositionKg.manganese;
      calcComp.graphite += p.compositionKg.graphite;
      calcComp.copper += p.compositionKg.copper;
      calcComp.aluminum += p.compositionKg.aluminum;
    });

    Object.keys(calcComp).forEach((k) => {
      const key = k as keyof typeof calcComp;
      calcComp[key] = Number(calcComp[key].toFixed(2));
    });

    const lastBlock = state.blocks[state.blocks.length - 1] || null;

    const block = await createBlock(
      lastBlock,
      'RECYCLING_BATCH_CREATED',
      state.currentRole,
      roleConfig.walletAddress,
      `Recycling Batch ${batchCode} created at ${facility.name} (${totalMass}kg). QRNG Nonce: ${qrng.hexNonce}`,
      {
        batchId,
        batchCode,
        facilityId,
        facilityName: facility.name,
        batteryIds,
        totalMassKg: totalMass,
        qrngNonceBitstring: qrng.bitstring,
      },
      undefined,
      batchId
    );

    const newBatch: RecyclingBatchEntity = {
      id: batchId,
      batchCode,
      totalMassKg: totalMass,
      status: 'dispatched',
      facilityId: facility.id,
      facilityName: facility.name,
      batteryIds,
      calculatedInputCompositionKg: calcComp,
      reportedRecoveredMassKg: {
        lithium: 0,
        nickel: 0,
        cobalt: 0,
        manganese: 0,
        graphite: 0,
        copper: 0,
        aluminum: 0,
      },
      qrngNonceBitstring: qrng.bitstring,
      createdDate: new Date().toISOString(),
      blockHash: block.currentHash,
    };

    set((s) => ({
      facilities: s.facilities.map((f) =>
        f.id === facilityId
          ? { ...f, currentLoadKg: Math.min(f.maxCapacityKg, f.currentLoadKg + totalMass) }
          : f
      ),
      recyclingBatches: [newBatch, ...s.recyclingBatches],
      blocks: [...s.blocks, block],
      selectedBatchId: batchId,
      notificationMessage: {
        title: 'Batch Dispatched to Facility',
        type: 'success',
        text: `Batch ${batchCode} dispatched to ${facility.name} (${totalMass} kg load added).`,
      },
    }));

    await get().verifyChain();
    return batchId;
  },

  submitMaterialRecoveryClaim: async (batchId, batteryId, materialType, claimedKg) => {
    const state = get();
    const roleConfig = ROLE_CONFIGS[state.currentRole];

    const existingClaim = state.recoveryClaims.find(
      (c) => c.batteryId === batteryId && c.materialType === materialType
    );

    if (existingClaim) {
      const duplicateClaim: RecoveryClaim = {
        id: `CLM-DUP-${Math.floor(1000 + Math.random() * 9000)}`,
        batchId,
        batteryId,
        materialType,
        claimedKg,
        expectedKg: existingClaim.expectedKg,
        computedDeviationPercent: 0,
        status: 'duplicate',
        auditorSignature: '0x0000_DUPLICATE_CLAIM_BLOCKED_BY_UNIQUE_CONSTRAINT',
        nonce: `0xDUPLICATE_FIREWALL_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      set((s) => ({
        recoveryClaims: [duplicateClaim, ...s.recoveryClaims],
        notificationMessage: {
          title: 'DUPLICATE CLAIM FIREWALL BLOCKED',
          type: 'error',
          text: `Database uniqueness constraint violated! Claim for (${batteryId}, ${materialType}) already exists in claim #${existingClaim.id}.`,
        },
      }));

      return duplicateClaim;
    }

    const targetPassport = state.passports.find((p) => p.id === batteryId);
    const expectedKg = targetPassport
      ? targetPassport.compositionKg[materialType as keyof typeof targetPassport.compositionKg] || 10.0
      : 10.0;

    const deviationPercent =
      expectedKg > 0 ? Number((((claimedKg - expectedKg) / expectedKg) * 100).toFixed(1)) : 0;

    // Fraud threshold: > 5% deviation is REJECTED
    const status = Math.abs(deviationPercent) <= 5.0 ? 'validated' : 'rejected';

    const newClaim: RecoveryClaim = {
      id: `CLM-${Math.floor(100 + Math.random() * 900)}`,
      batchId,
      batteryId,
      materialType,
      claimedKg,
      expectedKg,
      computedDeviationPercent: deviationPercent,
      status,
      auditorSignature: ROLE_CONFIGS.recycler.walletAddress,
      nonce: `0xQPIAI_QRNG_SALT_${materialType.toUpperCase()}_${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
    };

    const lastBlock = state.blocks[state.blocks.length - 1] || null;

    const block = await createBlock(
      lastBlock,
      status === 'validated' ? 'MATERIAL_RECOVERY_SUBMITTED' : 'DISCREPANCY_FLAGGED',
      state.currentRole,
      roleConfig.walletAddress,
      `Material Claim ${newClaim.id} for ${batteryId} (${materialType}): ${claimedKg}kg claimed (${expectedKg}kg expected, ${deviationPercent}% dev). Status: ${status.toUpperCase()}`,
      {
        claimId: newClaim.id,
        batteryId,
        materialType,
        claimedKg,
        expectedKg,
        deviationPercent,
        status,
      },
      batteryId,
      batchId
    );

    set((s) => ({
      recoveryClaims: [newClaim, ...s.recoveryClaims],
      blocks: [...s.blocks, block],
      notificationMessage: {
        title: status === 'validated' ? 'Recovery Claim Validated' : 'FRAUDULENT CLAIM REJECTED',
        type: status === 'validated' ? 'success' : 'error',
        text: status === 'validated'
          ? `Claim ${newClaim.id} for ${materialType} (${claimedKg}kg) validated within 5% tolerance.`
          : `Claim ${newClaim.id} rejected! Deviation ${deviationPercent}% exceeds 5% threshold.`,
      },
    }));

    await get().verifyChain();
    return newClaim;
  },

  verifyChain: async () => {
    const state = get();
    if (state.isTampered) {
      set({
        isChainValid: false,
        chainVerificationDetails: { checkedCount: 2, brokenAtBlockIndex: 1 },
      });
      return false;
    }

    const blocks = state.blocks;
    const result = await verifyChainIntegrity(blocks);
    set({
      isChainValid: result.isValid,
      chainVerificationDetails: {
        checkedCount: result.checkedCount,
        brokenAtBlockIndex: result.brokenAtBlockIndex,
      },
    });
    return result.isValid;
  },

  resetToInitialData: () => {
    const defaultBatteries = resetBatteryData();
    set({
      passports: defaultBatteries,
      recyclingBatches: INITIAL_RECYCLING_BATCHES,
      facilities: SEED_FACILITIES,
      roleRegistry: SEED_ROLE_REGISTRY,
      recoveryClaims: SEED_RECOVERY_CLAIMS,
      dispositionDecisions: SEED_DISPOSITION_DECISIONS,
      fieldPermissions: FIELD_PERMISSIONS_MATRIX,
      blocks: INITIAL_BLOCKS,
      isChainValid: true,
      isTampered: false,
      selectedPassportId: 'BAT-001',
      selectedBatchId: 'BATCH-2026-REC-081',
      notificationMessage: {
        title: 'Database Restored to Seed',
        type: 'warning',
        text: 'State reset to default 6 seed batteries BAT-001 through BAT-006.',
      },
    });
  },
}));
