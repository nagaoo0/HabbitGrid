import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Trash2, TrendingUp, Target, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import HabitGrid from '../components/HabitGrid';
import DeleteHabitDialog from '../components/DeleteHabitDialog';
import { getHabit, deleteHabit } from '../lib/storage';

const HabitDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [habit, setHabit] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadHabit();
  }, [id]);

  const loadHabit = () => {
    const loadedHabit = getHabit(id);
    if (!loadedHabit) {
      toast({
        title: "Habit not found",
        description: "This habit doesn't exist or was deleted.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    setHabit(loadedHabit);
  };

  const handleDelete = () => {
    deleteHabit(id);
    toast({
      title: "✅ Habit deleted",
      description: "Your habit has been removed successfully.",
    });
    navigate('/');
  };

  if (!habit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Find the oldest completion date
  let oldestDate = new Date();
  if (habit.completions.length > 0) {
    oldestDate = new Date(habit.completions.reduce((min, d) => d < min ? d : min, habit.completions[0]));
  }

  const completionRate = habit.completions.length > 0
    ? Math.round((habit.completions.length / Math.max(1, Math.ceil((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)))) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{habit.name}</h1>
              <p className="text-sm text-muted-foreground">Track your daily progress</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/edit/${id}`)}
              className="rounded-full"
            >
              <Edit2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="rounded-full text-destructive hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Current Streak</span>
            </div>
            <p className="text-3xl font-bold">{habit.currentStreak || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">days in a row</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Longest Streak</span>
            </div>
            <p className="text-3xl font-bold">{habit.longestStreak || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">personal best</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Consistency Score!</span>
            </div>
            <p className="text-3xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">overall progress</p>
          </div>
        </motion.div>

        {/* Habit Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <HabitGrid habit={habit} onUpdate={loadHabit} fullView />
        </motion.div>
      </div>

      <DeleteHabitDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        habitName={habit.name}
      />
    </div>
  );
};

export default HabitDetailPage;