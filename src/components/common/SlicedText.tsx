/**
 * Chain of Proof - SlicedText Component
 * Horizontal band displacement / parallax glitch effect using Framer Motion and CSS clip-path.
 */

import React from 'react';
import { motion } from 'framer-motion';

interface SlicedTextProps {
  text: string;
  className?: string;
  numSlices?: number;
}

export const SlicedText: React.FC<SlicedTextProps> = ({
  text,
  className = '',
  numSlices = 6,
}) => {
  const slices = Array.from({ length: numSlices });

  // Custom offsets for subtle left-right continuous displacement parallax
  const shiftOffsets = [12, -18, 14, -10, 16, -12, 8];
  const shiftDurations = [4.2, 5.8, 4.6, 6.2, 5.0, 4.8, 5.5];

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Hidden baseline element for proper DOM dimensions */}
      <span className="opacity-0 aria-hidden">{text}</span>

      {/* Render horizontal band slices stacked over the baseline */}
      {slices.map((_, index) => {
        const sliceHeightPercent = 100 / numSlices;
        const topPercent = index * sliceHeightPercent;
        const bottomPercent = (index + 1) * sliceHeightPercent;

        // Clip-path rectangle for current band
        const clipPath = `polygon(0% ${topPercent}%, 100% ${topPercent}%, 100% ${bottomPercent}%, 0% ${bottomPercent}%)`;

        const offset = shiftOffsets[index % shiftOffsets.length];
        const duration = shiftDurations[index % shiftDurations.length];

        // Stagger snap index calculated from center outwards
        const centerIndex = (numSlices - 1) / 2;
        const distFromCenter = Math.abs(index - centerIndex);

        return (
          <motion.div
            key={index}
            className="absolute inset-0 pointer-events-none"
            style={{ clipPath }}
            initial={{
              x: index % 2 === 0 ? -120 * (distFromCenter + 1) : 120 * (distFromCenter + 1),
              opacity: 0,
            }}
            animate={{
              x: [0, offset, -offset * 0.7, offset * 0.4, 0],
              opacity: 1,
            }}
            transition={{
              duration: 0.8,
              delay: distFromCenter * 0.08,
              ease: [0.16, 1, 0.3, 1],
              x: {
                repeat: Infinity,
                repeatType: 'mirror',
                duration: duration,
                delay: distFromCenter * 0.08,
                ease: 'easeInOut',
              },
              opacity: { duration: 0.4 },
            }}
          >
            <span>{text}</span>
          </motion.div>
        );
      })}
    </div>
  );
};
