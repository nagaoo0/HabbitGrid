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