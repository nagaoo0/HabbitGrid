import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, TrendingUp, Flame, Calendar, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/use-toast';
import HabitCard from '../components/HabitCard';
import AnimatedCounter from '../components/AnimatedCounter';
import GitActivityGrid from '../components/GitActivityGrid';
import { getGitEnabled } from '../lib/git';
import { getHabits, updateHabit, syncLocalToRemoteIfNeeded, syncRemoteToLocal, getAuthUser } from '../lib/datastore';

const HomePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [gitEnabled, setGitEnabled] = useState(getGitEnabled());
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      // On login, pull remote habits into localStorage
      const user = await getAuthUser();
      setLoggedIn(!!user);
      if (user) {
        await syncRemoteToLocal();
      }
      await loadHabits();
      setGitEnabled(getGitEnabled());
      setLoading(false);
    })();
    // Background sync every 10s if logged in
    const interval = setInterval(() => {
      syncLocalToRemoteIfNeeded();
    }, 10000);
    // Listen for remote sync event to reload habits
    const syncListener = () => loadHabits();
    window.addEventListener('habitgrid-sync-updated', syncListener);
    return () => {
      clearInterval(interval);
      window.removeEventListener('habitgrid-sync-updated', syncListener);
    };
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

  const loadHabits = async () => {
    // Always read from local for instant UI
    const loadedHabits = JSON.parse(localStorage.getItem('habitgrid_data') || '[]');
    loadedHabits.sort((a, b) => {
      if (a.sortOrder !== undefined && b.sortOrder !== undefined) return a.sortOrder - b.sortOrder;
      if (a.sortOrder !== undefined) return -1;
      if (b.sortOrder !== undefined) return 1;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });
    setHabits(loadedHabits);
    // Initialize collapsed state for new categories
    const categories = Array.from(new Set(loadedHabits.map(h => h.category || 'Uncategorized')));
    setCollapsedGroups(prev => {
      const next = { ...prev };
      categories.forEach(cat => {
        if (!(cat in next)) next[cat] = false;
      });
      return next;
    });
  };

  const handleAddHabit = () => {
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
                <AnimatedCounter value={habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0)} duration={900} />
              </p>
            </div>
          </motion.div>
        )}

        {/* Git Activity */}
        {gitEnabled && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-8">
            <GitActivityGrid />
          </motion.div>
        )}

        {/* Habits List */}
        {/* Grouped Habits by Category, collapsible, and uncategorized habits outside */}
        <DragDropContext
          onDragEnd={result => {
            if (!result.destination) return;
            const { source, destination } = result;
            // Get all habits grouped by category
            const uncategorized = habits.filter(h => !h.category);
            const categorized = habits.filter(h => h.category);
            const grouped = categorized.reduce((acc, habit) => {
              const cat = habit.category;
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(habit);
              return acc;
            }, {});

            let newHabits = [...habits];

            // If dropping into uncategorized, always unset category
            if (destination.droppableId === 'uncategorized') {
              let items, removed;
              if (source.droppableId === 'uncategorized') {
                // Reorder within uncategorized
                items = Array.from(uncategorized);
                [removed] = items.splice(source.index, 1);
              } else {
                // Move from category to uncategorized
                items = Array.from(uncategorized);
                const sourceItems = Array.from(grouped[source.droppableId]);
                [removed] = sourceItems.splice(source.index, 1);
                removed.category = '';
                grouped[source.droppableId] = sourceItems;
              }
              // Always set category to ''
              removed.category = '';
              items.splice(destination.index, 0, removed);
              items.forEach((h, i) => updateHabit(h.id, { sortOrder: i, category: '' }));
              newHabits = [
                ...items,
                ...Object.values(grouped).flat()
              ];
            } else if (source.droppableId === 'uncategorized' && grouped[destination.droppableId]) {
              // Move from uncategorized to category
              const items = Array.from(uncategorized);
              const [removed] = items.splice(source.index, 1);
              removed.category = destination.droppableId;
              const destItems = Array.from(grouped[destination.droppableId] || []);
              destItems.splice(destination.index, 0, removed);
              destItems.forEach((h, i) => updateHabit(h.id, { sortOrder: i, category: h.category }));
              newHabits = [
                ...items,
                ...Object.values({ ...grouped, [destination.droppableId]: destItems }).flat()
              ];
            } else if (grouped[source.droppableId] && grouped[destination.droppableId]) {
              // Move within or between categories
              const sourceItems = Array.from(grouped[source.droppableId]);
              const [removed] = sourceItems.splice(source.index, 1);
              if (source.droppableId === destination.droppableId) {
                // Reorder within same category
                sourceItems.splice(destination.index, 0, removed);
                sourceItems.forEach((h, i) => updateHabit(h.id, { sortOrder: i, category: h.category }));
                grouped[source.droppableId] = sourceItems;
              } else {
                // Move to another category
                const destItems = Array.from(grouped[destination.droppableId] || []);
                removed.category = destination.droppableId;
                destItems.splice(destination.index, 0, removed);
                destItems.forEach((h, i) => updateHabit(h.id, { sortOrder: i, category: h.category }));
                grouped[source.droppableId] = sourceItems;
                grouped[destination.droppableId] = destItems;
              }
              // Flatten
              newHabits = [
                ...uncategorized,
                ...Object.values(grouped).flat()
              ];
            }
            // Force immediate UI update after all updates
            loadHabits();
          }}
        >
          <div className="space-y-6">
            {/* Uncategorized habits (no group panel) */}
            <Droppable droppableId="uncategorized" type="HABIT">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                  {habits.filter(h => !h.category).map((habit, index) => (
                    <Draggable key={habit.id} draggableId={habit.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{ ...provided.draggableProps.style, zIndex: snapshot.isDragging ? 10 : undefined }}
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <HabitCard habit={habit} onUpdate={loadHabits} />
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
            {/* Group panels for named categories */}
            {Object.entries(
              habits.filter(h => h.category).reduce((acc, habit) => {
                const cat = habit.category;
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(habit);
                return acc;
              }, {})
            ).map(([category, groupHabits], groupIdx) => (
              <div key={category} className="bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <button
                  className="w-full flex items-center justify-between px-6 py-3 text-lg font-semibold focus:outline-none select-none hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl transition"
                  onClick={() => setCollapsedGroups(prev => ({ ...prev, [category]: !prev[category] }))}
                  aria-expanded={!collapsedGroups[category]}
                >
                  <span>{category}</span>
                  <span className={`transition-transform ${collapsedGroups[category] ? 'rotate-90' : ''}`}>▶</span>
                </button>
                <AnimatePresence initial={false}>
                  {!collapsedGroups[category] && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <Droppable droppableId={category} type="HABIT">
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4 px-4 pb-4">
                            {groupHabits.map((habit, index) => (
                              <Draggable key={habit.id} draggableId={habit.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{ ...provided.draggableProps.style, zIndex: snapshot.isDragging ? 10 : undefined }}
                                  >
                                    <motion.div
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.95 }}
                                      transition={{ delay: index * 0.05 }}
                                    >
                                      <HabitCard habit={habit} onUpdate={loadHabits} />
                                    </motion.div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Empty State or Loading Buffer */}
        {habits.length === 0 && (
          loading && loggedIn ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-16 h-16 mb-6 flex items-center justify-center">
                <span className="inline-block w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
              </div>
              <h2 className="text-xl font-semibold text-muted-foreground">Loading your habits...</h2>
            </motion.div>
          ) : (
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
          )
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
              className="rounded-full shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomePage;