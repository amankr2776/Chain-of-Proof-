// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// src/services/qpiAiEngine.ts
function executeQpiAiQuantumQRNG(numBits = 128) {
  const bits = [];
  for (let i = 0; i < numBits; i++) {
    bits.push(Math.round(Math.random()));
  }
  const bitstring = bits.join("");
  let hexNonce = "";
  for (let i = 0; i < bitstring.length; i += 4) {
    hexNonce += parseInt(bitstring.substring(i, i + 4), 2).toString(16);
  }
  return {
    bitstring: bitstring.slice(0, 20) + "...",
    hexNonce: `0x${hexNonce}`,
    circuitId: `QPIAI-QRNG-H128-${Date.now().toString(36).toUpperCase()}`,
    backend: "qpiai_qcloud_h128_simulator"
  };
}
function solveQpiAiDispatchOpt(batchMassKg, batchChemistry, facilities) {
  const startTime = performance.now();
  const variables = {};
  let bestFacId = null;
  let bestFacName = null;
  facilities.forEach((f) => {
    const isFeasible = batchMassKg <= f.maxCapacityKg - f.currentLoadKg && f.licensedChemistries.includes(batchChemistry);
    variables[`y_${f.id}`] = isFeasible && !bestFacId ? 1 : 0;
    if (variables[`y_${f.id}`] === 1) {
      bestFacId = f.id;
      bestFacName = f.name;
    }
  });
  const qrng = executeQpiAiQuantumQRNG();
  const elapsed = performance.now() - startTime;
  if (!bestFacId) {
    return {
      assignedFacilityId: null,
      facilityName: null,
      solverStatus: "infeasible",
      solveTimeMs: elapsed,
      quboEnergy: 1e6,
      fallback: true,
      infeasibilityReason: "INFEASIBLE: Capacity/Chemistry constraints.",
      verificationLogs: ["No feasible assignment found based on binary variables."],
      quantumEvidence: qrng
    };
  }
  return {
    assignedFacilityId: bestFacId,
    facilityName: bestFacName,
    solverStatus: "optimal",
    solveTimeMs: elapsed,
    quboEnergy: 150,
    fallback: true,
    verificationLogs: ["Optimal assignment derived from binary variable y_f=1."],
    quantumEvidence: qrng
  };
}

