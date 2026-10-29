/**
 * Chain of Proof - Minimal Architectural Landing Page
 * Crystal-clear brutalist typography, immediate legibility, high-impact line-reveal animations,
 * and 4D Hyper-Tesseract Quantum Matrix Background.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { Cinematic3DBackground } from '../common/Cinematic3DBackground';
import { ArchitecturalGrid } from '../common/ArchitecturalGrid';

export const LandingPage: React.FC = () => {
  const enterApp = useAppStore((state) => state.enterApp);
  const [isHoveringCta, setIsHoveringCta] = useState(false);
  const [activeModal, setActiveModal] = useState<'about' | 'architecture' | null>(null);

  // High-weight architectural cubic-bezier
  const easeArchitect: [number, number, number, number] = [0.16, 1, 0.3, 1];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#EAEBEE] text-[#2A1B24] font-sans antialiased select-none flex flex-col justify-between p-6 md:p-12">
      {/* 4D Hyper-Tesseract Quantum Matrix Background */}
      <Cinematic3DBackground isZoomed={isHoveringCta} opacity={0.88} />

      {/* Architectural Grid Lines Overlay */}
      <ArchitecturalGrid isPulsing={isHoveringCta} animateIn={false} />

      {/* Top Header Bar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeArchitect }}
        className="relative z-10 flex items-center justify-between border-b border-[#2A1B24]/20 pb-4"
      >
        {/* Editorial Brand Mark */}
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-[#F59E0B]" />
          <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#2A1B24] font-mono">
            CHAIN OF PROOF // 01
          </span>
        </div>

        {/* Minimal Navigation Items */}
        <div className="flex items-center space-x-6 md:space-x-10">
          <button
            onClick={() => setActiveModal('architecture')}
            className="text-[11px] tracking-[0.2em] uppercase font-mono font-medium text-[#2A1B24] hover:text-[#F59E0B] transition-colors cursor-pointer"
          >
            ARCHITECTURE
          </button>
          <button
            onClick={() => setActiveModal('about')}
            className="text-[11px] tracking-[0.2em] uppercase font-mono font-medium text-[#2A1B24] hover:text-[#F59E0B] transition-colors cursor-pointer"
          >
            ABOUT
          </button>
          <button
            onClick={enterApp}
            onMouseEnter={() => setIsHoveringCta(true)}
            onMouseLeave={() => setIsHoveringCta(false)}
            className="border-2 border-[#2A1B24] bg-[#2A1B24] text-[#EAEBEE] hover:bg-[#F59E0B] hover:text-[#2A1B24] hover:border-[#2A1B24] text-[11px] font-bold tracking-[0.2em] uppercase px-5 py-2.5 transition-all duration-200 cursor-pointer rounded-none"
          >
            ENTER APP
          </button>
        </div>
      </motion.header>

      {/* Main Center Hero Content */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center text-center max-w-5xl mx-auto py-8">
        {/* Massive Primary Title */}
        <div className="overflow-hidden py-1">
          <motion.h1
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: easeArchitect }}
            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-[#2A1B24] uppercase leading-none select-none drop-shadow-sm"
          >
            CHAIN OF PROOF
          </motion.h1>
        </div>

        {/* One-Line Subtitle */}
        <div className="overflow-hidden mt-6">
          <motion.p
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: easeArchitect }}
            className="text-xs md:text-sm font-bold tracking-[0.15em] uppercase text-[#2A1B24]/90 max-w-2xl font-mono"
          >
            Cryptographically Verifiable EV Battery Lifecycle Passports
          </motion.p>
        </div>

        {/* Prominent Primary Call To Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: easeArchitect }}
          className="mt-10 md:mt-12"
        >
          <button
            onClick={enterApp}
            onMouseEnter={() => setIsHoveringCta(true)}
            onMouseLeave={() => setIsHoveringCta(false)}
            className="relative group border-2 border-[#2A1B24] bg-[#F59E0B] text-[#2A1B24] text-xs md:text-sm font-bold tracking-[0.25em] uppercase px-10 py-5 transition-all duration-300 hover:bg-[#2A1B24] hover:text-[#EAEBEE] cursor-pointer rounded-none active:scale-95 shadow-none"
          >
            <span className="relative z-10 flex items-center space-x-3">
              <span>INITIALIZE PROTOCOL</span>
              <span className="inline-block transform group-hover:translate-x-1.5 transition-transform duration-200">
                →
              </span>
            </span>
          </button>
        </motion.div>
      </main>

      {/* Bottom Corner Minimal Metadata Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6, ease: easeArchitect }}
        className="relative z-10 flex flex-col md:flex-row items-center justify-between border-t border-[#2A1B24]/20 pt-4 text-[10px] md:text-[11px] font-mono text-[#2A1B24]/80 gap-3"
      >
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-[#F59E0B]" />
          <span className="font-bold tracking-[0.15em] uppercase">SYSTEM: ONLINE</span>
        </div>

        <div className="hidden lg:block text-[#2A1B24]/60 tracking-widest uppercase">
          QPIAI QUANTUM MILP SOLVER • EU 2026 REGULATION READY
        </div>

        <div className="flex items-center space-x-2 font-bold tracking-[0.15em] uppercase">
          <span>CHAIN OF PROOF PROTOCOL</span>
        </div>
      </motion.footer>

      {/* Minimal Overlay Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[#2A1B24]/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25, ease: easeArchitect }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#EAEBEE] border-2 border-[#2A1B24] max-w-xl w-full p-8 relative rounded-none text-[#2A1B24]"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 font-mono text-xs font-bold text-[#2A1B24] hover:text-[#F59E0B] cursor-pointer"
              >
                [ CLOSE ✕ ]
              </button>

              {activeModal === 'architecture' && (
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#F59E0B] mb-2 font-mono">
                    CHAIN OF PROOF // ARCHITECTURE
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-[#2A1B24]">
                    ZERO-TAMPER RECONCILIATION
                  </h3>
                  <p className="text-xs font-mono leading-relaxed text-[#2A1B24]/80 mb-6">
                    A role-aware Web3 platform that tracks EV batteries from genesis manufacturing through repair, second-life reuse, and final material recycling. Powered by QpiAI Quantum MILP QUBO solvers and 128-bit quantum nonces.
                  </p>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      enterApp();
                    }}
                    className="w-full bg-[#2A1B24] text-[#EAEBEE] font-bold tracking-[0.2em] uppercase text-xs py-3 border border-[#2A1B24] hover:bg-[#F59E0B] hover:text-[#2A1B24] transition-colors rounded-none cursor-pointer"
                  >
                    ENTER APP NOW →
                  </button>
                </div>
              )}

              {activeModal === 'about' && (
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#F59E0B] mb-2 font-mono">
                    CHAIN OF PROOF // ABOUT
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 text-[#2A1B24]">
                    ROLE-BASED COMPLIANCE
                  </h3>
                  <p className="text-xs font-mono leading-relaxed text-[#2A1B24]/80 mb-6">
                    Provides customized views for Manufacturers, Repairers, Second-Life Operators, Recyclers, and Auditors. Every record is cryptographically signed and mathematically verified against original battery chemistry specs.
                  </p>
                  <button
                    onClick={() => {
                      setActiveModal(null);
                      enterApp();
                    }}
                    className="w-full bg-[#F59E0B] text-[#2A1B24] font-bold tracking-[0.2em] uppercase text-xs py-3 border border-[#2A1B24] hover:bg-[#2A1B24] hover:text-[#EAEBEE] transition-colors rounded-none cursor-pointer"
                  >
                    ENTER APP NOW →
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
