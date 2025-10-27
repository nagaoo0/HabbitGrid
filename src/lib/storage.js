// Local storage remains the primary source. If Supabase auth is active, we mirror writes to the remote DB.
import { supabase } from './supabase';
const STORAGE_KEY = 'habitgrid_data';

// UUID v4 generator for local/offline usage
function generateUUID() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
  // Respect provided id (e.g., UUID from AddEdit or datastore). Generate only if missing.
  const id = habit.id || generateUUID();
  const existingIndex = habits.findIndex(h => h.id === id);
  const newHabit = {
    ...habit,
    id,
    sortOrder: habit.sortOrder ?? habits.length,
    createdAt: habit.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
  if (existingIndex >= 0) {
    habits[existingIndex] = newHabit;
  } else {
    habits.push(newHabit);
  }
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

import { calculateStreaks } from './utils-habit.js';

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