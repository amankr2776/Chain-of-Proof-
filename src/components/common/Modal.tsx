/**
 * Chain of Proof - Brutalist Editorial Modal
 * 0px border radius, Ice Silver canvas, solid 2px Deep Aubergine border.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2A1B24]/80 transition-opacity animate-in fade-in duration-150">
      <div
        className={`w-full ${widthClass} bg-[#EAEBEE] rounded-none shadow-none border-2 border-[#2A1B24] overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between px-8 py-6 border-b border-[#2A1B24] bg-transparent">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-medium text-[#2A1B24]/60 block mb-1">
              SYSTEM MODAL
            </span>
            <h3 className="text-[24px] font-medium text-[#2A1B24] leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[14px] text-[#2A1B24]/70 mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#2A1B24] hover:text-[#F59E0B] p-2 rounded-none transition-colors cursor-pointer border border-[#2A1B24]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 text-[#2A1B24] text-[15px] leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};
