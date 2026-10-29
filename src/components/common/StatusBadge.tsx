/**
 * Chain of Proof - Brutalist Square Status Pill
 * 0px border radius, 1px solid Deep Aubergine border, uppercase 10px text with heavy tracking.
 */

import React from 'react';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant,
  className = '',
}) => {
  let computedVariant = variant;

  if (!computedVariant) {
    const lower = label.toLowerCase();
    if (
      lower.includes('verified') ||
      lower.includes('passed') ||
      lower.includes('reconciled') ||
      lower.includes('active') ||
      lower.includes('second-life') ||
      lower.includes('optimal') ||
      lower.includes('validated')
    ) {
      computedVariant = 'success';
    } else if (
      lower.includes('pending') ||
      lower.includes('assessment') ||
      lower.includes('queue') ||
      lower.includes('dispatched')
    ) {
      computedVariant = 'warning';
    } else if (
      lower.includes('flagged') ||
      lower.includes('rejected') ||
      lower.includes('failed') ||
      lower.includes('discrepancy') ||
      lower.includes('infeasible') ||
      lower.includes('duplicate')
    ) {
      computedVariant = 'danger';
    } else {
      computedVariant = 'neutral';
    }
  }

  const styles = {
    success: 'bg-[#F59E0B] text-[#2A1B24] border-[#2A1B24] font-bold',
    warning: 'bg-transparent text-[#2A1B24] border-[#2A1B24]',
    danger: 'bg-[#2A1B24] text-[#F59E0B] border-[#2A1B24] font-bold',
    info: 'bg-[#EAEBEE] text-[#2A1B24] border-[#2A1B24]',
    neutral: 'bg-transparent text-[#2A1B24] border-[#2A1B24]',
  }[computedVariant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-none border text-[10px] tracking-[0.2em] font-medium uppercase ${styles} ${className}`}
    >
      {label}
    </span>
  );
};
