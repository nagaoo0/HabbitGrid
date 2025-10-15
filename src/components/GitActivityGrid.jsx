import React, { useEffect, useMemo, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { getCachedGitActivity } from '../lib/git';
import { formatDate, isToday, getWeekdayLabel } from '../lib/utils-habit';

const GitActivityGrid = () => {
  const [{ dailyCounts }, setData] = useState(() => getCachedGitActivity());

  const weeks = useMemo(() => {
    const today = new Date();
    const todayDay = today.getDay();
    const daysSinceMonday = (todayDay + 6) % 7;
    const mondayThisWeek = new Date(today);
    mondayThisWeek.setDate(today.getDate() - daysSinceMonday);
    const weeksArray = [];
    const totalWeeks = 52;
    for (let week = totalWeeks - 1; week >= 0; week--) {
      const weekDays = [];
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
  }, []);

  const getOpacity = (count) => {
    if (!count) return 0.15;
    if (count < 2) return 0.35;
    if (count < 5) return 0.6;
    if (count < 10) return 0.8;
    return 1;
  };

  useEffect(() => {
    // Display current cache only; syncing is done from Settings
    setData(getCachedGitActivity());
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 pt-0 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
      <div className="mb-2 text-center w-full flex items-center justify-between">
        <div className="flex items-center gap-2 mt-4">
          <GitBranch className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Git Activity</h2>
        </div>
        <div />
      </div>
      <div className="overflow-x-auto grid-scroll mt-2 w-full flex justify-center">
        <div className="inline-flex gap-1 mb-4">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              <div className="h-3 text-xs text-muted-foreground text-center">
                {weekIndex % 4 === 0 && week[0].toLocaleDateString('en-US', { month: 'short' })}
              </div>
              {week.map((date, dayIndex) => {
                const dateStr = formatDate(date);
                const count = dailyCounts?.[dateStr] || 0;
                const isTodayCell = isToday(date);
                const isFuture = date > new Date();
                return (
                  <div
                    key={dayIndex}
                    className="habit-cell w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: '#3fb950',
                      opacity: isFuture ? 0 : getOpacity(count),
                      border: isTodayCell ? `2px solid #3fb950` : `1px solid #3fb95020`,
                      pointerEvents: 'none',
                      visibility: isFuture ? 'hidden' : 'visible',
                    }}
                    title={`${dateStr} • ${count} commits`}
                  />
                );
              })}
            </div>
          ))}
          <div className="flex flex-col gap-1 ml-2">
            <div className="h-3" />
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <div key={day} className="h-3 flex items-center justify-end text-xs text-muted-foreground pr-0">
                {getWeekdayLabel(day)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitActivityGrid;
