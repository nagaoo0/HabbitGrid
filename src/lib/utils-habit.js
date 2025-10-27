export const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const getColorIntensity = (completions, dateStr) => {
  const index = completions.indexOf(dateStr);
  if (index === -1) return 0;

  let streak = 1;
  const date = new Date(dateStr);

  for (let i = 1; i <= 10; i++) {
    const prevDate = new Date(date);
    prevDate.setDate(prevDate.getDate() - i);
    const prevDateStr = formatDate(prevDate);

    if (completions.includes(prevDateStr)) {
      streak++;
    } else {
      break;
    }
  }

  return Math.min(streak / 10, 1);
};

export const getWeekdayLabel = (dayIndex) => {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return labels[dayIndex];
};
  
  // Calculate current and longest streaks from a list of completion date strings (YYYY-MM-DD)
  // Rules:
  // - Streaks count consecutive days
  // - Today or yesterday must be present to have a non-zero current streak
  // - We also include "frozen" days (one missed day per month sandwiched by completions)
  // - Longest streak is at least 1 if there is at least one completion
  export function calculateStreaks(completions) {
    if (!Array.isArray(completions) || completions.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }
    // Only use frozen days for streak calculation
    const frozenDays = getFrozenDays(completions);
    const allValid = Array.from(new Set([...(completions || []), ...frozenDays]));
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
  // Returns array of frozen days (date strings) for a given completions array
  export function getFrozenDays(completions) {
    // Map: month string -> frozen day string
    const frozenDays = [];
    const completedSet = new Set(completions);
    // Sort completions for easier lookup
    const sorted = [...completions].sort();
    // Track frozen per month
    const frozenPerMonth = {};
    // To find missed days, scan a range of dates
    if (completions.length === 0) return [];
    const minDate = new Date(sorted[0]);
    const maxDate = new Date(sorted[sorted.length - 1]);
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d);
      if (completedSet.has(dateStr)) continue; // skip completed days
      // Check neighbors
      const prevDate = new Date(d); prevDate.setDate(prevDate.getDate() - 1);
      const nextDate = new Date(d); nextDate.setDate(nextDate.getDate() + 1);
      const prevDateStr = formatDate(prevDate);
      const nextDateStr = formatDate(nextDate);
      // Only freeze if both neighbors are completed
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (
        completedSet.has(prevDateStr) &&
        completedSet.has(nextDateStr) &&
        !frozenPerMonth[monthKey]
      ) {
        frozenDays.push(dateStr);
        frozenPerMonth[monthKey] = true;
      }
    }
    return frozenDays;
  }