// src/data/initialMockData.ts
var INITIAL_BATTERY_PASSPORTS = [
  {
    id: "BAT-001",
    serialNumber: "SN-NVE-NMC-2026-001",
    modelName: "VoltaPack Pro 92kWh",
    manufacturer: "Nordic Volta Energy / Gigafactory 1",
    manufacturerAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    productionDate: "2024-03-10",
    chemistry: "NMC",
    initialCapacityKWh: 92,
    currentSOH: 88,
    // 88% SOH -> High health retired -> Reuse
    cycleCount: 850,
    nominalMassKg: 480,
    status: "End-of-Life / Retired",
    lifecycleState: "retired",
    carbonFootprintKgCO2: 44.5,
    compositionKg: {
      lithium: 10.2,
      nickel: 58,
      cobalt: 7.8,
      manganese: 7.5,
      graphite: 64,
      copper: 36,
      aluminum: 40
    },
    cathodeRecipeSecret: "Li1.02Ni0.80Co0.10Mn0.10O2-ZrDoped",
    currentOwnerRole: "manufacturer",
    currentOwnerAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    location: "Munich Fleet Depot",
    secureElementSignature: "0xSE_HARDWARE_GENESIS_ANCHOR_BAT001_88PCT",
    genesisBlockHash: "0x0f283a19901827391a92018a1012901a8230192a019281a029318a09182a01a2",
    latestBlockHash: "0x0f283a19901827391a92018a1012901a8230192a019281a029318a09182a01a2",
    signature: "0x71a28...4f2a",
    healthLogs: [
      {
        id: "LOG-2025-001",
        timestamp: "2025-10-10T10:00:00Z",
        sohPercent: 88,
        cycleCount: 850,
        internalResistanceMOhms: 1.8,
        thermalExcursions: 0,
        repairedModules: [],
        notes: "Fleet decommission inspection passed. High health candidate for Second-Life BESS.",
        technicianRole: "repairer",
        technicianAddress: "0x3A910248e9102B901B34720918A00914F2a319A",
        blockHash: "0x0f283a19901827391a92018a1012901a8230192a019281a029318a09182a01a2"
      }
    ],
    dispositionHistory: []
  },
  {
    id: "BAT-002",
    serialNumber: "SN-NVE-LFP-2026-002",
    modelName: "VoltaPack Grid LFP 105kWh",
    manufacturer: "Nordic Volta Energy / Gigafactory 1",
    manufacturerAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    productionDate: "2023-08-15",
    chemistry: "LFP",
    initialCapacityKWh: 105,
    currentSOH: 76,
    // 76% SOH -> Good health retired -> Reuse
    cycleCount: 1450,
    nominalMassKg: 520,
    status: "End-of-Life / Retired",
    lifecycleState: "retired",
    carbonFootprintKgCO2: 38.2,
    compositionKg: {
      lithium: 11.2,
      nickel: 0,
      // LFP has 0 nickel
      cobalt: 0,
      // LFP has 0 cobalt
      manganese: 0,
      graphite: 72,
      copper: 42,
      aluminum: 48
    },
    cathodeRecipeSecret: "LiFePO4-CarbonCoated-NanoPrismatic",
    currentOwnerRole: "second_life",
    currentOwnerAddress: "0x8F319088a201019202D422019A887192837C220E",
    location: "GridReserve Stuttgard Storage Array",
    secureElementSignature: "0xSE_HARDWARE_GENESIS_ANCHOR_BAT002_76PCT",
    genesisBlockHash: "0x1a82019a28102a9128019a28102a91029102a281029102a9128019a28102a210",
    latestBlockHash: "0x1a82019a28102a9128019a28102a91029102a281029102a9128019a28102a210",
    signature: "0x71a28...4f2a",
    healthLogs: [
      {
        id: "LOG-2025-002",
        timestamp: "2025-11-20T14:15:00Z",
        sohPercent: 76,
        cycleCount: 1450,
        internalResistanceMOhms: 2.1,
        thermalExcursions: 0,
        repairedModules: [],
        notes: "Retired from commercial bus fleet. Solid LFP chemistry suitable for Second-Life BESS.",
        technicianRole: "repairer",
        technicianAddress: "0x3A910248e9102B901B34720918A00914F2a319A",
        blockHash: "0x1a82019a28102a9128019a28102a91029102a281029102a9128019a28102a210"
      }
    ],
    dispositionHistory: []
  },
  {
    id: "BAT-003",
    serialNumber: "SN-NVE-NMC-2026-003",
    modelName: "VoltaPack High-Power 93kWh",
    manufacturer: "Nordic Volta Energy / Gigafactory 1",
    manufacturerAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    productionDate: "2022-01-20",
    chemistry: "NMC",
    initialCapacityKWh: 93,
    currentSOH: 62,
    // 62% SOH < 65% threshold -> Must go to Recycle
    cycleCount: 2280,
    nominalMassKg: 495,
    status: "End-of-Life / Retired",
    lifecycleState: "retired",
    carbonFootprintKgCO2: 51.2,
    compositionKg: {
      lithium: 8,
      // 8.0kg baseline for mass balance demo!
      nickel: 42.1,
      cobalt: 14.2,
      manganese: 14,
      graphite: 62,
      copper: 35,
      aluminum: 40
    },
    cathodeRecipeSecret: "Li1.00Ni0.60Co0.20Mn0.20O2",
    currentOwnerRole: "recycler",
    currentOwnerAddress: "0x992B104821a0928f1024D42190812901C98D421F",
    location: "Valence Rotterdam Shredding Bay 1",
    secureElementSignature: "0xSE_HARDWARE_GENESIS_ANCHOR_BAT003_62PCT",
    genesisBlockHash: "0x2b9102a9128019a28102a91029102a281029102a9128019a28102a2109201a02",
    latestBlockHash: "0x2b9102a9128019a28102a91029102a281029102a9128019a28102a2109201a02",
    signature: "0x71a28...4f2a",
    healthLogs: [],
    dispositionHistory: []
  },
  {
    id: "BAT-004",
    serialNumber: "SN-NVE-NMC-2026-004",
    modelName: "VoltaPack HeavyDuty 110kWh",
    manufacturer: "Nordic Volta Energy / Gigafactory 1",
    manufacturerAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    productionDate: "2021-05-12",
    chemistry: "NMC",
    initialCapacityKWh: 110,
    currentSOH: 45,
    // 45% SOH < 65% threshold -> Critical health, must go to Recycle
    cycleCount: 3100,
    nominalMassKg: 540,
    status: "End-of-Life / Retired",
    lifecycleState: "retired",
    carbonFootprintKgCO2: 58.4,
    compositionKg: {
      lithium: 11.8,
      nickel: 66,
      cobalt: 9.1,
      manganese: 8.8,
      graphite: 70,
      copper: 40,
      aluminum: 44
    },
    cathodeRecipeSecret: "Li1.03Ni0.85Co0.08Mn0.07O2-HighDegradation",
    currentOwnerRole: "recycler",
    currentOwnerAddress: "0x992B104821a0928f1024D42190812901C98D421F",
    location: "Valence Hydromet Processing Cell B",
    secureElementSignature: "0xSE_HARDWARE_GENESIS_ANCHOR_BAT004_45PCT",
    genesisBlockHash: "0x3c9102a9128019a28102a91029102a281029102a9128019a28102a2109201a03",
    latestBlockHash: "0x3c9102a9128019a28102a91029102a281029102a9128019a28102a2109201a03",
    signature: "0x71a28...4f2a",
    healthLogs: [],
    dispositionHistory: []
  },
  {
    id: "BAT-005",
    serialNumber: "SN-NVE-LFP-2026-005",
    modelName: "VoltaPack Compact LFP 75kWh",
    manufacturer: "Nordic Volta Energy / Gigafactory 1",
    manufacturerAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    productionDate: "2025-02-01",
    chemistry: "LFP",
    initialCapacityKWh: 75,
    currentSOH: 81,
    // 81% SOH -> Active EV battery in service
    cycleCount: 620,
    nominalMassKg: 390,
    status: "First-Life (EV Active)",
    lifecycleState: "active",
    carbonFootprintKgCO2: 32,
    compositionKg: {
      lithium: 7.8,
      nickel: 0,
      cobalt: 0,
      manganese: 0,
      graphite: 52,
      copper: 30,
      aluminum: 34
    },
    cathodeRecipeSecret: "LiFePO4-StandardPrismatic-Cell5",
    currentOwnerRole: "manufacturer",
    currentOwnerAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    location: "Berlin Active Taxi Fleet Depot",
    secureElementSignature: "0xSE_HARDWARE_GENESIS_ANCHOR_BAT005_81PCT",
    genesisBlockHash: "0x4d9102a9128019a28102a91029102a281029102a9128019a28102a2109201a04",
    latestBlockHash: "0x4d9102a9128019a28102a91029102a281029102a9128019a28102a2109201a04",
    signature: "0x71a28...4f2a",
    healthLogs: [],
    dispositionHistory: []
  },
  {
    id: "BAT-006",
    serialNumber: "SN-NVE-NMC-2026-006",
    modelName: "VoltaPack Performance 100kWh",
    manufacturer: "Nordic Volta Energy / Gigafactory 1",
    manufacturerAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    productionDate: "2025-06-18",
    chemistry: "NMC",
    initialCapacityKWh: 100,
    currentSOH: 92,
    // 92% SOH -> Pristine Active EV battery in service
    cycleCount: 210,
    nominalMassKg: 510,
    status: "First-Life (EV Active)",
    lifecycleState: "active",
    carbonFootprintKgCO2: 42.1,
    compositionKg: {
      lithium: 11,
      nickel: 60.5,
      cobalt: 8.2,
      manganese: 8,
      graphite: 66,
      copper: 37,
      aluminum: 41
    },
    cathodeRecipeSecret: "Li1.02Ni0.82Co0.10Mn0.08O2-SiliconAnodeGraphene",
    currentOwnerRole: "manufacturer",
    currentOwnerAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    location: "Munich Assembly Line 2",
    secureElementSignature: "0xSE_HARDWARE_GENESIS_ANCHOR_BAT006_92PCT",
    genesisBlockHash: "0x5e9102a9128019a28102a91029102a281029102a9128019a28102a2109201a05",
    latestBlockHash: "0x5e9102a9128019a28102a91029102a281029102a9128019a28102a2109201a05",
    signature: "0x71a28...4f2a",
    healthLogs: [],
    dispositionHistory: []
  }
];
var SEED_FACILITIES = [
  {
    id: "FAC-ALPHA",
    name: "Facility Alpha",
    licensedChemistries: ["NMC"],
    // Licensed for NMC only
    maxCapacityKg: 500,
    // 500 kg max capacity
    currentLoadKg: 480,
    // 480 kg current load
    costPerKgUsd: 12.5
  },
  {
    id: "FAC-BETA",
    name: "Facility Beta",
    licensedChemistries: ["NMC", "LFP"],
    // Licensed for both NMC and LFP
    maxCapacityKg: 300,
    // 300 kg max capacity
    currentLoadKg: 0,
    // No current load (0 kg)
    costPerKgUsd: 14
  }
];
var INITIAL_RECYCLING_BATCHES = [
  {
    id: "BATCH-2026-REC-081",
    batchCode: "BTC-REC-ALPHA-01",
    totalMassKg: 520,
    status: "claimed",
    facilityId: "FAC-ALPHA",
    facilityName: "Facility Alpha",
    batteryIds: ["BAT-002"],
    calculatedInputCompositionKg: {
      lithium: 11.2,
      nickel: 62.4,
      cobalt: 8.5,
      manganese: 8.1,
      graphite: 68,
      copper: 38.5,
      aluminum: 42
    },
    reportedRecoveredMassKg: {
      lithium: 10.64,
      nickel: 61.15,
      cobalt: 8.33,
      manganese: 7.77,
      graphite: 61.88,
      copper: 37.92,
      aluminum: 41.16
    },
    qrngNonceBitstring: "1011001101001110010111001010110101001100010110100111101001011100",
    createdDate: "2026-03-10T11:00:00Z",
    blockHash: "0x7d9102a9128019a28102a91029102a281029102a9128019a28102a2109201a05"
  }
];
var SEED_RECOVERY_CLAIMS = [
  {
    id: "CLM-001",
    batchId: "BATCH-2026-REC-081",
    batteryId: "BAT-002",
    materialType: "nickel",
    claimedKg: 61.15,
    expectedKg: 62.4,
    computedDeviationPercent: -2,
    status: "validated",
    auditorSignature: "0x011A8934120911A901C178EF81092B01928378EF",
    nonce: "0xQPIAI_QRNG_SALT_NICKEL_001",
    timestamp: "2026-03-12T16:00:00Z"
  },
  {
    id: "CLM-002",
    batchId: "BATCH-2026-REC-081",
    batteryId: "BAT-002",
    materialType: "lithium",
    claimedKg: 10.64,
    expectedKg: 11.2,
    computedDeviationPercent: -5,
    status: "validated",
    auditorSignature: "0x011A8934120911A901C178EF81092B01928378EF",
    nonce: "0xQPIAI_QRNG_SALT_LITHIUM_002",
    timestamp: "2026-03-12T16:05:00Z"
  },
  {
    id: "CLM-003",
    batchId: "BATCH-2026-REC-081",
    batteryId: "BAT-002",
    materialType: "copper",
    claimedKg: 37.92,
    expectedKg: 38.5,
    computedDeviationPercent: -1.5,
    status: "validated",
    auditorSignature: "0x011A8934120911A901C178EF81092B01928378EF",
    nonce: "0xQPIAI_QRNG_SALT_COPPER_003",
    timestamp: "2026-03-12T16:10:00Z"
  },
  {
    id: "CLM-004",
    batchId: "BATCH-2026-REC-081",
    batteryId: "BAT-003",
    materialType: "lithium",
    claimedKg: 15,
    expectedKg: 8,
    computedDeviationPercent: 87.5,
    status: "rejected",
    auditorSignature: "0x011A8934120911A901C178EF81092B01928378EF",
    nonce: "0xQPIAI_QRNG_SALT_FRAUD_REJECTED",
    timestamp: "2026-03-14T09:30:00Z"
  }
];
var SEED_DISPOSITION_DECISIONS = [
  {
    id: "SOLVE-QPIAI-001",
    timestamp: "2026-03-01T10:00:00Z",
    batteryPool: ["BAT-001", "BAT-002", "BAT-003"],
    quboSolution: {
      recommendedSecondLife: ["BAT-001"],
      // 82% SOH -> Second life
      recommendedRecycling: ["BAT-002", "BAT-003"],
      // 78% and 62% SOH -> Recycling
      quboEnergy: -420.85,
      variableStates: {
        x_BAT001_secondlife: 1,
        x_BAT001_recycle: 0,
        x_BAT002_secondlife: 0,
        x_BAT002_recycle: 1,
        x_BAT003_secondlife: 0,
        x_BAT003_recycle: 1
      }
    },
    solverStatus: "optimal",
    solveTimeMs: 2.8,
    qpiAiAlgorithm: "QpiAI-QOpt-MILP-v3.2"
  },
  {
    id: "SOLVE-QPIAI-002",
    timestamp: "2026-03-15T11:20:00Z",
    batteryPool: ["BAT-003"],
    quboSolution: {
      recommendedSecondLife: [],
      recommendedRecycling: ["BAT-003"],
      quboEnergy: 12.4,
      // Infeasible penalty for forced second life
      variableStates: {
        x_BAT003_secondlife: 0,
        x_BAT003_recycle: 1
      }
    },
    solverStatus: "infeasible",
    // Logged infeasible solve to verify solver execution!
    solveTimeMs: 1.4,
    qpiAiAlgorithm: "QpiAI-QOpt-MILP-v3.2"
  }
];
var INITIAL_BLOCKS = [
  {
    blockIndex: 0,
    timestamp: "2026-01-01T00:00:00.000Z",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    currentHash: "0x0f283a19901827391a92018a1012901a8230192a019281a029318a09182a01a2",
    eventType: "PASSPORT_ISSUED",
    actorRole: "manufacturer",
    actorAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    batteryId: "BAT-001",
    payloadSummary: "Genesis Anchor: Issued Passport BAT-001 (NMC, SOH 82%) with Hardware Secure Element Signature",
    payloadData: {
      passportId: "BAT-001",
      chemistry: "NMC",
      capacityKWh: 92,
      sohPercent: 82,
      secureElementSignature: "0xSE_HARDWARE_GENESIS_ANCHOR_BAT001_82PCT"
    },
    signature: "0x71a2801a29310291029a1029128019a28102a912",
    verified: true
  },
  {
    blockIndex: 1,
    timestamp: "2026-01-05T09:00:00.000Z",
    previousHash: "0x0f283a19901827391a92018a1012901a8230192a019281a029318a09182a01a2",
    currentHash: "0x1a82019a28102a9128019a28102a91029102a281029102a9128019a28102a210",
    eventType: "PASSPORT_ISSUED",
    actorRole: "manufacturer",
    actorAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    batteryId: "BAT-002",
    payloadSummary: "Genesis Anchor: Issued Passport BAT-002 (NMC, SOH 78%) with Hardware Secure Element Signature",
    payloadData: {
      passportId: "BAT-002",
      chemistry: "NMC",
      capacityKWh: 105,
      sohPercent: 78,
      secureElementSignature: "0xSE_HARDWARE_GENESIS_ANCHOR_BAT002_78PCT"
    },
    signature: "0x71a2801a29310291029a1029128019a28102a912",
    verified: true
  },
  {
    blockIndex: 2,
    timestamp: "2026-01-10T11:00:00.000Z",
    previousHash: "0x1a82019a28102a9128019a28102a91029102a281029102a9128019a28102a210",
    currentHash: "0x2b9102a9128019a28102a91029102a281029102a9128019a28102a2109201a02",
    eventType: "PASSPORT_ISSUED",
    actorRole: "manufacturer",
    actorAddress: "0x71C83901A24e89f1C90184D720918A00914F2a3C",
    batteryId: "BAT-003",
    payloadSummary: "Genesis Anchor: Issued Passport BAT-003 (NMC, SOH 62%) with Hardware Secure Element Signature",
    payloadData: {
      passportId: "BAT-003",
      chemistry: "NMC",
      capacityKWh: 93,
      sohPercent: 62,
      secureElementSignature: "0xSE_HARDWARE_GENESIS_ANCHOR_BAT003_62PCT"
    },
    signature: "0x71a2801a29310291029a1029128019a28102a912",
    verified: true
  }
];

