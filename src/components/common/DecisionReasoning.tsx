/**
 * Chain of Proof - Reusable DecisionReasoning Component
 * Displays human-readable business logic reasoning with Cobalt Blue accent border
 * STRICT RULE: No math jargon (no QUBO, Hamiltonian, Binary variable, Superposition, Nonce).
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface DecisionReasoningProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  status?: 'success' | 'warning' | 'info' | 'error';
  reasoningItems: Array<{
    heading: string;
    body: string;
    status?: 'success' | 'warning' | 'error' | 'info';
  }>;
  className?: string;
}

export const DecisionReasoning: React.FC<DecisionReasoningProps> = ({
  title,
  subtitle,
  badgeText = 'PLAIN ENGLISH REASONING',
  status = 'info',
  reasoningItems,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl p-5 sm:p-6 bg-[#181016] border-l-4 border-l-[#3B82F6] border border-[#3B82F6]/30 text-white shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Decorative subtle blue glow */}
      <div className="absolute -right-10 -top-10 w-36 h-36 bg-[#3B82F6]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#3B82F6] shrink-0" />
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#60A5FA]">
              {badgeText}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#EAEBEE]/80 font-mono mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>

        {status && (
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-xl bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/40 shrink-0 self-start sm:self-auto">
            SYSTEM DECISION PROOF
          </span>
        )}
      </div>

      {/* Body Items */}
      <div className="space-y-3 relative z-10 font-sans text-xs sm:text-sm">
        {reasoningItems.map((item, idx) => {
          const isErr = item.status === 'error';
          const isWarn = item.status === 'warning';
          const isSuccess = item.status === 'success';

          const borderAccent = isErr
            ? 'border-l-red-500 border-red-500/30 bg-red-950/30'
            : isWarn
            ? 'border-l-amber-500 border-amber-500/30 bg-amber-950/30'
            : isSuccess
            ? 'border-l-emerald-500 border-emerald-500/30 bg-emerald-950/30'
            : 'border-l-[#3B82F6] border-[#3B82F6]/30 bg-white/5';

          const headingColor = isErr
            ? 'text-red-400'
            : isWarn
            ? 'text-amber-400'
            : isSuccess
            ? 'text-emerald-400'
            : 'text-[#60A5FA]';

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border-l-4 border ${borderAccent} space-y-1`}
            >
              <div className="flex items-center gap-2">
                {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {isErr && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
                {isWarn && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                {!isSuccess && !isErr && !isWarn && (
                  <ShieldCheck className="w-4 h-4 text-[#60A5FA] shrink-0" />
                )}
                <span className={`text-xs font-mono font-bold uppercase tracking-wider ${headingColor}`}>
                  {item.heading}
                </span>
              </div>
              <p className="text-white text-xs sm:text-sm font-normal leading-relaxed pt-0.5">
                {item.body}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
