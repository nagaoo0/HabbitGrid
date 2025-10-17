import { supabase, isSupabaseConfigured } from './supabase';
import * as local from './storage';

const SYNC_FLAG = 'habitgrid_remote_synced_at';

export const getAuthUser = async () => {
  if (!isSupabaseConfigured()) return null;
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
};

export const isLoggedIn = async () => Boolean(await getAuthUser());

// Remote schema suggestion:
// table habits {
//   id uuid primary key default gen_random_uuid(),
//   user_id uuid not null,
//   name text not null,
//   color text,
//   category text,
//   completions jsonb default '[]'::jsonb,
//   current_streak int default 0,
//   longest_streak int default 0,
//   sort_order int default 0,
//   created_at timestamptz default now(),
//   updated_at timestamptz default now()
// };

export async function getHabits() {
  if (!(await isLoggedIn())) return local.getHabits();

  const { data: user } = await supabase.auth.getUser();
  const userId = user?.user?.id;
  if (!userId) return local.getHabits();

  const { data, error } = await supabase
    .from('habits')
    .select('id,user_id,name,color,category,completions,current_streak,longest_streak,sort_order,updated_at,created_at')
    .eq('user_id', userId)
    .order('sort_order');
  if (error) {
    console.warn('Supabase getHabits error, falling back to local:', error.message);
    return local.getHabits();
  }
  // Map to local shape
  return (data || []).map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    category: row.category || '',
    completions: row.completions || [],
    currentStreak: row.current_streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function saveHabit(habit) {
  if (!(await isLoggedIn())) return local.saveHabit(habit);
  const now = new Date().toISOString();
  const { data: auth } = await supabase.auth.getUser();
  const insert = {
    user_id: auth?.user?.id,
    name: habit.name,
    color: habit.color,
    category: habit.category || '',
    completions: habit.completions || [],
    current_streak: habit.currentStreak ?? 0,
    longest_streak: habit.longestStreak ?? 0,
    sort_order: habit.sortOrder ?? 0,
    created_at: now,
    updated_at: now,
  };
  const { data, error } = await supabase.from('habits').insert(insert).select('*').single();
  if (error) {
    console.warn('Supabase saveHabit error, writing local:', error.message);
    return local.saveHabit(habit);
  }
  return {
    id: data.id,
    sortOrder: data.sort_order ?? 0,
    ...habit,
  };
}

export async function updateHabit(id, updates) {
  if (!(await isLoggedIn())) return local.updateHabit(id, updates);
  const now = new Date().toISOString();
  const patch = {
    ...(updates.name !== undefined ? { name: updates.name } : {}),
    ...(updates.color !== undefined ? { color: updates.color } : {}),
    ...(updates.category !== undefined ? { category: updates.category } : {}),
    ...(updates.completions !== undefined ? { completions: updates.completions } : {}),
    ...(updates.currentStreak !== undefined ? { current_streak: updates.currentStreak } : {}),
    ...(updates.longestStreak !== undefined ? { longest_streak: updates.longestStreak } : {}),
    ...(updates.sortOrder !== undefined ? { sort_order: updates.sortOrder } : {}),
    updated_at: now,
  };
  const { error } = await supabase.from('habits').update(patch).eq('id', id);
  if (error) {
    console.warn('Supabase updateHabit error, writing local:', error.message);
    return local.updateHabit(id, updates);
  }
}

export async function deleteHabit(id) {
  if (!(await isLoggedIn())) return local.deleteHabit(id);
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) {
    console.warn('Supabase deleteHabit error, writing local:', error.message);
    return local.deleteHabit(id);
  }
}

export async function toggleCompletion(habitId, dateStr) {
  if (!(await isLoggedIn())) return local.toggleCompletion(habitId, dateStr);
  // Fetch current then delegate to local logic for streak calc
  const habits = await getHabits();
  const target = habits.find(h => h.id === habitId);
  if (!target) return;
  const completions = Array.isArray(target.completions) ? [...target.completions] : [];
  const idx = completions.indexOf(dateStr);
  if (idx > -1) completions.splice(idx, 1); else completions.push(dateStr);
  return updateHabit(habitId, { completions });
}

export async function exportData() {
  // Always export from local snapshot for portability
  const habits = await getHabits();
  return JSON.stringify(habits, null, 2);
}

export async function importData(jsonString) {
  // Always import to local; remote sync will push on login
  return local.importData(jsonString);
}

export async function clearAllData() {
  // Clear local only; remote data persists per account
  return local.clearAllData();
}

// Sync: push local data to remote when user first logs in or when no remote data exists
export async function syncLocalToRemoteIfNeeded() {
  if (!isSupabaseConfigured()) return;
  const user = await getAuthUser();
  if (!user) return;

  const already = localStorage.getItem(SYNC_FLAG);
  const { data: remote, error } = await supabase.from('habits').select('id').limit(1);
  if (error) return;

  if (!already || (remote || []).length === 0) {
    const habits = local.getHabits();
    if (habits.length === 0) return localStorage.setItem(SYNC_FLAG, new Date().toISOString());
    const rows = habits.map(h => ({
      id: h.id && h.id.length > 0 ? h.id : undefined,
      user_id: user.id,
      name: h.name,
      color: h.color,
      category: h.category || '',
      completions: h.completions || [],
      current_streak: h.currentStreak ?? 0,
      longest_streak: h.longestStreak ?? 0,
      sort_order: h.sortOrder ?? 0,
      created_at: h.createdAt || new Date().toISOString(),
      updated_at: h.updatedAt || new Date().toISOString(),
    }));
    await supabase.from('habits').upsert(rows, { onConflict: 'id' });
    localStorage.setItem(SYNC_FLAG, new Date().toISOString());
  }
}

export async function syncRemoteToLocal() {
  const user = await getAuthUser();
  if (!user) return;
  const remote = await getHabits();
  // write to local in the app's expected format
  localStorage.setItem('habitgrid_data', JSON.stringify(remote));
  // Notify UI to reload if listening
  window.dispatchEvent(new CustomEvent('habitgrid-sync-updated'));
}
