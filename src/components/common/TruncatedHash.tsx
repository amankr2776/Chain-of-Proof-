/**
 * Chain of Proof - Editorial Monospace Truncated Hash
 * Sharp rectangular border, JetBrains Mono font, copy button.
 */

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { truncateHash } from '../../services/cryptoEngine';

interface TruncatedHashProps {
  hash: string;
  prefixLen?: number;
  suffixLen?: number;
  className?: string;
  showCopy?: boolean;
}

export const TruncatedHash: React.FC<TruncatedHashProps> = ({
  hash,
  prefixLen = 6,
  suffixLen = 4,
  className = '',
  showCopy = true,
}) => {
  const [copied, setCopied] = useState(false);

  if (!hash) return <span className="text-[#2A1B24]/40 font-mono text-xs">—</span>;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedHash = truncateHash(hash, prefixLen, suffixLen);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[12px] text-[#2A1B24] bg-transparent px-2 py-0.5 border border-[#2A1B24]/30 rounded-none select-all ${className}`}
      title={hash}
    >
      <span>{formattedHash}</span>
      {showCopy && (
        <button
          onClick={handleCopy}
          type="button"
          className="text-[#2A1B24]/60 hover:text-[#F59E0B] focus:outline-hidden transition-colors cursor-pointer p-0.5"
          title="Copy full hash"
          aria-label="Copy hash"
        >
          {copied ? (
            <Check className="w-3 h-3 text-[#F59E0B]" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}
    </span>
  );
};
