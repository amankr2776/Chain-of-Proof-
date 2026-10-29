/**
 * Chain of Proof - Reusable MathCard Component
 * Displays mathematical equations (JetBrains Mono) and plain-English explanations (Inter)
 * with a toggle between Math Formulation & Plain-English Translation.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, BookOpen, Sparkles, Binary } from 'lucide-react';

export interface MathCardProps {
  title: string;
  subtitle?: string;
  mathFormulation: {
    variables?: string;
    objective?: string;
    constraints?: string[];
    equation?: string;
    quantumCircuit?: string;
  };
  englishTranslation: {
    conclusion: string;
    constraintAnalysis?: string;
    quantumSecurity?: string;
    personaContext?: string;
  };
  className?: string;
  defaultMode?: 'english' | 'math';
}

export const MathCard: React.FC<MathCardProps> = ({
  title,
  subtitle,
  mathFormulation,
  englishTranslation,
  className = '',
  defaultMode = 'english',
}) => {
  const [mode, setMode] = useState<'english' | 'math'>(defaultMode);

  return (
    <div
      className={`rounded-2xl p-6 sm:p-7 border border-[#F59E0B]/40 bg-[#2A1B24] text-[#EAEBEE] shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Decorative Gradient Glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-5 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-[#F59E0B]">
              MATH & LOGIC VERIFIER
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mt-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-[#EAEBEE]/80 font-mono mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center bg-[#181016] p-1 rounded-xl border border-white/15 shrink-0 self-start sm:self-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => setMode('english')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              mode === 'english'
                ? 'bg-[#F59E0B] text-[#2A1B24] shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ENGLISH</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('math')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
              mode === 'math'
                ? 'bg-[#3B82F6] text-white shadow-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>QUBO MATH</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      <AnimatePresence mode="wait">
        {mode === 'english' ? (
          <motion.div
            key="english-mode"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 relative z-10 text-xs sm:text-sm font-sans leading-relaxed"
          >
            {/* Conclusion */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#1C1219] border-l-4 border-l-[#3B82F6] border border-[#3B82F6]/40 space-y-2 shadow-md">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#60A5FA] block flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                WHAT THE ENGINE CONCLUDED:
              </span>
              <p className="text-[#FFFFFF] font-medium leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                {englishTranslation.conclusion}
              </p>
            </div>

            {/* Constraint Analysis */}
            {englishTranslation.constraintAnalysis && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#1C1219] border-l-4 border-l-[#F59E0B] border border-[#F59E0B]/40 space-y-2 shadow-md">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#F59E0B] block flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  CONSTRAINT ANALYSIS & SAFETY RULES:
                </span>
                <p className="text-[#FFFFFF] font-medium leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                  {englishTranslation.constraintAnalysis}
                </p>
              </div>
            )}

            {/* Quantum Security */}
            {englishTranslation.quantumSecurity && (
              <div className="p-4 sm:p-5 rounded-xl bg-[#1C1219] border-l-4 border-l-[#10B981] border border-[#10B981]/40 space-y-2 font-mono text-xs shadow-md">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#10B981] block flex items-center gap-2">
                  <Binary className="w-4 h-4 text-[#10B981]" />
                  QPIAI QCLOUD QUANTUM PROOF:
                </span>
                <p className="text-[#FFFFFF] font-medium leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                  {englishTranslation.quantumSecurity}
                </p>
              </div>
            )}

            {/* Persona Context Badge */}
            {englishTranslation.personaContext && (
              <div className="text-xs font-mono text-[#F59E0B] font-bold pt-1 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                <span>PERSONA VIEW: {englishTranslation.personaContext}</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="math-mode"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="space-y-3 relative z-10 font-mono text-xs text-[#EAEBEE]"
          >
            {/* Equation / Formulation */}
            <div className="p-4 rounded-xl bg-[#161616] border border-[#EAEBEE]/20 space-y-2 overflow-x-auto">
              {mathFormulation.equation && (
                <div>
                  <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider block">
                    FORMULATION EQUATION:
                  </span>
                  <div className="text-sm font-bold text-[#60A5FA] pt-1">
                    {mathFormulation.equation}
                  </div>
                </div>
              )}

              {mathFormulation.variables && (
                <div>
                  <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider block">
                    DECISION VARIABLES:
                  </span>
                  <div className="text-xs text-white pt-0.5">{mathFormulation.variables}</div>
                </div>
              )}

              {mathFormulation.objective && (
                <div>
                  <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider block">
                    OBJECTIVE FUNCTION:
                  </span>
                  <div className="text-xs text-[#60A5FA] pt-0.5">{mathFormulation.objective}</div>
                </div>
              )}

              {mathFormulation.constraints && mathFormulation.constraints.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider block">
                    HARD CONSTRAINTS & PENALTIES:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-[#EAEBEE]/90 pt-0.5">
                    {mathFormulation.constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {mathFormulation.quantumCircuit && (
                <div className="pt-2 border-t border-[#EAEBEE]/15">
                  <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider block">
                    QCLOUD QUANTUM CIRCUIT STATE:
                  </span>
                  <div className="text-xs text-[#10B981] pt-0.5">{mathFormulation.quantumCircuit}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