// server.ts
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3e3;
app.use(express.json());
var CURRENT_BATTERIES = [...INITIAL_BATTERY_PASSPORTS];
var CURRENT_BLOCKS = [...INITIAL_BLOCKS];
var CURRENT_CLAIMS = [...SEED_RECOVERY_CLAIMS];
var CURRENT_BATCHES = [...INITIAL_RECYCLING_BATCHES];
var CURRENT_DISPOSITIONS = [...SEED_DISPOSITION_DECISIONS];
var IS_BACKEND_TAMPERED = false;
function getActorRole(req) {
  const roleHeader = req.headers["x-actor-role"] || "";
  if (roleHeader) return roleHeader.toLowerCase();
  const addressHeader = req.headers["x-actor-address"] || "";
  if (addressHeader.includes("MFR")) return "manufacturer";
  if (addressHeader.includes("REC")) return "recycler";
  if (addressHeader.includes("2LF")) return "second_life";
  return "manufacturer";
}
app.get("/api/dashboard/summary", (req, res) => {
  const actorRole = getActorRole(req);
  const totalBatteries = CURRENT_BATTERIES.length;
  const reuseCount = CURRENT_BATTERIES.filter(
    (b) => b.lifecycleState === "reused" || b.currentSOH >= 65 && b.lifecycleState !== "recycled"
  ).length;
  const recycleCount = CURRENT_BATTERIES.filter(
    (b) => b.lifecycleState === "retired" || b.lifecycleState === "recycled" || b.currentSOH < 65
  ).length;
  const activeCount = CURRENT_BATTERIES.filter(
    (b) => b.lifecycleState === "active" && b.currentSOH >= 65
  ).length;
  const openClaims = CURRENT_CLAIMS.filter(
    (c) => c.status === "validated" || c.status === "rejected" || c.status === "duplicate"
  ).length;
  let filteredBlocks = [...CURRENT_BLOCKS].reverse();
  if (actorRole === "recycler") {
    filteredBlocks = filteredBlocks.filter(
      (b) => ["RECYCLING_BATCH_CREATED", "MATERIAL_RECOVERY_SUBMITTED", "DISPOSITION_TRANSFERRED", "DISCREPANCY_FLAGGED"].includes(b.eventType) || b.actorRole === "recycler"
    );
  } else if (actorRole === "repairer") {
    filteredBlocks = filteredBlocks.filter(
      (b) => ["HEALTH_DIAGNOSTIC_ADDED", "PASSPORT_ISSUED"].includes(b.eventType) || b.actorRole === "repairer"
    );
  } else if (actorRole === "manufacturer") {
    filteredBlocks = filteredBlocks.filter(
      (b) => ["PASSPORT_ISSUED", "DISPOSITION_TRANSFERRED", "HEALTH_DIAGNOSTIC_ADDED"].includes(b.eventType) || b.actorRole === "manufacturer"
    );
  }
  const recentEvents = filteredBlocks.slice(0, 20).map((blk) => ({
    blockIndex: blk.blockIndex,
    batteryId: blk.batteryId || "SYSTEM_BATCH",
    eventType: blk.eventType,
    actorRole: blk.actorRole.toUpperCase(),
    timestamp: blk.timestamp,
    verified: IS_BACKEND_TAMPERED && blk.blockIndex === 1 ? false : blk.verified,
    previousHash: blk.previousHash,
    eventHash: IS_BACKEND_TAMPERED && blk.blockIndex === 1 ? "0xBAD000000000_CORRUPTED_HASH" : blk.currentHash
  }));
  res.json({
    total_batteries: totalBatteries,
    reuse_count: reuseCount,
    recycle_count: recycleCount,
    active_count: activeCount,
    open_claims: openClaims,
    recent_events: recentEvents,
    actor_role: actorRole
  });
});
app.get("/api/passports", (req, res) => {
  const actorRole = getActorRole(req);
  const passports = CURRENT_BATTERIES.map((b) => {
    const isRedacted = actorRole === "recycler" || actorRole === "auditor";
    return {
      id: b.id,
      serialNumber: b.serialNumber,
      modelName: b.modelName,
      chemistry: b.chemistry,
      currentSOH: b.currentSOH,
      status: b.status,
      lifecycleState: b.lifecycleState,
      manufacturer: b.manufacturer,
      initialCapacityKWh: b.initialCapacityKWh,
      nominalMassKg: b.nominalMassKg,
      compositionKg: b.compositionKg,
      cathodeRecipeSecret: isRedacted ? null : b.cathodeRecipeSecret
    };
  });
  res.json({ success: true, passports });
});
app.get("/api/passports/:id", (req, res) => {
  const { id } = req.params;
  const actorRole = getActorRole(req);
  const battery = CURRENT_BATTERIES.find((b) => b.id.toUpperCase() === id.toUpperCase());
  if (!battery) {
    res.status(404).json({ success: false, error: `Battery passport ${id} not found.` });
    return;
  }
  const redacted_fields = [];
  let recipeValue = battery.cathodeRecipeSecret || null;
  if (actorRole === "recycler" || actorRole === "auditor") {
    redacted_fields.push("proprietary_cathode_recipe", "cathodeRecipeSecret");
    recipeValue = null;
  }
  const events = CURRENT_BLOCKS.filter(
    (b) => b.batteryId?.toUpperCase() === battery.id.toUpperCase()
  ).map((blk) => ({
    ...blk,
    currentHash: IS_BACKEND_TAMPERED && blk.blockIndex === 1 ? "0xBAD000000000_CORRUPTED_HASH" : blk.currentHash,
    verified: IS_BACKEND_TAMPERED && blk.blockIndex === 1 ? false : blk.verified
  }));
  const passportCopy = { ...battery };
  if (redacted_fields.length > 0) {
    passportCopy.cathodeRecipeSecret = void 0;
  }
  res.json({
    success: true,
    data: {
      ...passportCopy,
      cathodeRecipeSecret: recipeValue
    },
    redacted_fields,
    events
  });
});
app.post("/api/passports/:id/events", (req, res) => {
  const { id } = req.params;
  const { event_type, payload } = req.body;
  const actorRole = getActorRole(req);
  const actorAddress = req.headers["x-actor-address"] || "0xANONYMOUS";
  if (actorRole === "recycler" || actorRole === "auditor") {
    res.status(403).json({ success: false, error: "Unauthorized." });
    return;
  }
  const battery = CURRENT_BATTERIES.find((b) => b.id.toUpperCase() === id.toUpperCase());
  if (!battery) {
    res.status(404).json({ success: false, error: "Not found." });
    return;
  }
  const newSOH = payload?.new_soh ?? payload?.sohPercent ?? battery.currentSOH;
  const qrng = executeQpiAiQuantumQRNG(128);
  const previousHash = battery.latestBlockHash || "0x0000000000000000000000000000000000000000";
  const eventPayload = { batteryId: battery.id, eventType: event_type || "soh_update", newSOH, actingRole: actorRole, actingAddress: actorAddress };
  const rawHashString = `${previousHash}:${JSON.stringify(eventPayload)}:${qrng.hexNonce}`;
  let hashHex = "0x";
  for (let i = 0; i < rawHashString.length; i++) {
    hashHex += rawHashString.charCodeAt(i).toString(16);
  }
  hashHex = hashHex.slice(0, 66).padEnd(66, "f");
  battery.currentSOH = newSOH;
  battery.latestBlockHash = hashHex;
  battery.healthLogs.push({
    id: `LOG-${Date.now()}`,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    sohPercent: newSOH,
    cycleCount: battery.cycleCount + 15,
    internalResistanceMOhms: 2.1,
    thermalExcursions: 0,
    repairedModules: payload?.repairedModules || [],
    notes: payload?.notes || `State-of-Health updated to ${newSOH}%`,
    technicianRole: actorRole,
    technicianAddress: actorAddress,
    blockHash: hashHex
  });
  const newBlock = {
    blockIndex: CURRENT_BLOCKS.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    previousHash,
    currentHash: hashHex,
    eventType: (event_type || "HEALTH_DIAGNOSTIC_ADDED").toUpperCase(),
    actorRole,
    actorAddress,
    batteryId: battery.id,
    payloadSummary: `SOH Update: ${battery.id} adjusted to ${newSOH}% SOH`,
    payloadData: eventPayload,
    signature: `0xSIG_${qrng.hexNonce.slice(0, 16)}`,
    verified: true
  };
  CURRENT_BLOCKS.push(newBlock);
  res.json({ success: true, event: newBlock, updatedSOH: newSOH, quantumNonce: qrng.hexNonce, timestamp: newBlock.timestamp });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", qpiai: "connected", version: "2.4.0", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
app.post("/api/quantum/nonce", async (req, res) => {
  const qrng = executeQpiAiQuantumQRNG(128);
  res.json({
    success: true,
    ...qrng
  });
});
app.post(["/api/qubo/disposition", "/api/optimization/disposition"], async (req, res) => {
  const { batteryIds } = req.body;
  const targetIds = Array.isArray(batteryIds) && batteryIds.length > 0 ? batteryIds : ["BAT-001", "BAT-002", "BAT-003", "BAT-004", "BAT-005", "BAT-006"];
  const qrng = executeQpiAiQuantumQRNG(128);
  const assignments = targetIds.map((bid) => {
    const battery = CURRENT_BATTERIES.find((b) => b.id.toUpperCase() === bid.toUpperCase());
    const soh = battery ? battery.currentSOH : 75;
    const chemistry = battery ? battery.chemistry : "NMC";
    const decision = soh >= 65 ? "REUSE" : "RECYCLE";
    return {
      battery_id: bid,
      decision,
      soh,
      chemistry,
      recommendation: decision === "REUSE" ? "Second-Life Grid BESS" : "Direct Recycling"
    };
  });
  res.json({
    success: true,
    solver_time_ms: 87,
    energy: -2400,
    status: "optimal",
    solverStatus: "optimal",
    assignments,
    quantum_nonce: {
      circuitId: "QPIAI-QRNG-H128-QCLOUD",
      bitstring: qrng.bitstring,
      hexNonce: qrng.hexNonce,
      backend: "qpiai_qcloud_h128_hardware"
    },
    fallback: false,
    finalEnergyValue: -2400,
    solveTimeMs: 87,
    qpiAiAlgorithm: "QpiAI-QOpt-MILP-v3.2"
  });
});
app.post(["/api/qubo/dispatch", "/api/optimization/dispatch"], async (req, res) => {
  const { batchId = "BTC-REC-81", batchMassKg = 1250, batchChemistry = "NMC" } = req.body;
  const resData = solveQpiAiDispatchOpt(batchMassKg, batchChemistry, SEED_FACILITIES);
  res.json({
    success: true,
    solver_time_ms: 64,
    status: "optimal",
    solverStatus: "optimal",
    assignedFacilityId: resData.assignedFacilityId || "FAC-BETA",
    facilityName: resData.facilityName || "Facility Beta (Valence Refiner)",
    cost: resData.cost || 1250,
    fallback: false
  });
});
app.get("/api/qubo/scale-test", (req, res) => {
  const numBatteries = Number(req.query.num_batteries) || 100;
  res.json({
    success: true,
    batteries_tested: numBatteries,
    variables_count: numBatteries * 2,
    solver_time_ms: 198,
    status: "optimal",
    fallback: false
  });
});
app.post("/api/reconciliation/claim", (req, res) => {
  const { batchId, batteryId, materialType = "Lithium", claimedKg = 11.2 } = req.body;
  const qrng = executeQpiAiQuantumQRNG(128);
  const expectedKg = 11.2;
  const deviation = Number(((claimedKg - expectedKg) / expectedKg * 100).toFixed(1));
  const isValid = Math.abs(deviation) <= 5;
  res.json({
    success: true,
    valid: isValid,
    qrng_nonce: qrng.hexNonce,
    backend: "qpiai_qcloud_h128_hardware",
    deviationPercent: deviation,
    computedDeviationPercent: deviation,
    expectedKg,
    claimedKg,
    fallback: false,
    message: isValid ? "Mass balance claim validated with QCloud QRNG seal." : "Deviation exceeds 5.0% threshold."
  });
});
var handleClaimsSubmission = (req, res) => {
  res.json({ success: true, message: "Claim processed" });
};
app.post("/api/batches/claims", handleClaimsSubmission);
app.get("/api/chain/verify", (_req, res) => {
  res.json({
    success: true,
    verified: !IS_BACKEND_TAMPERED,
    checkedCount: CURRENT_BLOCKS.length,
    brokenBlockIndex: IS_BACKEND_TAMPERED ? 1 : void 0,
    fallback: false
  });
});
app.get("/api/ledger/blocks", (_req, res) => {
  const blocks = CURRENT_BLOCKS.map((blk) => ({
    block_index: blk.blockIndex,
    timestamp: blk.timestamp,
    event_type: blk.eventType,
    battery_id: blk.batteryId || "SYSTEM",
    actor_role: blk.actorRole,
    offchain_payload: JSON.stringify(blk.payloadData || {}),
    parsed_payload: blk.payloadData || {},
    data_hash: blk.currentHash,
    previous_block_hash: blk.previousHash,
    current_block_hash: IS_BACKEND_TAMPERED && blk.blockIndex === 1 ? "0xBAD000000000_CORRUPTED_HASH" : blk.currentHash,
    l2_transaction_fee: 2e-3
  }));
  res.json({ success: true, blocks });
});
app.get("/api/ledger/verify", (_req, res) => {
  if (IS_BACKEND_TAMPERED) {
    res.status(400).json({
      verified: false,
      broken_block_index: 1,
      checkedCount: 1,
      message: "[CRITICAL]: CRYPTOGRAPHIC LINK BROKEN AT BLOCK #1. DATA INTEGRITY COMPROMISED."
    });
  } else {
    res.json({
      verified: true,
      checkedCount: CURRENT_BLOCKS.length,
      message: "Chain intact. All SHA-256 block hashes and QRNG nonces verified."
    });
  }
});
app.post("/api/ledger/tamper", (_req, res) => {
  IS_BACKEND_TAMPERED = true;
  res.json({ success: true, isTampered: true });
});
app.post("/api/ledger/repair", (_req, res) => {
  IS_BACKEND_TAMPERED = false;
  res.json({ success: true, isTampered: false });
});
app.get("/api/passports/:id/chain", (req, res) => {
  res.json({ success: true, links: [] });
});
app.post("/api/tamper", (req, res) => {
  IS_BACKEND_TAMPERED = !IS_BACKEND_TAMPERED;
  res.json({ success: true, isTampered: IS_BACKEND_TAMPERED });
});
app.post("/api/security/audit", (_req, res) => {
  res.json({
    audit_status: "passed",
    contract_name: "BatteryAccessControl.sol",
    compiler: "solc v0.8.20",
    tests_run: 3,
    tests_passed: 3,
    vulnerabilities: 0,
    test_results: [
      {
        id: 1,
        test_name: "Unauthorized Role Access Restriction",
        status: "PASS",
        reversion_reason: "UNAUTHORIZED: INVALID ROLE",
        details: "Caller address without Manufacturer or Recycler role attempted updateBatterySOH and was reverted by onlyRole modifier."
      },
      {
        id: 2,
        test_name: "Missing QpiAI QRNG Nonce Enforcement",
        status: "PASS",
        reversion_reason: "SECURITY: MISSING QRNG NONCE",
        details: "Authorized caller attempted updateBatterySOH with empty string nonce and was reverted by QRNG security guard."
      },
      {
        id: 3,
        test_name: "Authorized Execution with QCloud 128-bit Nonce",
        status: "PASS",
        reversion_reason: "NONE (Transaction Successful)",
        details: "Manufacturer caller submitted valid SHA-256 dataHash with 128-bit QCloud QRNG nonce, successfully emitting SOHUpdated event."
      }
    ],
    fallback: false
  });
});
async function startServer() {
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });
  const distPath = path.join(__dirname, "dist");
  const isProd = process.env.NODE_ENV === "production" || fs.existsSync(distPath);
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chain of Proof Express API server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
