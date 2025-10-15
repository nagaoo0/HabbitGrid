import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedCounter
 * Animates a number from 0 (or start) to the target value progressively.
 * Usage: <AnimatedCounter value={targetNumber} duration={1000} />
 */
function AnimatedCounter({ value, duration = 1000, start = 0, format = v => v }) {
  const [displayValue, setDisplayValue] = useState(start);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('up');
  const rafRef = useRef();
  const startRef = useRef(start);
  const valueRef = useRef(value);
  const prevValueRef = useRef(start);

  useEffect(() => {
    startRef.current = displayValue;
    valueRef.current = value;
    let startTime;
    setAnimating(true);
    setDirection(value > prevValueRef.current ? 'up' : value < prevValueRef.current ? 'down' : direction);
    function animate(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const current = Math.round(startRef.current + (valueRef.current - startRef.current) * progress);
      setDisplayValue(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setAnimating(false);
        prevValueRef.current = current;
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  // Animation styles
  const styles = {
    display: 'inline-block',
    transition: 'transform 0.4s cubic-bezier(.68,-0.55,.27,1.55), color 0.4s',
    transform: animating ? 'scale(1.25) rotate(-5deg)' : 'scale(1)',
    color: animating ? (direction === 'up' ? '#22c55e' : direction === 'down' ? '#ef4444' : undefined) : undefined,
    fontWeight: animating ? 700 : undefined,
    filter: animating ? (direction === 'up' ? 'drop-shadow(0 0 8px #22c55e88)' : direction === 'down' ? 'drop-shadow(0 0 8px #ef444488)' : undefined) : undefined,
  };

  return (
    <span style={styles}>{format(displayValue)}</span>
  );
}

export default AnimatedCounter;
