/**
 * Chain of Proof - Passport Studio View (Module 3: Identity & Cryptography)
 * Consumer-Grade Passport Studio with Soft Depth Cards, Cross-Fade AnimatePresence,
 * and Framer Motion Morphing Redaction Engine.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Search,
  CheckCircle2,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../common/StatusBadge';
import { TruncatedHash } from '../common/TruncatedHash';
import { Modal } from '../common/Modal';
import { apiFetch } from '../../services/apiClient';
import { MathCard } from '../common/MathCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { BatteryDigitalTwin } from '../Three/BatteryDigitalTwin';
import { Maximize2, Minimize2 } from 'lucide-react';

interface ApiPassportDetail {
  id: string;
  serialNumber: string;
  modelName: string;
  manufacturer: string;
  productionDate: string;
  chemistry: string;
  initialCapacityKWh: number;
  currentSOH: number;
  cycleCount: number;
  nominalMassKg: number;
  status: string;
  lifecycleState: string;
  cathodeRecipeSecret?: string;
  location: string;
  secureElementSignature: string;
  healthLogs?: any[];
}

interface ApiEventBlock {
  blockIndex: number;
  timestamp: string;
  previousHash: string;
  currentHash: string;
  eventType: string;
  actorRole: string;
  actorAddress: string;
  batteryId?: string;
  payloadSummary: string;
  payloadData: Record<string, any>;
  signature: string;
  verified: boolean;
}

export const PassportStudioView: React.FC = () => {
  const currentRole = useAppStore((state) => state.currentRole);
  const storePassports = useAppStore((state) => state.passports);
  const selectedPassportId = useAppStore((state) => state.selectedPassportId);
  const setSelectedPassportId = useAppStore((state) => state.setSelectedPassportId);
  const addHealthLog = useAppStore((state) => state.addHealthLog);
  const storeBlocks = useAppStore((state) => state.blocks);

  const [searchQuery, setSearchQuery] = useState('');
  const [passportDetail, setPassportDetail] = useState<ApiPassportDetail | null>(null);
  const [redactedFields, setRedactedFields] = useState<string[]>([]);
  const [eventsList, setEventsList] = useState<ApiEventBlock[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // SOH Update Modal
  const [isSohModalOpen, setIsSohModalOpen] = useState(false);
  const [newSohValue, setNewSohValue] = useState<number>(82);
  const [sohNotes, setSohNotes] = useState<string>('Routine service diagnostic and capacity test.');
  const [isSubmittingSoh, setIsSubmittingSoh] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activePassportId = selectedPassportId || storePassports[0]?.id || 'BAT-001';

  // Fetch passport detail from GET /api/passports/:id
  useEffect(() => {
    let isMounted = true;
    async function loadPassportDetail() {
      setIsLoadingDetail(true);
      try {
        const response = await apiFetch(`/api/passports/${activePassportId}`);
        if (response.ok) {
          const json = await response.json();
          if (isMounted && json.success) {
            setPassportDetail(json.data);
            setRedactedFields(json.redacted_fields || []);
            setEventsList(json.events || []);
            if (json.data?.currentSOH) {
              setNewSohValue(json.data.currentSOH);
            }
          }
        }
      } catch (err) {
        console.warn('API fetch failed, fallback to Zustand store:', err);
      } finally {
        if (isMounted) {
          setIsLoadingDetail(false);
        }
      }
    }

    if (activePassportId) {
      loadPassportDetail();
    }

    return () => {
      isMounted = false;
    };
  }, [activePassportId, currentRole]);

  // Fallback to Zustand store if API is offline
  const activePassport =
    passportDetail || storePassports.find((p) => p.id === activePassportId) || storePassports[0];

  const currentEvents =
    eventsList.length > 0
      ? eventsList
      : storeBlocks.filter((b) => b.batteryId === activePassportId);

  const isRecycler = currentRole === 'recycler';
  const isRedacted =
    isRecycler ||
    redactedFields.includes('proprietary_cathode_recipe') ||
    redactedFields.includes('cathodeRecipeSecret');

  const filteredPassports = storePassports.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.chemistry.toLowerCase().includes(q) ||
      p.modelName.toLowerCase().includes(q) ||
      p.serialNumber.toLowerCase().includes(q)
    );
  });

  // Handle SOH Update Form Submission
  const handleSohSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecycler) return;
    setIsSubmittingSoh(true);

    try {
      const response = await apiFetch(`/api/passports/${activePassportId}/events`, {
        method: 'POST',
        body: JSON.stringify({
          event_type: 'soh_update',
          payload: {
            new_soh: Number(newSohValue),
            notes: sohNotes,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.event) {
          setEventsList((prev) => [result.event, ...prev]);

          if (passportDetail) {
            setPassportDetail({
              ...passportDetail,
              currentSOH: Number(newSohValue),
            });
          }

          await addHealthLog(activePassportId, {
            sohPercent: Number(newSohValue),
            cycleCount: (activePassport?.cycleCount || 1000) + 12,
            internalResistanceMOhms: 2.1,
            thermalExcursions: 0,
            repairedModules: [],
            notes: sohNotes,
          });

          const nonceTruncated = result.quantumNonce
            ? `0x${result.quantumNonce.slice(0, 12)}...`
            : '0xQPIAI_QRNG_128BIT';
          const msg = `Record Verified. Nonce: ${nonceTruncated}`;
          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 4000);

          setIsSohModalOpen(false);
        }
      } else {
        const errorJson = await response.json();
        alert(errorJson.error || 'Failed to submit SOH update');
      }
    } catch (err) {
      console.error('SOH Update submit error:', err);
    } finally {
      setIsSubmittingSoh(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto py-8 px-6 sm:px-8 relative bg-[#EAEBEE] text-[#2A1B24]">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-8 z-50 bg-[#2A1B24] text-[#EAEBEE] border border-[#F59E0B] px-6 py-3.5 rounded-2xl flex items-center gap-3 font-mono text-xs uppercase tracking-wider font-bold shadow-app-lg"
          >
            <CheckCircle2 className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="space-y-1 border-b border-[#2A1B24]/10 pb-4">
        <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-[#F59E0B] bg-[#2A1B24] px-3 py-1 rounded-xl inline-block shadow-app">
          MODULE 03 // PASSPORT STUDIO (IDENTITY & CRYPTOGRAPHY)
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-[#2A1B24] uppercase mt-2">
          Digital Battery Passport Registry
        </h1>
      </div>

      {/* Two Columns: Left Directory (Wider lg:col-span-4) + Right Passport Details (lg:col-span-8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (Wider 33.3% width) */}
        <div className="lg:col-span-4 bg-white shadow-app rounded-2xl p-5 border border-[#2A1B24]/5 space-y-4">
          <div className="space-y-2 pb-3 border-b border-[#2A1B24]/10">
            <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#2A1B24]/60 block font-mono">
              DIRECTORY SEARCH
            </span>
            <div className="relative">
              <Search className="w-4 h-4 text-[#2A1B24]/40 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by ID, model, chemistry..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#2A1B24]/15 text-xs font-mono bg-[#EAEBEE]/40 text-[#2A1B24] placeholder-[#2A1B24]/40 focus:outline-none focus:border-[#2A1B24]"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredPassports.map((p) => {
              const isSelected = p.id === activePassportId;
              const sohColor =
                p.currentSOH >= 80
                  ? 'bg-emerald-600'
                  : p.currentSOH >= 65
                  ? 'bg-[#F59E0B]'
                  : 'bg-red-600';

              return (
                <motion.button
                  key={p.id}
                  whileHover={{ scale: 1.01, y: -1 }}
                  onClick={() => setSelectedPassportId(p.id)}
                  className={`w-full text-left py-3.5 px-4 rounded-xl transition-all cursor-pointer relative shadow-app ${
                    isSelected
                      ? 'bg-[#2A1B24] text-[#EAEBEE] font-bold'
                      : 'bg-white text-[#2A1B24] border border-[#2A1B24]/5 hover:bg-[#2A1B24]/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold">
                      {p.id}
                    </span>
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
                      isSelected ? 'bg-white/10 text-[#F59E0B]' : 'bg-[#2A1B24]/5 text-[#2A1B24]'
                    }`}>
                      {p.chemistry}
                    </span>
                  </div>

                  <div className={`text-xs mt-1 font-mono ${isSelected ? 'text-[#EAEBEE]/80' : 'text-[#2A1B24]/80'}`}>
                    {p.modelName}
                  </div>

                  {/* SOH Bar */}
                  <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-2 border-t border-current/10">
                    <span className="opacity-60">SOH:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{p.currentSOH}%</span>
                      <div className="w-12 h-2 rounded-full bg-current/20 overflow-hidden">
                        <div
                          className={`h-full ${sohColor}`}
                          style={{ width: `${p.currentSOH}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (66.7% width) WITH CROSS-FADE ANIMATION */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {activePassport ? (
              <motion.div
                key={activePassport.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                {/* 3D DIGITAL TWIN VISUALIZER */}
                <div className="relative group/twin">
                  <BatteryDigitalTwin soh={activePassport.currentSOH} isExploded={isExploded} />
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                    <button
                      onClick={() => setIsExploded(!isExploded)}
                      className="px-4 py-2 bg-[#2A1B24] text-[#EAEBEE] text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl shadow-app-lg border border-[#F59E0B]/30 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                      {isExploded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                      {isExploded ? 'Collapse Internals' : 'Explode Internals'}
                    </button>
                  </div>

                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-[#2A1B24]/10 shadow-app pointer-events-none">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${activePassport.currentSOH >= 80 ? 'bg-emerald-500' : 'bg-[#F59E0B]'}`} />
                      <span className="text-[10px] font-mono font-bold text-[#2A1B24]">SOH Heatmap: {activePassport.currentSOH}%</span>
                    </div>
                  </div>
                </div>

                {/* SECTION 1: IDENTITY & MASSIVE 64px SOH */}
                <div className="bg-white shadow-app rounded-2xl p-6 sm:p-8 space-y-6 border border-[#2A1B24]/5">
                  <div className="flex items-center justify-between border-b border-[#2A1B24]/10 pb-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]/60 font-mono">
                      SECTION 01 // PASSPORT IDENTITY
                    </span>
                    <StatusBadge label={activePassport.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]/60 block font-mono">
                          PASSPORT IDENTIFIER
                        </span>
                        <span className="font-mono text-3xl font-black text-[#2A1B24]">
                          {activePassport.id}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs font-mono">
                        <div>
                          <span className="text-[#2A1B24]/60">SERIAL NUMBER: </span>
                          <strong className="text-[#2A1B24]">{activePassport.serialNumber}</strong>
                        </div>
                        <div>
                          <span className="text-[#2A1B24]/60">MODEL: </span>
                          <strong className="text-[#2A1B24]">{activePassport.modelName}</strong>
                        </div>
                        <div>
                          <span className="text-[#2A1B24]/60">CHEMISTRY: </span>
                          <strong className="font-bold text-[#2A1B24]">{activePassport.chemistry}</strong>
                        </div>
                        <div>
                          <span className="text-[#2A1B24]/60">MANUFACTURER: </span>
                          <strong className="text-[#2A1B24]">{activePassport.manufacturer}</strong>
                        </div>
                        <div>
                          <span className="text-[#2A1B24]/60">MANUFACTURED: </span>
                          <strong className="text-[#2A1B24]">{activePassport.productionDate}</strong>
                        </div>
                        <div>
                          <span className="text-[#2A1B24]/60">MASS: </span>
                          <strong className="text-[#2A1B24]">{activePassport.nominalMassKg} kg</strong>
                        </div>
                      </div>
                    </div>

                    {/* MASSIVE SOH DISPLAY */}
                    <div className="bg-[#EAEBEE]/60 rounded-2xl p-6 space-y-3 text-center border border-[#2A1B24]/10 shadow-app">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]/60 block font-mono">
                        STATE OF HEALTH (SOH)
                      </span>

                      <div className="text-6xl font-black font-mono leading-none text-[#2A1B24] tracking-tight">
                        {activePassport.currentSOH}%
                      </div>

                      {/* SOH Health Bar */}
                      <div className="w-full h-3 rounded-full bg-[#2A1B24]/10 overflow-hidden mt-2">
                        <div
                          className={`h-full ${
                            activePassport.currentSOH >= 80
                              ? 'bg-emerald-600'
                              : activePassport.currentSOH >= 65
                              ? 'bg-[#F59E0B]'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${activePassport.currentSOH}%` }}
                        />
                      </div>

                      <span className="text-[10px] font-mono text-[#2A1B24]/70 block uppercase tracking-wider pt-1">
                        {activePassport.currentSOH >= 80
                          ? 'FIRST-LIFE EV QUALIFIED (>= 80%)'
                          : activePassport.currentSOH >= 65
                          ? 'SECOND-LIFE BESS QUALIFIED (65% - 80%)'
                          : 'RECYCLING MANDATORY (< 65%)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: THE MORPHING REDACTION ENGINE */}
                <div className="bg-white shadow-app rounded-2xl p-6 sm:p-8 space-y-4 border border-[#2A1B24]/5 overflow-hidden">
                  <div className="border-b border-[#2A1B24]/10 pb-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]/60 font-mono">
                      SECTION 02 // MORPHING REDACTION ENGINE
                    </span>
                    <span className="text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-xl bg-[#2A1B24] text-[#F59E0B] shadow-app">
                      ROLE: {currentRole.toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#2A1B24]/80 block mb-2 font-mono">
                      PROPRIETARY CATHODE FORMULA RECIPE
                    </span>

                    <AnimatePresence mode="wait">
                      {isRedacted ? (
                        <motion.div
                          key="redacted-view"
                          initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                          transition={{ duration: 0.4 }}
                          className="bg-[#2A1B24] text-[#EAEBEE] p-6 rounded-2xl border border-[#2A1B24] space-y-3 shadow-app-lg relative overflow-hidden"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                            <div className="flex items-center gap-3">
                              <Lock className="w-5 h-5 text-[#F59E0B] shrink-0" />
                              <span className="text-lg font-black tracking-widest text-[#F59E0B] uppercase font-mono filter blur-[2px] select-none">
                                Li1.02Ni0.80Co0.10Mn0.10O2
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F59E0B] border border-[#F59E0B]/40 px-3 py-1 rounded-xl bg-white/5">
                              [ACCESS RESTRICTED: RECYCLER RBAC]
                            </span>
                          </div>
                          <p className="text-[11px] font-mono uppercase tracking-wider text-[#EAEBEE]/70 leading-relaxed border-t border-[#EAEBEE]/10 pt-2 relative z-10">
                            CONFIDENTIAL OEM PROPRIETARY CATHODE FORMULA — MORPHED & REDACTED FOR {currentRole.toUpperCase()} PERSONA.
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="unredacted-view"
                          initial={{ opacity: 0, filter: 'blur(10px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, filter: 'blur(10px)' }}
                          transition={{ duration: 0.4 }}
                          className="p-4 rounded-2xl border border-[#2A1B24]/15 font-mono text-xs font-bold text-[#2A1B24] bg-[#EAEBEE]/50 shadow-app"
                        >
                          {activePassport.cathodeRecipeSecret || 'Li1.02Ni0.80Co0.10Mn0.10O2-ZrDoped'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <MathCard
                    title="Redaction Engine Evaluation (Role-Based Access Control)"
                    subtitle="Role Access Matrix & Cryptographic Proof Isolation"
                    mathFormulation={{
                      variables: "Role ∈ {Manufacturer, Recycler, Auditor}, Field ∈ Registry_Fields",
                      objective: "Evaluate Access(Role, Field)",
                      constraints: [
                        "Access(Role, proprietary_cathode_recipe) = 1 if Role = Manufacturer else 0",
                        "Hash_Proof_Valid = 1 (Independent of Data Visibility Redaction)"
                      ],
                      equation: `Access(Role, Field) = \\begin{cases} 1 & \\text{if } Role \\in Authorized\\_Roles \\\\ 0 & \\text{otherwise} \\end{cases}\n\nEvaluated: Access(${currentRole.toUpperCase()}, proprietary_cathode_recipe) = ${isRedacted ? '0 \\implies REDACTED' : '1 \\implies UNREDACTED'}`
                    }}
                    englishTranslation={{
                      conclusion: `Morphing Redaction Engine Role Access Evaluation:

• ACTIVE PERSONA: ${currentRole.toUpperCase()}
• TARGET FIELD: proprietary_cathode_recipe (Confidential OEM Cathode Chemistry Formula)
• ACCESS MATRIX RESULT: Access(${currentRole.toUpperCase()}, proprietary_cathode_recipe) = ${isRedacted ? '0 (REDACTED & BLURRED)' : '1 (AUTHORIZED & SHOWN)'}.

${isRedacted 
  ? `Why this field is morphed & redacted: You are viewing this battery passport as a ${currentRole.toUpperCase()} persona. OEM proprietary chemical recipes (e.g., Zr-doped NMC cathode proportions) contain trade secrets. The Role-Based Access Control (RBAC) matrix evaluates to 0, smoothly blurring the text and rendering a locked Deep Aubergine glassmorphic container.`
  : `Why this field is visible: You are viewing this battery passport as a ${currentRole.toUpperCase()} persona. Your role possesses explicit administrative authorization to inspect raw OEM chemical formulation secrets.`}`,
                      constraintAnalysis: `Cryptographic Proof Isolation Invariant:

Even though raw proprietary recipe data is hidden for non-manufacturer roles, the underlying SHA-256 block hash and Secure Element hardware signature remain 100% intact and publicly verifiable. Anyone can verify that the passport has not been tampered with without having to expose the raw proprietary secret.`,
                      personaContext: `Current Active Role: ${currentRole.toUpperCase()} | Redaction Matrix State: ${isRedacted ? 'LOCKED (ACCESS RESTRICTED)' : 'UNLOCKED (FULL OEM ACCESS)'}`
                    }}
                  />
                </div>

                {/* SECTION 3: LIFECYCLE TIMELINE */}
                <div className="bg-white shadow-app rounded-2xl p-6 sm:p-8 space-y-6 border border-[#2A1B24]/5">
                  <div className="border-b border-[#2A1B24]/10 pb-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]/60 font-mono">
                      SECTION 03 // CRYPTOGRAPHIC LIFECYCLE TIMELINE
                    </span>
                    <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#2A1B24] font-mono">
                      {currentEvents.length} EVENT BLOCKS ANCHORED
                    </span>
                  </div>

                  <div className="space-y-4 relative pl-6 border-l-2 border-[#2A1B24]/20">
                    <AnimatePresence initial={false}>
                      {currentEvents.map((blk) => (
                        <motion.div
                          key={blk.blockIndex}
                          initial={{ opacity: 0, y: -12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          className="p-5 rounded-2xl bg-[#EAEBEE]/50 border border-[#2A1B24]/10 space-y-3 relative shadow-app"
                        >
                          {/* Node marker */}
                          <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-[#F59E0B] border-2 border-[#2A1B24]" />

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-black text-[#2A1B24]">
                                BLOCK #{blk.blockIndex}
                              </span>
                              <StatusBadge label={blk.eventType} />
                              <span className="text-[10px] uppercase tracking-wider font-bold border border-[#2A1B24]/20 px-2 py-0.5 rounded-lg font-mono">
                                {blk.actorRole}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#2A1B24]/60 font-mono font-bold">
                              {new Date(blk.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-xs text-[#2A1B24] font-bold font-mono">
                            {blk.payloadSummary}
                          </p>

                          <div className="p-3 bg-[#2A1B24] text-[#EAEBEE] rounded-xl font-mono text-[11px] space-y-1.5 border border-[#2A1B24]">
                            <div className="flex items-center justify-between text-[#EAEBEE]/70">
                              <span>PREVIOUS HASH:</span>
                              <TruncatedHash hash={blk.previousHash} prefixLen={8} suffixLen={6} />
                            </div>
                            <div className="flex items-center justify-between font-bold text-[#F59E0B]">
                              <span>CURRENT HASH:</span>
                              <TruncatedHash hash={blk.currentHash} prefixLen={8} suffixLen={6} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* SECTION 04: BATTERY LIFECYCLE TELEMETRY */}
                <div className="bg-white shadow-app rounded-2xl p-6 sm:p-8 space-y-6 border border-[#2A1B24]/5">
                  <div className="border-b border-[#2A1B24]/10 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]/60 font-mono block">
                        SECTION 04 // REAL-TIME TELEMETRY FEED
                      </span>
                      <h2 className="text-lg font-black uppercase text-[#2A1B24] tracking-tight mt-0.5">
                        BATTERY LIFECYCLE TELEMETRY
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-3 py-1 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 shadow-app">
                      QPIAI TELEMETRY FEED
                    </span>
                  </div>

                  {/* HORIZONTAL LIFECYCLE JOURNEY TIMELINE */}
                  <div className="space-y-4">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2A1B24]/70 block">
                      Lifecycle Journey Milestones
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative font-mono">
                      {/* Step 1: Manufactured */}
                      <div className="bg-[#2A1B24] text-[#EAEBEE] p-4 rounded-xl space-y-2 border-t-4 border-[#3B82F6] shadow-app">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#3B82F6] uppercase">01. MANUFACTURED</span>
                          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                        </div>
                        <div className="text-xs font-bold text-[#EAEBEE]">{activePassport.productionDate}</div>
                        <p className="text-[10px] text-[#EAEBEE]/70 font-sans">
                          Genesis Anchor: Initial Capacity {activePassport.initialCapacityKWh} kWh @ 100% SOH
                        </p>
                      </div>

                      {/* Step 2: Lifecycle Updates */}
                      <div className="bg-[#2A1B24] text-[#EAEBEE] p-4 rounded-xl space-y-2 border-t-4 border-[#A3E635] shadow-app">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#A3E635] uppercase">02. UPDATES</span>
                          <span className="w-2 h-2 rounded-full bg-[#A3E635]" />
                        </div>
                        <div className="text-xs font-bold text-[#A3E635]">SOH: {activePassport.currentSOH}%</div>
                        <p className="text-[10px] text-[#EAEBEE]/70 font-sans">
                          {activePassport.cycleCount} Cycles Recorded ({activePassport.healthLogs?.length || 0} Diagnostics)
                        </p>
                      </div>

                      {/* Step 3: QUBO Decision */}
                      <div className="bg-[#2A1B24] text-[#EAEBEE] p-4 rounded-xl space-y-2 border-t-4 border-[#3B82F6] shadow-app">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#3B82F6] uppercase">03. QUBO DECISION</span>
                          <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                        </div>
                        <div className="text-xs font-bold text-[#F59E0B]">
                          {activePassport.currentSOH >= 65 ? 'SECOND-LIFE' : 'RECYCLING'}
                        </div>
                        <p className="text-[10px] text-[#EAEBEE]/70 font-sans">
                          {activePassport.currentSOH >= 65 ? 'Allocated to Grid BESS' : 'Routed to Hydromet Refiner'}
                        </p>
                      </div>

                      {/* Step 4: Recycling */}
                      <div className="bg-[#2A1B24] text-[#EAEBEE] p-4 rounded-xl space-y-2 border-t-4 border-[#F59E0B] shadow-app">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#F59E0B] uppercase">04. RECYCLING</span>
                          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                        </div>
                        <div className="text-xs font-bold text-[#EAEBEE]">{activePassport.nominalMassKg} kg Mass</div>
                        <p className="text-[10px] text-[#EAEBEE]/70 font-sans">
                          Closed-Loop Mass Balance Reconciliation
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RECHARTS SOH DEGRADATION TRAJECTORY CHART */}
                  <div className="bg-[#2A1B24] text-[#EAEBEE] p-5 rounded-2xl border border-[#2A1B24] shadow-app space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#A3E635]">
                        SOH DEGRADATION & CYCLE TRAJECTORY
                      </span>
                      <span className="text-[10px] text-[#EAEBEE]/60 font-sans">
                        Current SOH: <strong className="text-[#A3E635]">{activePassport.currentSOH}%</strong> | Cycles: <strong className="text-[#3B82F6]">{activePassport.cycleCount}</strong>
                      </span>
                    </div>

                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { milestone: 'Genesis', soh: 100, targetThreshold: 65 },
                            { milestone: 'First-Life', soh: Math.min(100, activePassport.currentSOH + 8), targetThreshold: 65 },
                            { milestone: 'Current', soh: activePassport.currentSOH, targetThreshold: 65 },
                            { milestone: 'End-of-Life', soh: Math.max(40, activePassport.currentSOH - 18), targetThreshold: 65 },
                          ]}
                          margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="sohGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#A3E635" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="milestone" stroke="#EAEBEE" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                          <YAxis domain={[0, 100]} stroke="#EAEBEE" tick={{ fontSize: 10, fontFamily: 'monospace' }} unit="%" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#181016', borderColor: '#A3E635', borderRadius: '12px', color: '#FFF' }}
                            formatter={(val?: any) => [`${val ?? 0}%`, 'SOH']}
                          />
                          <Area type="monotone" dataKey="soh" stroke="#A3E635" strokeWidth={3} fillOpacity={1} fill="url(#sohGradient)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* SECTION 05: ACTIONS */}
                <div className="bg-white shadow-app rounded-2xl p-6 sm:p-8 space-y-4 border border-[#2A1B24]/5">
                  <div className="border-b border-[#2A1B24]/10 pb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]/60 block font-mono">
                      SECTION 05 // AUTHORIZED ROLE ACTIONS
                    </span>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setIsSohModalOpen(true)}
                      disabled={isRecycler}
                      className={`w-full py-3.5 px-6 rounded-2xl text-xs uppercase tracking-[0.2em] font-bold font-mono transition-all flex items-center justify-center gap-2 shadow-app active:scale-95 ${
                        !isRecycler
                          ? 'bg-[#F59E0B] text-[#2A1B24] hover:bg-[#2A1B24] hover:text-[#EAEBEE] cursor-pointer'
                          : 'bg-[#2A1B24]/10 text-[#2A1B24]/40 border border-[#2A1B24]/10 cursor-not-allowed'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>ADD STATE-OF-HEALTH UPDATE</span>
                    </button>

                    {isRecycler && (
                      <div className="p-3.5 rounded-xl border border-red-800/20 bg-red-50 text-red-900 text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-2 shadow-app">
                        <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
                        <span>
                          SOH updates restricted: The RECYCLER role lacks write permissions for battery State of Health.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="p-12 bg-white shadow-app rounded-2xl border border-[#2A1B24]/5 text-center font-mono text-[#2A1B24]">
                Select a battery passport from the directory list.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SOH Update Modal */}
      <Modal
        isOpen={isSohModalOpen}
        onClose={() => setIsSohModalOpen(false)}
        title="ADD STATE-OF-HEALTH UPDATE"
        subtitle={`POST /api/passports/${activePassportId}/events — Signed diagnostic update`}
      >
        <form onSubmit={handleSohSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-[#2A1B24] mb-1 font-mono">
              Tested State of Health (SOH %)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={newSohValue}
              onChange={(e) => setNewSohValue(parseFloat(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A1B24]/20 font-mono text-sm bg-[#EAEBEE]/50 focus:outline-none focus:border-[#2A1B24]"
              required
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-[#2A1B24] mb-1 font-mono">
              Diagnostic Notes
            </label>
            <textarea
              value={sohNotes}
              onChange={(e) => setSohNotes(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#2A1B24]/20 font-mono text-xs bg-[#EAEBEE]/50 focus:outline-none focus:border-[#2A1B24]"
              required
            />
          </div>

          <div className="p-3.5 rounded-xl border border-[#2A1B24]/15 bg-[#2A1B24]/5 text-xs font-mono text-[#2A1B24]/80">
            <strong>Crypto Pipeline:</strong> Backend verifies actor role ({currentRole.toUpperCase()}), requests 128-bit QpiAI Quantum QRNG nonce, computes SHA-256 block hash, and appends to the immutable chain.
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#2A1B24]/10">
            <button
              type="button"
              onClick={() => setIsSohModalOpen(false)}
              className="px-4 py-2 text-xs uppercase tracking-wider font-bold text-[#2A1B24] border border-[#2A1B24]/20 rounded-xl cursor-pointer font-mono hover:bg-[#2A1B24]/5"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmittingSoh}
              className="px-5 py-2 text-xs uppercase tracking-wider font-bold bg-[#F59E0B] text-[#2A1B24] border border-[#2A1B24]/20 rounded-xl cursor-pointer font-mono hover:bg-[#2A1B24] hover:text-[#EAEBEE] transition-all shadow-app"
            >
              {isSubmittingSoh ? 'SIGNING & COMPUTING NONCE...' : 'SUBMIT SOH UPDATE'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
