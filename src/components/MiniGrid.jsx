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
  // Dynamically calculate number of days that fit based on window width and cell size, max 28
  const CELL_SIZE = 42; // px, matches w-8 h-8
  const PADDING = 16; // px, for grid padding/margin
  const numDays = Math.min(28, Math.max(5, Math.floor((window.innerWidth - PADDING) / CELL_SIZE)));
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
    <div ref={scrollRef} className="flex gap-1 overflow-x-auto grid-scroll pt-4 pb-2">
        {(() => {
          const frozenDays = getFrozenDays(habit.completions);
          return days.map((date, index) => {
            const dateStr = formatDate(date);
            const isCompleted = habit.completions.includes(dateStr);
            const intensity = isCompleted ? getColorIntensity(habit.completions, dateStr) : 0;
            const isTodayCell = isToday(date);
            const dayLetter = date.toLocaleDateString('en-US', { weekday: 'short' })[0];
            // Check if previous day was completed and next day is today
            let isFrozen = frozenDays.includes(dateStr);
            if (!isCompleted && !isTodayCell && index < days.length - 1 && index > 0) {
              const prevDateStr = formatDate(days[index - 1]);
              const nextDateStr = formatDate(days[index + 1]);
              const prevCompleted = habit.completions.includes(prevDateStr);
              const nextIsToday = isToday(days[index + 1]);
              if (prevCompleted && nextIsToday) {
                isFrozen = true;
              }
            }
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
                    <motion.span
                      role="img"
                      aria-label="Frozen"
                      style={{ fontSize: '1.2em', filter: 'drop-shadow(0 0 8px #3b82f6)' }}
                      initial={{ opacity: 0, y: -40, scale: 1.2 }}
                      animate={{
                        opacity: 1,
                        y: [ -40, 8, -4, 0 ],
                        scale: [ 1.2, 0.9, 1.05, 1 ],
                        rotate: [ 0, -10, 10, -5, 0 ]
                      }}
                      transition={{ duration: 0.7, ease: 'easeInOut' }}
                    >
                      ❄️
                    </motion.span>
                  )}
                  {/* Flame icon for full streak days */}
                  {isCompleted && intensity >= 1 && (
                    <motion.span
                      className="relative flex items-center justify-center w-full h-full"
                      initial={{ opacity: 0, scale: 0.2, rotate: -45 }}
                      animate={{
                        opacity: 1,
                        scale: 1.3,
                        rotate: [0, 10, -10, 0],
                        transition: {
                          duration: 0.7,
                          delay: (index / numDays) * 0.7,
                          type: 'spring',
                          bounce: 0.7,
                          stiffness: 180,
                          onComplete: () => {},
                        }
                      }}
                      whileHover={{ scale: 1.5, rotate: 10 }}
                      whileTap={{ scale: 1.2, rotate: 0 }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 12, -12, 0] }}
                        transition={{
                          repeat: Infinity,
                          repeatType: 'loop',
                          duration: 2,
                          ease: 'easeInOut',
                        }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}
                      >
                        <Flame
                          className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 drop-shadow-lg"
                          style={{ color: lightenColor(habit.color, 0.4), filter: 'brightness(1.3) drop-shadow(0 0 6px white)' }}
                        />
                      </motion.div>
                    </motion.span>
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