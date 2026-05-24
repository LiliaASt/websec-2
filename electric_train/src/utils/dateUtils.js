export const formatTime = (timeString) => {
  if (!timeString) return 'Время уточняется';

  try {
    if (typeof timeString === 'string' && /^\d{2}:\d{2}$/.test(timeString)) {
      return timeString; 
    }

    const dateObj = typeof timeString === 'string' ? new Date(timeString) : timeString;

    if (isNaN(dateObj.getTime())) return 'Время уточняется';

    return dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Время уточняется';
  }
};

export const formatFullDate = (date) => {
  if (!date) return null;
  try {
    if (typeof date === 'string' && /^\d{2}:\d{2}$/.test(date)) {
       return null;
    }

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return null;

    return dateObj.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return null;
  }
};
