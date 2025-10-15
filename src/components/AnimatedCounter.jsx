import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedCounter
 * Animates a number from 0 (or start) to the target value progressively.
 * Usage: <AnimatedCounter value={targetNumber} duration={1000} />
 */
function AnimatedCounter({ value, duration = 1000, start = 0, format = v => v }) {
  const [displayValue, setDisplayValue] = useState(start);
  const rafRef = useRef();
  const startRef = useRef(start);
  const valueRef = useRef(value);

  useEffect(() => {
    startRef.current = displayValue;
    valueRef.current = value;
    let startTime;
    function animate(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const current = Math.round(startRef.current + (valueRef.current - startRef.current) * progress);
      setDisplayValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span>{format(displayValue)}</span>;
}

export default AnimatedCounter;
