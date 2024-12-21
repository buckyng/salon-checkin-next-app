import { toZonedTime, format as tzFormat } from 'date-fns-tz';

export const formatLocalTime = (dateString: string, format = 'HH:mm') => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const localTime = toZonedTime(dateString, timeZone);
    return tzFormat(localTime, format);
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};
