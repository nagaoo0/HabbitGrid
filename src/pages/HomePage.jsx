import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, TrendingUp, Flame, Calendar, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import HabitCard from '../components/HabitCard';
import { getHabits } from '../lib/storage';

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [habits, setHabits] = useState([]);
  const [isPremium] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const loadHabits = () => {
    const loadedHabits = getHabits();
    setHabits(loadedHabits);
  };

  const handleAddHabit = () => {
    if (!isPremium && habits.length >= 1000) {
      toast({
        title: "🔒 Premium Feature",
        description: "Free tier limited to 1000 habits. Upgrade to unlock unlimited habits!",
        duration: 4000,
      });
      return;
    }
    navigate('/add');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <img src="/assets/logo.png" alt="HabitGrid Logo" className="w-12 h-12 rounded-xl shadow-lg object-cover" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                HabitGrid
              </h1>
              <p className="text-sm text-muted-foreground">Commit to yourself, one square at a time</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode((prev) => !prev)}
              className="rounded-full"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-full"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-muted-foreground">Active Habits</span>
              </div>
              <p className="text-2xl font-bold">{habits.length}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-muted-foreground">Total Streaks</span>
              </div>
              <p className="text-2xl font-bold">
                {habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0)}
              </p>
            </div>
          </motion.div>
        )}

        {/* Habits List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <HabitCard habit={habit} onUpdate={loadHabits} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {habits.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Flame className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Create your grid!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your first habit and watch your progress every day as you fill in the squares. Small steps lead to big changes!
            </p>
            <Button
              onClick={handleAddHabit}
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create First Habit
            </Button>
          </motion.div>
        )}

        {/* Add Button */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="fixed bottom-6 right-6"
          >
            <Button
              onClick={handleAddHabit}
              size="lg"
              className="rounded-full w-14 h-14 shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomePage;