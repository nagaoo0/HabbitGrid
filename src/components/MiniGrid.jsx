import React from 'react';
import { motion } from 'framer-motion';
import { getColorIntensity, isToday, formatDate } from '../lib/utils-habit';
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
      {days.map((date, index) => {
        const dateStr = formatDate(date);
        const isCompleted = habit.completions.includes(dateStr);
        const intensity = isCompleted ? getColorIntensity(habit.completions, dateStr) : 0;
        const isTodayCell = isToday(date);
        const dayLetter = date.toLocaleDateString('en-US', { weekday: 'short' })[0];

        return (
          <div key={index} className="flex flex-col items-center">
            <motion.button
              whileHover={{ scale: 0.9 }}
              whileTap={{ scale: 0.5 }}
              onClick={(e) => handleCellClick(e, date)}
              className={`habit-cell flex w-8 h-8 transition-all ${isTodayCell ? 'rounded-md' : 'rounded-2xl'}`}
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
            />
            <span className="text-[10px] text-muted-foreground mt-1">{dayLetter}</span>
          </div>
        );
      })}
    </div>
  );
};

export default MiniGrid;