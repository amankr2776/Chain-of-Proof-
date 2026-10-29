/**
 * Chain of Proof - Core Domain Types
 * Defines the Seven Core Entities and Field Permissions Matrix.
 */

export type UserRole =
  | 'manufacturer'
  | 'second_life'
  | 'recycler';

export type NavItemId =
  | 'dashboard'
  | 'passport_studio'
  | 'disposition_console'
  | 'recycling_hub'
  | 'reconciliation'
  | 'chain_explorer';

export interface RoleConfig {
  id: UserRole;
  name: string;
  organization: string;
  walletAddress: string;
  publicKey: string;
  badge: string;
  allowedNavItems: NavItemId[];
}

export type BatteryChemistry = 'NMC' | 'LFP' | 'NMC 811' | 'NMC 622' | 'NCMA';

export type BatteryLifecycleState = 'active' | 'retired' | 'recycled' | 'reused';

export type BatteryStatus =
  | 'First-Life (EV Active)'
  | 'Pending Assessment'
  | 'Repair/Refurbish'
  | 'Second-Life (Grid BESS)'
  | 'End-of-Life / Retired'
  | 'Recycling Queue'
  | 'Recycled & Reconciled';

export interface ElementalCompositionKg {
  lithium: number;
  nickel: number;
  cobalt: number;
  manganese: number;
  graphite: number;
  copper: number;
  aluminum: number;
}

export interface HealthDiagnosticLog {
  id: string;
  timestamp: string;
  sohPercent: number;
  cycleCount: number;
  internalResistanceMOhms: number;
  thermalExcursions: number;
  repairedModules: string[];
  notes: string;
  technicianRole: UserRole;
  technicianAddress: string;
  blockHash: string;
}

export interface DispositionRecord {
  id: string;
  timestamp: string;
  fromRole: UserRole;
  toRole: UserRole;
  fromAddress: string;
  toAddress: string;
  targetStatus: BatteryStatus;
  optResult?: {
    recommendation: 'Second-Life Grid BESS' | 'Direct Recycling';
    economicValueUsd: number;
    co2AvoidedKg: number;
    optimizationScore: number;
    qpiAiOptRunId: string;
  };
  senderSigned: boolean;
  receiverSigned: boolean;
  blockHash: string;
}

// 1. Core Entity: Battery Passport
export interface EVBatteryPassport {
  id: string; // e.g. BAT-001
  serialNumber: string;
  modelName: string;
  manufacturer: string;
  manufacturerAddress: string;
  productionDate: string;
  chemistry: BatteryChemistry;
  initialCapacityKWh: number;
  currentSOH: number;
  cycleCount: number;
  nominalMassKg: number;
  status: BatteryStatus;
  lifecycleState: BatteryLifecycleState;
  carbonFootprintKgCO2: number;
  compositionKg: ElementalCompositionKg;
  cathodeRecipeSecret?: string; // Proprietary OEM Cathode ratio
  currentOwnerRole: UserRole;
  currentOwnerAddress: string;
  location: string;
  secureElementSignature: string; // Hardware Genesis Anchor
  healthLogs: HealthDiagnosticLog[];
  dispositionHistory: DispositionRecord[];
  genesisBlockHash: string;
  latestBlockHash: string;
  signature: string;
}

// 2. Core Entity: Lifecycle Event (Append-Only Chain)
export type LifecycleEventType =
  | 'repair'
  | 'custody_transfer'
  | 'soh_update'
  | 'retirement'
  | 'genesis_issued'
  | 'batch_dispatched'
  | 'recovery_claimed';

export interface LifecycleEvent {
  id: string;
  batteryId: string;
  eventType: LifecycleEventType;
  actingAddress: string;
  actingRole: UserRole;
  payloadData: Record<string, any>;
  quantumNonce: string; // QpiAI Quantum QRNG bitstring
  previousEventHash: string;
  currentEventHash: string;
  actorSignature: string;
  timestamp: string;
}

// 3. Core Entity: Role Registry & Staked Bonds
export interface RoleRegistryEntry {
  walletAddress: string;
  role: UserRole;
  organizationName: string;
  hasActiveStakedBond: boolean;
  stakedBondAmountEur: number;
  registeredTimestamp: string;
  status: 'active' | 'revoked';
}

