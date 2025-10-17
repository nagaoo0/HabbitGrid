// Local storage remains the primary source. If Supabase auth is active, we mirror writes to the remote DB.
import { supabase } from './supabase';
const STORAGE_KEY = 'habitgrid_data';

export const getHabits = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading habits:', error);
    return [];
  }
};

export const getHabit = (id) => {
  const habits = getHabits();
  return habits.find(h => h.id === id);
};

const nowIso = () => new Date().toISOString();

const remoteMirrorUpsert = async (habit) => {
  try {
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;
    const row = {
      id: habit.id,
      name: habit.name ?? habit.title ?? habit?.name,
      color: habit.color,
      category: habit.category || '',
      completions: habit.completions || [],
      current_streak: habit.currentStreak ?? 0,
      longest_streak: habit.longestStreak ?? 0,
      sort_order: habit.sortOrder ?? 0,
      created_at: habit.createdAt || nowIso(),
      updated_at: habit.updatedAt || nowIso(),
      user_id: auth.user.id,
    };
    await supabase.from('habits').upsert(row, { onConflict: 'id' });
  } catch (e) {
    console.warn('Remote mirror upsert failed:', e?.message || e);
  }
};

const remoteMirrorDelete = async (id) => {
  try {
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;
  await supabase.from('habits').delete().eq('id', id).eq('user_id', auth.user.id);
  } catch (e) {
    console.warn('Remote mirror delete failed:', e?.message || e);
  }
};

export const saveHabit = (habit) => {
  const habits = getHabits();
  const newHabit = {
    ...habit,
    id: Date.now().toString(),
    sortOrder: habits.length,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  habits.push(newHabit);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  remoteMirrorUpsert(newHabit);
  return newHabit;
};

export const updateHabit = (id, updates) => {
  const habits = getHabits();
  const index = habits.findIndex(h => h.id === id);
  if (index !== -1) {
    habits[index] = { ...habits[index], ...updates, updatedAt: nowIso() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    remoteMirrorUpsert(habits[index]);
  }
};

export const deleteHabit = (id) => {
  const habits = getHabits();
  const filtered = habits.filter(h => h.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  remoteMirrorDelete(id);
};

export const toggleCompletion = (habitId, dateStr) => {
  const habits = getHabits();
  const habit = habits.find(h => h.id === habitId);
  
  if (!habit) return;

  const completions = habit.completions || [];
  const index = completions.indexOf(dateStr);

  if (index > -1) {
    completions.splice(index, 1);
  } else {
    completions.push(dateStr);
  }

  const { currentStreak, longestStreak } = calculateStreaks(completions);

  updateHabit(habitId, {
    completions,
    currentStreak,
    longestStreak: Math.max(longestStreak, habit.longestStreak || 0),
  });
};

import { getFrozenDays } from './utils-habit.js';
const calculateStreaks = (completions) => {
  if (completions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }
  // Only use frozen days for streak calculation
  const frozenDays = getFrozenDays(completions);
  const allValid = Array.from(new Set([...completions, ...frozenDays]));
  const sortedDates = allValid
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const mostRecent = sortedDates[0];
  mostRecent.setHours(0, 0, 0, 0);

  if (mostRecent.getTime() === today.getTime() || mostRecent.getTime() === yesterday.getTime()) {
    currentStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const current = new Date(sortedDates[i]);
      current.setHours(0, 0, 0, 0);
      const previous = new Date(sortedDates[i - 1]);
      previous.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((previous - current) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        currentStreak++;
        tempStreak++;
      } else {
        break;
      }
    }
  }

  tempStreak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i]);
    current.setHours(0, 0, 0, 0);
    const previous = new Date(sortedDates[i - 1]);
    previous.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((previous - current) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, 1);
  return { currentStreak, longestStreak };
}

export const exportData = () => {
  const habits = getHabits();
  return JSON.stringify(habits, null, 2);
};

export const importData = (jsonString) => {
  const habits = JSON.parse(jsonString);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Re-export a thin Supabase-aware facade so the rest of the app can import from 'lib/storage'
// without refactors. We keep original names but allow higher-level modules to import the remote-aware versions.
export * as remote from './datastore';