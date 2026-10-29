/**
 * Chain of Proof - Editorial Count-Up Animated Number Component
 * Smooth architectural cubic-bezier count up animation with 2-digit padding option.
 */

import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatTwoDigits?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1.2,
  formatTwoDigits = true,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // Architectural ease
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value, duration]);

  const formatted =
    formatTwoDigits && displayValue < 10 && displayValue >= 0
      ? `0${displayValue}`
      : `${displayValue}`;

  return <span>{formatted}</span>;
};
