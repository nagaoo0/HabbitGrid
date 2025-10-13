import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getColorIntensity, isToday, formatDate, getWeekdayLabel } from '../lib/utils-habit';
import { toggleCompletion } from '../lib/storage';

const HabitGrid = ({ habit, onUpdate, fullView = false }) => {
  const weeks = useMemo(() => {
    const today = new Date();
    // Find the Monday of the current week
    const todayDay = today.getDay(); // 0=Sun, 1=Mon, ...
    const daysSinceMonday = (todayDay + 6) % 7; // 0=Mon, 1=Tue, ..., 6=Sun
    const mondayThisWeek = new Date(today);
    mondayThisWeek.setDate(today.getDate() - daysSinceMonday);

    const weeksArray = [];
    const totalWeeks = fullView ? 52 : 12;
    for (let week = totalWeeks - 1; week >= 0; week--) {
      const weekDays = [];
      // For each week, calculate Monday, then add 0..6 days for each row
      const monday = new Date(mondayThisWeek);
      monday.setDate(mondayThisWeek.getDate() - week * 7);
      for (let day = 0; day < 7; day++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + day);
        weekDays.push(date);
      }
      weeksArray.push(weekDays);
    }
    return weeksArray;
  }, [fullView]);

  const handleCellClick = (date) => {
    toggleCompletion(habit.id, formatDate(date));
    onUpdate();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-1">Activity Calendar</h2>
        <p className="text-sm text-muted-foreground">
          Tap any day to mark it as complete
        </p>
      </div>

      <div className="overflow-x-auto grid-scroll">
        <div className="inline-flex gap-1">
          {/* Weekday labels: Monday (top) to Sunday (bottom) */}
          <div className="flex flex-col gap-1 mr-2">
            <div className="h-3" />
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <div
                key={day}
                className="h-3 flex items-center justify-end text-xs text-muted-foreground pr-1"
              >
                {getWeekdayLabel(day)}
              </div>
            ))}
          </div>

          {/* Grid: Monday (top) to Sunday (bottom) */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {/* Month label */}
              <div className="h-3 text-xs text-muted-foreground text-center">
                {weekIndex % 4 === 0 && week[0].toLocaleDateString('en-US', { month: 'short' })}
              </div>
              {/* Days: Monday (top) to Sunday (bottom) */}
              {week.map((date, dayIndex) => {
                const dateStr = formatDate(date);
                const isCompleted = habit.completions.includes(dateStr);
                const intensity = isCompleted ? getColorIntensity(habit.completions, dateStr) : 0;
                const isTodayCell = isToday(date);
                const isFuture = date > new Date();
                return (
                  <motion.button
                    key={dayIndex}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCellClick(date)}
                    className="habit-cell w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: isCompleted ? habit.color : 'transparent',
                      opacity: isFuture ? 0 : (isCompleted ? 0.3 + (intensity * 0.7) : 1),
                      border: isTodayCell ? `2px solid ${habit.color}` : `1px solid ${habit.color}20`,
                      pointerEvents: isFuture ? 'none' : 'auto',
                      visibility: isFuture ? 'hidden' : 'visible',
                    }}
                    title={`${dateStr}${isCompleted ? ' ✓' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: habit.color,
                opacity: 0.3 + (intensity * 0.7),
                border: `1px solid ${habit.color}20`,
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default HabitGrid;