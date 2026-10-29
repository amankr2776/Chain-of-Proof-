/**
 * Chain of Proof - Brutalist Notification Banner
 */

import React from 'react';
import { X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const NotificationBanner: React.FC = () => {
  const notification = useAppStore((state) => state.notificationMessage);
  const clearNotification = useAppStore((state) => state.clearNotification);

  if (!notification) return null;

  const bgStyles = ({
    success: 'bg-[#F59E0B] text-[#2A1B24] border-2 border-[#2A1B24]',
    warning: 'bg-[#EAEBEE] text-[#2A1B24] border-2 border-[#2A1B24]',
    error: 'bg-[#2A1B24] text-[#F59E0B] border-2 border-[#F59E0B]',
  } as Record<string, string>)[notification.type];

  return (
    <div className="fixed top-20 right-8 z-50 max-w-md w-full animate-in slide-in-from-top-2 duration-150">
      <div className={`p-4 rounded-none shadow-none flex items-start justify-between gap-3 ${bgStyles}`}>
        <div className="flex-1 pr-2">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold block mb-0.5">
            {notification.type === 'error' ? 'ALERT CRITICAL' : 'SYSTEM NOTICE'}
          </span>
          <h4 className="text-[14px] font-bold">{notification.title}</h4>
          <p className="text-[13px] opacity-90 mt-1 leading-relaxed">{notification.text}</p>
        </div>
        <button
          onClick={clearNotification}
          className="text-current hover:opacity-70 p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
