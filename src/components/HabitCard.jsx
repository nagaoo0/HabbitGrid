import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Flame } from 'lucide-react';
import { Button } from './ui/button';
import MiniGrid from './MiniGrid';
import AnimatedCounter from './AnimatedCounter';


// Helper to get streak icon from localStorage or fallback
function getStreakIcon() {
  const icon = typeof window !== 'undefined' ? localStorage.getItem('streakIcon') : null;
  if (!icon || icon === 'flame') return <Flame className="w-4 h-4 text-orange-500" />;
  return <span className="w-4 h-4 text-lg align-text-bottom" role="img" aria-label="Streak Icon">{icon}</span>;
}

const HabitCard = ({ habit, onUpdate }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer transition-all hover:shadow-md"
      onClick={() => navigate(`/habit/${habit.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: habit.color }}
            />
            <h3 className="font-semibold text-lg">{habit.name}</h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              {getStreakIcon()}
              <span><AnimatedCounter value={habit.currentStreak || 0} duration={800} /> day streak</span>
            </div>
            <span>•</span>
            <span>Personal Record: <AnimatedCounter value={habit.longestStreak || 0} duration={800} /> days</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/habit/${habit.id}`);
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <MiniGrid habit={habit} onUpdate={onUpdate} />
    </motion.div>
  );
};

export default HabitCard;
