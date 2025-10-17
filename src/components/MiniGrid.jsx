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
// Helpers to get custom icons from localStorage or fallback
function getStreakIcon() {
  if (typeof window === 'undefined') return (
    <span className="flex items-center justify-center w-full h-full">
      <Flame className="w-4 h-4 drop-shadow-lg" />
    </span>
  );
  const icon = localStorage.getItem('streakIcon');
  if (!icon || icon === 'flame') return (
    <span className="flex items-center justify-center w-full h-full">
      <Flame className="w-4 h-4 drop-shadow-lg" />
    </span>
  );
  return (
    <span className="flex items-center justify-center w-full h-full">
      <span className="text-lg" role="img" aria-label="Streak Icon">{icon}</span>
    </span>
  );
}
function getFreezeIcon() {
  if (typeof window === 'undefined') return '❄️';
  const icon = localStorage.getItem('freezeIcon');
  return icon || '❄️';
}
import { motion } from 'framer-motion';
import { getColorIntensity, isToday, formatDate } from '../lib/utils-habit';
import { getFrozenDays } from '../lib/utils-habit';
import { toggleCompletion, getAuthUser } from '../lib/datastore';
import { toast } from './ui/use-toast';

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

  const handleCellClick = async (e, date) => {
    e.stopPropagation();
    const dateStr = formatDate(date);
    const isTodayCell = isToday(date);
    const wasCompleted = habit.completions.includes(dateStr);
    // Only optimistic write if logged in; in local-only mode, datastore handles it to avoid double-toggle
    const user = await getAuthUser();
    if (user) {
      const habits = JSON.parse(localStorage.getItem('habitgrid_data') || '[]');
      const idx = habits.findIndex(h => h.id === habit.id);
      if (idx !== -1) {
        const completions = Array.isArray(habits[idx].completions) ? [...habits[idx].completions] : [];
        const cidx = completions.indexOf(dateStr);
        if (cidx > -1) completions.splice(cidx, 1); else completions.push(dateStr);
        habits[idx].completions = completions;
        localStorage.setItem('habitgrid_data', JSON.stringify(habits));
      }
    }
    await toggleCompletion(habit.id, dateStr);
    onUpdate();
    // Only show encouragement toast if validating (adding) today's dot
    if (isTodayCell && !wasCompleted) {
      try {
        const res = await fetch('/encouragements.json');
        const messages = await res.json();
        const msg = messages[Math.floor(Math.random() * messages.length)];
        toast({
          title: '🎉 Keep Going!',
          description: msg,
          duration: 2500,
        });
      } catch (err) {
        // fallback message
        toast({
          title: '🎉 Keep Going!',
          description: 'Great job! Keep up the streak!',
          duration: 2500,
        });
      }
    }
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
                      {getFreezeIcon()}
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
                        className="flex items-center justify-center w-full h-full"
                        animate={{ rotate: [0, 12, -12, 0] }}
                        transition={{
                          repeat: Infinity,
                          repeatType: 'loop',
                          duration: 2,
                          ease: 'easeInOut',
                        }}
                      >
                        {getStreakIcon()}
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