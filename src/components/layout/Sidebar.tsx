/**
 * Chain of Proof - Deep Aubergine Architectural Editorial Sidebar
 * Framer Motion spring collapse/expand and animated Marigold left border.
 * 280px default width, NO icons, text-only navigation with heavy tracking (tracking-[0.2em]).
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { NavItemId } from '../../types';
import { ROLE_CONFIGS } from '../../data/initialMockData';

interface NavItemDef {
  id: NavItemId;
  label: string;
}

const ALL_NAV_ITEMS: NavItemDef[] = [
  { id: 'dashboard', label: 'DASHBOARD' },
  { id: 'passport_studio', label: 'PASSPORT STUDIO' },
  { id: 'disposition_console', label: 'DISPOSITION CONSOLE' },
  { id: 'recycling_hub', label: 'RECYCLING HUB' },
  { id: 'reconciliation', label: 'RECONCILIATION' },
  { id: 'chain_explorer', label: 'CHAIN EXPLORER' },
];

export const Sidebar: React.FC = () => {
  const currentRole = useAppStore((state) => state.currentRole);
  const activeNavItem = useAppStore((state) => state.activeNavItem);
  const setActiveNavItem = useAppStore((state) => state.setActiveNavItem);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const roleConfig = ROLE_CONFIGS[currentRole];
  const allowedIds = roleConfig ? roleConfig.allowedNavItems : [];

  // Filter navigation items strictly
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) =>
    allowedIds.includes(item.id)
  );

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="bg-[#2A1B24] text-[#EAEBEE] flex flex-col shrink-0 min-h-screen border-r border-[#2A1B24] relative z-20 select-none overflow-hidden"
    >
      {/* Brand Header */}
      <div className="h-[80px] px-6 flex items-center justify-between border-b border-[#EAEBEE]/15 shrink-0">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#F59E0B]">
              WEB3 AUDIT PLATFORM
            </span>
            <span className="text-[20px] font-black tracking-tight text-[#EAEBEE] uppercase mt-0.5">
              CHAIN OF PROOF
            </span>
          </motion.div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 border border-[#EAEBEE]/30 text-[#EAEBEE] hover:bg-[#EAEBEE] hover:text-[#2A1B24] transition-none cursor-pointer rounded-none text-xs font-mono font-bold"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? '[+]' : '[-]'}
        </button>
      </div>

      {/* Role Context Panel */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 my-4 p-4 rounded-2xl bg-[#EAEBEE]/5 border border-[#EAEBEE]/10 flex flex-col gap-1 shadow-app"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#EAEBEE]/50 font-medium">
            CURRENT ROLE
          </span>
          <span className="text-[13px] font-bold text-[#EAEBEE] uppercase tracking-wider">
            {roleConfig.name}
          </span>
          <span className="text-[11px] text-[#EAEBEE]/70 truncate font-mono">
            {roleConfig.organization}
          </span>
        </motion.div>
      )}

      {/* Navigation List - TEXT ONLY, NO ICONS */}
      <nav className="px-3 space-y-1.5 flex-1 mt-2">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#EAEBEE]/40 border-b border-[#EAEBEE]/10 mb-2">
            AUTHORIZED MODULES
          </div>
        )}

        {visibleNavItems.map((item) => {
          const isActive = activeNavItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveNavItem(item.id)}
              className={`w-full text-left relative px-4 py-3 rounded-xl text-[11px] uppercase tracking-[0.15em] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#EAEBEE]/15 text-[#EAEBEE] font-black shadow-app'
                  : 'text-[#EAEBEE]/65 hover:text-[#EAEBEE] hover:bg-[#EAEBEE]/5'
              }`}
            >
              {/* Animated Marigold Left Pill Indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-1 top-2 bottom-2 w-1.5 rounded-full bg-[#F59E0B]"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              <span className={isActive ? 'pl-1' : ''}>
                {!isCollapsed ? item.label : item.label.slice(0, 3)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-6 border-t border-[#EAEBEE]/15 text-[10px] uppercase tracking-[0.2em] text-[#EAEBEE]/60 space-y-1 bg-[#2A1B24]">
          <div className="flex justify-between font-mono">
            <span>PROOF ENGINE:</span>
            <span className="text-[#F59E0B] font-bold">SHA-256</span>
          </div>
          <div className="flex justify-between font-mono">
            <span>QPIAI SDK:</span>
            <span className="text-[#EAEBEE] font-bold">128-BIT QRNG</span>
          </div>
        </div>
      )}
    </motion.aside>
  );
};

