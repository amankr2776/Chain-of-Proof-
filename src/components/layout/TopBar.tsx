/**
 * Chain of Proof - Brutalist TopBar Component
 * Ice Silver canvas, Deep Aubergine borders, Marigold action buttons, sharp 0px corners.
 */

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  RotateCcw,
  Bug,
  Copy,
  Check,
  Radio,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types';
import { ROLE_CONFIGS } from '../../data/initialMockData';
import { TruncatedHash } from '../common/TruncatedHash';
import { FASTAPI_BASE_URL } from '../../services/qpiaiApi';

export const TopBar: React.FC = () => {
  const currentRole = useAppStore((state) => state.currentRole);
  const setRole = useAppStore((state) => state.setRole);
  const isChainValid = useAppStore((state) => state.isChainValid);
  const isTampered = useAppStore((state) => state.isTampered);
  const toggleDemoTamper = useAppStore((state) => state.toggleDemoTamper);
  const verifyChain = useAppStore((state) => state.verifyChain);
  const resetToInitialData = useAppStore((state) => state.resetToInitialData);

  const systemStatus = useAppStore((state) => state.systemStatus);
  const setSystemStatus = useAppStore((state) => state.setSystemStatus);
  const [isVerifying, setIsVerifying] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkBackendStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1800);
        const res = await fetch(`${FASTAPI_BASE_URL}/api/health`, {
          signal: controller.signal,
        }).catch(() => null);
        clearTimeout(timeoutId);

        if (isMounted) {
          if (res && res.ok) {
            setSystemStatus('connected');
          } else {
            setSystemStatus('fallback');
          }
        }
      } catch {
        if (isMounted) {
          setSystemStatus('fallback');
        }
      }
    };

    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 8000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const roleConfig = ROLE_CONFIGS[currentRole];

  const handleVerifyClick = async () => {
    setIsVerifying(true);
    await verifyChain();
    setTimeout(() => setIsVerifying(false), 500);
  };

  const handleCopyWallet = () => {
    if (!roleConfig?.walletAddress) return;
    navigator.clipboard.writeText(roleConfig.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const roles: { id: UserRole; label: string; org: string }[] = [
    { id: 'manufacturer', label: 'MANUFACTURER (OEM)', org: 'Nordic Volta Energy' },
    { id: 'second_life', label: 'SECOND-LIFE OPERATOR', org: 'GridReserve BESS Ops' },
    { id: 'recycler', label: 'RECYCLER 1 (VALENCE)', org: 'Valence Material Recovery' },
  ];

  return (
    <header className="h-[64px] glass-header border-b border-[#2A1B24]/10 px-6 sm:px-8 flex items-center justify-between shrink-0 z-30 sticky top-0 shadow-app">
      {/* Left: Role Switcher & Network Badge */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#2A1B24]/60 hidden lg:inline font-mono">
              ACTIVE PERSONA:
            </span>
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/70 hover:bg-white border border-[#2A1B24]/15 text-[#2A1B24] text-[11px] uppercase tracking-[0.15em] font-mono font-bold transition-all shadow-app hover:shadow-app-hover cursor-pointer"
            >
              <span>{roleConfig.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#2A1B24]/70" />
            </button>
          </div>

          {/* Role Switcher Menu */}
          {roleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-80 glass-card rounded-2xl shadow-app-lg border border-[#2A1B24]/10 py-2 z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#2A1B24]/60 border-b border-[#2A1B24]/10 font-mono">
                  SWITCH PERSONA CONTEXT
                </div>
                {roles.map((r) => {
                  const isSelected = r.id === currentRole;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setRole(r.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 flex flex-col transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F59E0B] text-[#2A1B24] font-bold'
                          : 'hover:bg-[#2A1B24]/5 text-[#2A1B24]'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-[0.15em] font-bold font-mono">{r.label}</span>
                      <span className="text-[11px] opacity-75 font-mono">{r.org}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Global System Status Indicator */}
        <div className="hidden md:flex items-center">
          {systemStatus === 'checking' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl border border-slate-600 bg-slate-800 text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-slate-300 shadow-app">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
              <span>CHECKING SYSTEM...</span>
            </div>
          )}

          {systemStatus === 'connected' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl border border-[#3B82F6]/60 bg-[#3B82F6]/20 text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-[#60A5FA] shadow-app">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-pulse shadow-[0_0_8px_#3B82F6]" />
              <span>QPIAI CLOUD: CONNECTED</span>
            </div>
          )}

          {systemStatus === 'fallback' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl border border-[#F59E0B]/50 bg-[#F59E0B]/15 text-[10px] font-mono font-bold tracking-[0.15em] uppercase text-[#F59E0B] shadow-app">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse shadow-[0_0_8px_#F59E0B]" />
              <span>LOCAL SIMULATION ACTIVE (FALLBACK)</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 md:gap-3">
        {/* Return to Landing Page */}
        <button
          onClick={() => useAppStore.getState().setIsLandingPage(true)}
          className="text-[#2A1B24] hover:text-[#2A1B24] hover:bg-white text-[11px] uppercase tracking-[0.15em] font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 border border-[#2A1B24]/15 rounded-xl transition-all shadow-app cursor-pointer font-mono"
          title="Return to Splash / Landing Page"
        >
          <span>LANDING</span>
        </button>

        {/* Reset Seed Button */}
        <button
          onClick={resetToInitialData}
          className="text-[#2A1B24] hover:text-[#2A1B24] hover:bg-white text-[11px] uppercase tracking-[0.15em] font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/60 border border-[#2A1B24]/15 rounded-xl transition-all shadow-app cursor-pointer font-mono"
          title="Reset seed data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">RESET</span>
        </button>

        {/* Demo Tamper Debug Toggle */}
        <button
          onClick={toggleDemoTamper}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-[0.15em] font-mono font-bold border transition-all cursor-pointer shadow-app ${
            isTampered
              ? 'bg-[#2A1B24] text-[#F59E0B] border-[#2A1B24]'
              : 'bg-white text-[#2A1B24] border-[#2A1B24]/15 hover:bg-[#F59E0B]/10 hover:border-[#F59E0B]'
          }`}
          title="Toggle artificial hash corruption on Block #1"
        >
          <Bug className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isTampered ? 'TAMPER ACTIVE' : 'TEST TAMPER'}
          </span>
        </button>

        {/* Truncated Wallet Address Pill with Copy Icon */}
        <div
          onClick={handleCopyWallet}
          className="flex items-center gap-2 bg-white/60 border border-[#2A1B24]/15 px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-[0.15em] font-mono font-medium text-[#2A1B24] hover:bg-white cursor-pointer transition-all shadow-app"
          title="Click to copy actor wallet address"
        >
          <TruncatedHash
            hash={roleConfig.walletAddress}
            prefixLen={5}
            suffixLen={4}
            className="border-0 bg-transparent p-0 text-[11px] font-mono"
            showCopy={false}
          />
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[#2A1B24]" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-[#2A1B24]/50 hover:text-[#2A1B24]" />
          )}
        </div>

        {/* Primary Action: Verify Chain Button */}
        <button
          onClick={handleVerifyClick}
          disabled={isVerifying}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] uppercase tracking-[0.15em] font-mono font-bold transition-all cursor-pointer shadow-app active:scale-95 ${
            isChainValid
              ? 'bg-[#F59E0B] text-[#2A1B24] hover:bg-[#2A1B24] hover:text-[#EAEBEE]'
              : 'bg-[#2A1B24] text-[#F59E0B] border border-[#F59E0B]'
          }`}
        >
          <span>{isVerifying ? 'VERIFYING...' : isChainValid ? 'VERIFY CHAIN' : 'CORRUPTED'}</span>
        </button>
      </div>
    </header>
  );
};
