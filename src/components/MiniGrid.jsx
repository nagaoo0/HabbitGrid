import React from 'react';
// Utility to lighten a hex color
function lightenColor(hex, percent) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const num = parseInt(hex, 16);
  let r = (num >> 16) + Math.round(255 * percent);
  let g = ((num >> 8) & 0x00FF) + Math.round(255 * percent);
  let b = (num & 0x0000FF) + Math.round(255 * percent);
  r = Math.min(255, r);
  g = Math.min(255, g);
  b = Math.min(255, b);
  return `rgb(${r},${g},${b})`;
}
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { getColorIntensity, isToday, formatDate } from '../lib/utils-habit';
import { getFrozenDays } from '../lib/utils-habit';
import { toggleCompletion } from '../lib/storage';

const MiniGrid = ({ habit, onUpdate }) => {
  const today = new Date();
  // Show fewer days on mobile for better aspect ratio
  const isMobile = window.innerWidth < 640; // Tailwind 'sm' breakpoint
  const numDays = isMobile ? 11 : 28;
  const days = [];
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [numDays, habit.completions]);
  
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    days.push(date);
  }

  const handleCellClick = (e, date) => {
    e.stopPropagation();
    toggleCompletion(habit.id, formatDate(date));
    onUpdate();
  };

  return (
    <div ref={scrollRef} className="flex gap-1 overflow-x-auto grid-scroll pb-2">
        {(() => {
          const frozenDays = getFrozenDays(habit.completions);
          return days.map((date, index) => {
            const dateStr = formatDate(date);
            const isCompleted = habit.completions.includes(dateStr);
            const intensity = isCompleted ? getColorIntensity(habit.completions, dateStr) : 0;
            const isTodayCell = isToday(date);
            const dayLetter = date.toLocaleDateString('en-US', { weekday: 'short' })[0];
            const isFrozen = frozenDays.includes(dateStr);
            return (
              <div key={index} className="flex flex-col items-center">
                <motion.button
                  whileHover={{ scale: 0.9 }}
                  whileTap={{ scale: 0.5 }}
                  onClick={(e) => handleCellClick(e, date)}
                  className={`habit-cell flex w-8 h-8 transition-all items-center justify-center ${isTodayCell ? 'rounded-md' : 'rounded-2xl'}`}
                  style={{
                    backgroundColor: isCompleted
                      ? habit.color
                      : 'transparent',
                    opacity: isCompleted ? 0.3 + (intensity * 0.7) : 1,
                    border: isTodayCell
                      ? `2px solid ${habit.color}`
                      : `1px solid ${habit.color}20`,
                  }}
                  title={dateStr}
                >
                  {isFrozen && (
                    <span role="img" aria-label="Frozen" style={{ fontSize: '1.2em' }}>❄️</span>
                  )}
                  {/* Flame icon for full streak days */}
                  {isCompleted && intensity >= 1 && (
                    <Flame className="w-5 h-5 absolute" style={{ color: lightenColor(habit.color, 0.4) }} />
                  )}
                </motion.button>
                <span className="text-[10px] text-muted-foreground mt-1">{dayLetter}</span>
              </div>
            );
          });
        })()}
    </div>
  );
};

export default MiniGrid;