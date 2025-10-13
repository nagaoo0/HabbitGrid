import React from 'react';
import { motion } from 'framer-motion';
import { getColorIntensity, isToday, formatDate } from '../lib/utils-habit';
import { toggleCompletion } from '../lib/storage';

const MiniGrid = ({ habit, onUpdate }) => {
  const today = new Date();
  const days = [];
  
  for (let i = 27; i >= 0; i--) {
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
    <div className="flex gap-1 overflow-x-auto grid-scroll pb-2">
      {days.map((date, index) => {
        const dateStr = formatDate(date);
        const isCompleted = habit.completions.includes(dateStr);
        const intensity = isCompleted ? getColorIntensity(habit.completions, dateStr) : 0;
        const isTodayCell = isToday(date);
 
        return (
          <motion.button
            key={index}
            whileHover={{ scale: 0.9 }}
            whileTap={{ scale: 0.5 }}
            onClick={(e) => handleCellClick(e, date)}
            className="habit-cell flex w-8 h-8 rounded-2xl transition-all"
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
        );
      })}
    </div>
  );
};

export default MiniGrid;