// 4. Core Entity: Field Permissions Matrix
export type PermissionLevel = 'READ_WRITE' | 'READ_ONLY' | 'NO_ACCESS';

export interface FieldPermissionRule {
  fieldId: 'composition' | 'cathode_recipe' | 'state_of_health' | 'disposition' | 'attestations';
  label: string;
  description: string;
  permissions: Record<UserRole, PermissionLevel>;
}

// 5. Core Entity: Recycling Batch
export type BatchStatus = 'created' | 'dispatched' | 'processing' | 'claimed' | 'Reconciled & Passed' | 'Flagged / Discrepancy';

export interface RecyclingBatchEntity {
  id: string; // e.g. BATCH-2026-REC-081
  batchCode: string; // e.g. BTC-REC-ALPHA-01
  totalMassKg: number;
  totalInputMassKg?: number;
  status: BatchStatus;
  facilityId?: string; // Facility Alpha or Beta
  facilityName?: string;
  batteryIds: string[];
  calculatedInputCompositionKg: ElementalCompositionKg;
  reportedRecoveredMassKg: ElementalCompositionKg;
  reconciliationDetails?: ReconciliationResult;
  qrngNonceBitstring: string;
  createdDate: string;
  blockHash: string;
}

// 6. Core Entity: Licensed Recycling Facility
export interface RecyclingFacility {
  id: string;
  name: string; // e.g. Alpha or Beta
  licensedChemistries: BatteryChemistry[];
  maxCapacityKg: number;
  currentLoadKg: number;
  costPerKgUsd: number;
}

// 7. Core Entity: Material Recovery Claim (Unique constraint on batteryId + materialType)
export type MaterialType = 'lithium' | 'nickel' | 'copper';

export interface RecoveryClaim {
  id: string;
  batchId: string;
  batteryId: string; // Derives from specific battery
  materialType: MaterialType;
  claimedKg: number;
  expectedKg: number;
  computedDeviationPercent: number;
  status: 'validated' | 'rejected' | 'duplicate';
  auditorSignature: string;
  nonce: string;
  timestamp: string;
}

// 8. Core Entity: Disposition Decision (QUBO / QpiAI Solve Log)
export interface DispositionDecision {
  id: string;
  timestamp: string;
  batteryPool: string[];
  quboSolution: {
    recommendedSecondLife: string[];
    recommendedRecycling: string[];
    quboEnergy: number;
    variableStates: Record<string, number>;
  };
  solverStatus: 'optimal' | 'feasible' | 'infeasible';
  solveTimeMs: number;
  qpiAiAlgorithm: string;
}

export interface ReconciliationResult {
  overallChecksumValid: boolean;
  conservationDeltaKg: number;
  massRecoveryEfficiencyPercent: number;
  elementalDetails: Record<
    keyof ElementalCompositionKg,
    {
      elementName: string;
      inputKg: number;
      recoveredKg: number;
      deltaKg: number;
      recoveryRatePercent: number;
      maxAllowedEfficiencyPercent: number;
      maxAllowedRecoveryKg: number;
      status: 'PASS' | 'EXCEEDS_PHYSICAL_LIMIT' | 'DEFICIT_WARNING';
    }
  >;
  discrepancyReason?: string;
  evaluatedAt: string;
  auditorVerified?: boolean;
}

export type BlockchainEventType =
  | 'PASSPORT_ISSUED'
  | 'HEALTH_DIAGNOSTIC_ADDED'
  | 'DISPOSITION_TRANSFERRED'
  | 'RECYCLING_BATCH_CREATED'
  | 'MATERIAL_RECOVERY_SUBMITTED'
  | 'RECONCILIATION_VERIFIED'
  | 'DISCREPANCY_FLAGGED';

export interface BlockchainBlock {
  blockIndex: number;
  timestamp: string;
  previousHash: string;
  currentHash: string;
  eventType: BlockchainEventType;
  actorRole: UserRole;
  actorAddress: string;
  batteryId?: string;
  batchId?: string;
  payloadSummary: string;
  payloadData: Record<string, any>;
  signature: string;
  verified: boolean;
}
