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